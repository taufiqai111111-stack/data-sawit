import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { TruckFleet, WaypointMarker } from '../types/palm';
import { WAYPOINTS } from '../data/mockData';
import { Play, Pause, RotateCcw, MapPin, Gauge, Compass, ShieldCheck, Phone, Navigation } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

interface TrackingMapProps {
  fleet: TruckFleet[];
  onUpdateFleet: (updatedFleet: TruckFleet[]) => void;
  onNavigateToWeighbridge: (truck: TruckFleet) => void;
}

export const TrackingMap: React.FC<TrackingMapProps> = ({
  fleet,
  onUpdateFleet,
  onNavigateToWeighbridge,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);
  const userGpsMarkerRef = useRef<L.Marker | null>(null);

  const [selectedTruckId, setSelectedTruckId] = useState<string>(fleet[0]?.id || 'trk-01');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [useDeviceGps, setUseDeviceGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const selectedTruck = fleet.find((t) => t.id === selectedTruckId) || fleet[0];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center map around estate & mill
    const map = L.map(mapContainerRef.current, {
      center: [0.592, 101.140],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Plot static Waypoints
    WAYPOINTS.forEach((wp: WaypointMarker) => {
      let iconColor = 'bg-stone-800';
      let iconSymbol = '📍';

      if (wp.tipe === 'kebun_tph') {
        iconColor = 'bg-emerald-600';
        iconSymbol = '🌴';
      } else if (wp.tipe === 'pos_security') {
        iconColor = 'bg-amber-600';
        iconSymbol = '🛡️';
      } else if (wp.tipe === 'timbangan_pks') {
        iconColor = 'bg-blue-600';
        iconSymbol = '⚖️';
      } else if (wp.tipe === 'loading_ramp') {
        iconColor = 'bg-purple-600';
        iconSymbol = '🏭';
      }

      const customIcon = L.divIcon({
        className: 'custom-wp-pin',
        html: `
          <div class="flex items-center justify-center w-8 h-8 ${iconColor} text-white rounded-full shadow-md border-2 border-white text-xs font-bold cursor-pointer">
            ${iconSymbol}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <strong style="color: #1c1917; font-size: 13px;">${wp.nama}</strong><br/>
          <span style="color: #78716c;">${wp.deskripsi}</span>
        </div>
      `);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync trucks on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    fleet.forEach((truck) => {
      const isFocused = truck.id === selectedTruckId;
      const truckIcon = L.divIcon({
        className: 'custom-truck-pin',
        html: `
          <div class="relative flex flex-col items-center">
            <div class="px-2 py-0.5 text-[10px] font-bold font-mono ${
              isFocused ? 'bg-amber-500 text-stone-900 ring-2 ring-amber-300' : 'bg-stone-900 text-white'
            } rounded shadow whitespace-nowrap mb-1">
              ${truck.platNomor}
            </div>
            <div class="w-9 h-9 ${
              isFocused ? 'bg-amber-500 text-stone-950' : 'bg-emerald-700 text-white'
            } rounded-full flex items-center justify-center shadow-lg border-2 border-white transform hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9"/>
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                <circle cx="17" cy="18" r="2"/>
                <circle cx="7" cy="18" r="2"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 46],
      });

      if (markersRef.current[truck.id]) {
        markersRef.current[truck.id].setLatLng([truck.currentLat, truck.currentLng]);
        markersRef.current[truck.id].setIcon(truckIcon);
      } else {
        const marker = L.marker([truck.currentLat, truck.currentLng], { icon: truckIcon }).addTo(map);
        marker.on('click', () => setSelectedTruckId(truck.id));
        markersRef.current[truck.id] = marker;
      }
    });

    // Update active route polyline
    if (selectedTruck && selectedTruck.historyRoute.length > 1) {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(selectedTruck.historyRoute);
      } else {
        polylineRef.current = L.polyline(selectedTruck.historyRoute, {
          color: '#10b981',
          weight: 4,
          opacity: 0.8,
          dashArray: '6, 8',
        }).addTo(map);
      }
    }
  }, [fleet, selectedTruckId, selectedTruck]);

  // Center map on selected truck
  const handleFocusTruck = useCallback((truckId: string) => {
    setSelectedTruckId(truckId);
    const target = fleet.find((t) => t.id === truckId);
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.setView([target.currentLat, target.currentLng], 14, {
        animate: true,
      });
    }
  }, [fleet]);

  // Simulation loop for live GPS movements
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onUpdateFleet(
        fleet.map((truck) => {
          if (truck.status === 'Memuat di Kebun') {
            return truck;
          }

          // Advance towards PKS weighbridge or loop back
          const pksTargetLat = 0.6015;
          const pksTargetLng = 101.1710;
          const kebunStartLat = 0.5840;
          const kebunStartLng = 101.1120;

          const step = 0.00035 * simSpeed;
          let newLat = truck.currentLat;
          let newLng = truck.currentLng;
          let newSpeed = 35 + Math.floor(Math.random() * 10);
          let newStatus: TruckFleet['status'] = truck.status;
          let newTarget = truck.targetDestination;
          let newEta = truck.etaMenit;
          let newJarak = truck.jarakKm;

          if (truck.status === 'Perjalanan ke PKS') {
            const dLat = pksTargetLat - truck.currentLat;
            const dLng = pksTargetLng - truck.currentLng;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);

            if (dist < 0.001) {
              // Arrived at weighbridge queue
              newStatus = 'Antrean Timbang';
              newSpeed = 5;
              newTarget = 'Jembatan Timbang PKS (Platform 1)';
              newEta = 2;
              newJarak = 0.1;
            } else {
              newLat += (dLat / dist) * step;
              newLng += (dLng / dist) * step;
              newEta = Math.max(1, Math.round(dist * 250));
              newJarak = Math.max(0.2, parseFloat((dist * 110).toFixed(1)));
            }
          } else if (truck.status === 'Antrean Timbang') {
            // Stay near weighbridge
            newSpeed = 2;
          } else if (truck.status === 'Bongkar di PKS') {
            newSpeed = 0;
          } else if (truck.status === 'Perjalanan Balik') {
            const dLat = kebunStartLat - truck.currentLat;
            const dLng = kebunStartLng - truck.currentLng;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);

            if (dist < 0.001) {
              newStatus = 'Memuat di Kebun';
              newSpeed = 0;
              newTarget = 'TPH 12 (Afdeling II)';
              newEta = 0;
            } else {
              newLat += (dLat / dist) * step;
              newLng += (dLng / dist) * step;
            }
          }

          const newPoint: [number, number] = [newLat, newLng];
          const updatedRoute: [number, number][] = (
            [...truck.historyRoute, newPoint] as [number, number][]
          ).slice(-30);

          return {
            ...truck,
            currentLat: newLat,
            currentLng: newLng,
            speedKmH: newSpeed,
            status: newStatus,
            targetDestination: newTarget,
            etaMenit: newEta,
            jarakKm: newJarak,
            historyRoute: updatedRoute,
          };
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, fleet, onUpdateFleet]);

  // Real Device Geolocation Support
  useEffect(() => {
    if (!useDeviceGps) {
      if (userGpsMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(userGpsMarkerRef.current);
        userGpsMarkerRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      setGpsError('Perangkat tidak mendukung Geolocation.');
      setUseDeviceGps(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setGpsError(null);

        const map = mapInstanceRef.current;
        if (map) {
          const userIcon = L.divIcon({
            className: 'custom-user-gps',
            html: `
              <div class="relative flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse">
                <div class="w-2 h-2 bg-white rounded-full"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          if (userGpsMarkerRef.current) {
            userGpsMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            userGpsMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
            userGpsMarkerRef.current.bindPopup('<b>Lokasi Anda Saat Ini</b>').openPopup();
          }
        }
      },
      (err) => {
        setGpsError(`Gagal mengambil GPS: ${err.message}`);
        setUseDeviceGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [useDeviceGps]);

  const handleResetSimulation = () => {
    onUpdateFleet(
      fleet.map((t, idx) => ({
        ...t,
        currentLat: WAYPOINTS[idx % 3].lat,
        currentLng: WAYPOINTS[idx % 3].lng,
        status: idx === 1 ? 'Antrean Timbang' : 'Perjalanan ke PKS',
        historyRoute: [[WAYPOINTS[idx % 3].lat, WAYPOINTS[idx % 3].lng]],
      }))
    );
  };

  return (
    <div className="space-y-4">
      {/* Control Strip */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isPlaying
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-emerald-800 text-white hover:bg-emerald-900'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Jeda Pelacakan</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Lanjutkan Live GPS</span>
              </>
            )}
          </button>

          <div className="flex items-center bg-stone-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setSimSpeed(1)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                simSpeed === 1 ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setSimSpeed(2)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                simSpeed === 2 ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              2x
            </button>
            <button
              onClick={() => setSimSpeed(5)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                simSpeed === 5 ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              5x
            </button>
          </div>

          <button
            onClick={handleResetSimulation}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Posisi</span>
          </button>
        </div>

        {/* Real Device GPS Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUseDeviceGps(!useDeviceGps)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              useDeviceGps
                ? 'bg-blue-50 border-blue-300 text-blue-800'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>{useDeviceGps ? 'GPS Perangkat Aktif' : 'Gunakan GPS Perangkat'}</span>
          </button>
          {gpsError && (
            <span className="text-xs text-red-600">{gpsError}</span>
          )}
        </div>
      </div>

      {/* Main Map & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Display (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col h-[600px] relative">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Map Waypoint Legend Badge Strip */}
          <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm border border-stone-200 p-2.5 rounded-lg shadow-sm text-xs space-y-1">
            <div className="font-semibold text-stone-900 text-[11px] mb-1">Legenda Titik Monitoring:</div>
            <div className="flex items-center gap-2 text-stone-600">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
              <span>TPH (Panen Kebun)</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <span className="w-3 h-3 rounded-full bg-amber-600 inline-block"></span>
              <span>Pos Keamanan / Cek SPB</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
              <span>Jembatan Timbang PKS</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span>
              <span>Loading Ramp Pabrik</span>
            </div>
          </div>
        </div>

        {/* Fleet List & Selected Telemetry (1 col) */}
        <div className="space-y-4">
          {/* Selected Truck Telemetry Card */}
          {selectedTruck && (
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <div className="text-xs text-stone-500 font-medium">Armada Terpilih</div>
                  <div className="text-base font-bold font-mono text-stone-900">
                    {selectedTruck.platNomor}
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                  {selectedTruck.status}
                </span>
              </div>

              <div className="py-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Sopir:</span>
                  <span className="font-medium text-stone-800">{selectedTruck.sopir}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Muatan Asal:</span>
                  <span className="font-medium text-stone-800">{selectedTruck.asalBlok || 'TPH Kebun'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">No. SPB:</span>
                  <span className="font-mono text-stone-800">{selectedTruck.noSpbAktif || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Jumlah Janjang:</span>
                  <span className="font-mono font-medium text-stone-800">
                    {selectedTruck.janjangMuat ? `${selectedTruck.janjangMuat} TBS` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Tujuan:</span>
                  <span className="font-medium text-stone-800 truncate max-w-[150px]">
                    {selectedTruck.targetDestination}
                  </span>
                </div>
              </div>

              {/* Real-time Telemetry Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                <div className="bg-stone-50 p-2 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500">
                    <Gauge className="w-3 h-3 text-stone-400" />
                    <span>Kecepatan</span>
                  </div>
                  <div className="text-base font-bold font-mono text-stone-900 mt-0.5">
                    {selectedTruck.speedKmH} <span className="text-xs font-normal text-stone-500">km/h</span>
                  </div>
                </div>
                <div className="bg-stone-50 p-2 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>Estimasi Tiba</span>
                  </div>
                  <div className="text-base font-bold font-mono text-stone-900 mt-0.5">
                    {selectedTruck.etaMenit} <span className="text-xs font-normal text-stone-500">mnt</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
                <button
                  onClick={() => onNavigateToWeighbridge(selectedTruck)}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Proses Timbang di PKS</span>
                </button>
                <a
                  href={`tel:${selectedTruck.kontakSopir}`}
                  className="w-full py-1.5 px-3 text-xs font-medium text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span>Kontak Sopir ({selectedTruck.kontakSopir})</span>
                </a>
              </div>
            </div>
          )}

          {/* Fleet Status List */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
              Daftar Armada Angkutan ({fleet.length})
            </h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {fleet.map((truck) => (
                <div
                  key={truck.id}
                  onClick={() => handleFocusTruck(truck.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    truck.id === selectedTruckId
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold text-stone-900">
                    <span>{truck.platNomor}</span>
                    <span className="font-sans text-[11px] font-normal text-stone-500">
                      {truck.speedKmH} km/h
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600 mt-1">
                    <span>{truck.sopir}</span>
                    <span className="text-[11px] text-emerald-800 font-medium">
                      {truck.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
