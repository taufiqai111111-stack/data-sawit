import React, { useState } from 'react';
import { HarvestRecord, TruckFleet } from '../types/palm';
import { formatNumber, formatTon, formatTanggalIndo } from '../utils/formatters';
import { 
  TreePine, 
  Search, 
  Truck, 
  FileText, 
  Printer, 
  X, 
  Check, 
  MapPin, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

interface HarvestModuleProps {
  harvests: HarvestRecord[];
  fleet: TruckFleet[];
  onAddHarvestClick: () => void;
  onUpdateHarvest: (record: HarvestRecord) => void;
  onAssignTruck: (harvestId: string, truckId: string, spbNo: string) => void;
}

export const HarvestModule: React.FC<HarvestModuleProps> = ({
  harvests,
  fleet,
  onAddHarvestClick,
  onUpdateHarvest,
  onAssignTruck,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAfdeling, setSelectedAfdeling] = useState('all');
  const [assigningHarvest, setAssigningHarvest] = useState<HarvestRecord | null>(null);
  const [viewSpbHarvest, setViewSpbHarvest] = useState<HarvestRecord | null>(null);

  // Assign Truck form state
  const [selectedTruckId, setSelectedTruckId] = useState(fleet[0]?.id || '');
  const [customSpbNo, setCustomSpbNo] = useState(`SPB-BSR/2026/04${String(harvests.length + 12).padStart(2, '0')}`);

  // Filtering
  const filteredHarvests = harvests.filter((h) => {
    const matchesSearch =
      h.blok.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.tph.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.mandor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.noSpb && h.noSpb.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAfdeling =
      selectedAfdeling === 'all' || h.afdeling === selectedAfdeling;

    return matchesSearch && matchesAfdeling;
  });

  // Analytics totals
  const totalBunches = harvests.reduce((acc, h) => acc + h.jumlahJanjang, 0);
  const totalEstWeightKg = harvests.reduce((acc, h) => acc + h.estimasiTonaseKg, 0);
  const totalMatang = harvests.reduce((acc, h) => acc + h.kualitas.matang, 0);
  const ripePercentage = totalBunches > 0 ? ((totalMatang / totalBunches) * 100).toFixed(1) : '0';

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningHarvest) return;
    onAssignTruck(assigningHarvest.id, selectedTruckId, customSpbNo);
    setAssigningHarvest(null);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Total Hasil Panen (TBS)</div>
          <div className="text-xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
            {formatNumber(totalBunches)} Janjang
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Estimasi: {formatTon(totalEstWeightKg)}</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Kualitas Buah Matang Prima</div>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">
            {ripePercentage}%
          </div>
          <div className="text-[11px] text-stone-500 mt-1">{formatNumber(totalMatang)} janjang masak optimal</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Titik Kumpul TPH Aktif</div>
          <div className="text-xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
            {new Set(harvests.map((h) => h.tph)).size} Lokasi TPH
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Tersebar di 3 Afdeling utama</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">TBS Menunggu Angkut di TPH</div>
          <div className="text-xl font-bold font-mono text-amber-800 mt-1 tabular-nums">
            {harvests.filter((h) => h.status === 'Di TPH').length} Batch
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Prioritas muat armada berikutnya</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        {/* Toolbar */}
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900">
              Data Panen & Penumpukan TBS di TPH
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              ({filteredHarvests.length} Batch)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Cari Blok, TPH, Mandor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 w-52"
              />
            </div>

            {/* Afdeling Selector */}
            <div className="flex items-center p-0.5 bg-stone-100 rounded-lg text-xs">
              <button
                onClick={() => setSelectedAfdeling('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedAfdeling === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedAfdeling('Afdeling I')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedAfdeling === 'Afdeling I' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Afd I
              </button>
              <button
                onClick={() => setSelectedAfdeling('Afdeling II')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedAfdeling === 'Afdeling II' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Afd II
              </button>
              <button
                onClick={() => setSelectedAfdeling('Afdeling III')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedAfdeling === 'Afdeling III' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Afd III
              </button>
            </div>

            <button
              onClick={onAddHarvestClick}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
            >
              <TreePine className="w-3.5 h-3.5" />
              <span>Input Panen</span>
            </button>
          </div>
        </div>

        {/* Harvest Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold">
              <tr>
                <th className="py-3 px-4">ID / Tanggal</th>
                <th className="py-3 px-3">Afdeling & Lokasi</th>
                <th className="py-3 px-3">Mandor & Pemanen</th>
                <th className="py-3 px-3 text-right">Janjang (TBS)</th>
                <th className="py-3 px-3 text-right">BJR Estimasi</th>
                <th className="py-3 px-3 text-right">Estimasi Berat</th>
                <th className="py-3 px-3">Grading Kualitas</th>
                <th className="py-3 px-3">No. SPB</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredHarvests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-stone-400">
                    Tidak ada catatan hasil panen yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredHarvests.map((h) => (
                  <tr key={h.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">
                      {h.id}
                      <div className="text-[10px] text-stone-500 font-normal">
                        {formatTanggalIndo(h.tanggal)} · {h.waktu}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-900">{h.afdeling}</div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        {h.blok} / {h.tph}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-stone-700">
                      <div className="font-medium text-stone-900">{h.mandor}</div>
                      <div className="text-[10px] text-stone-500">{h.pemanen}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-stone-900">
                      {formatNumber(h.jumlahJanjang)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-700">
                      {h.bjrEstimasi.toFixed(1)} kg
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-emerald-800">
                      {formatNumber(h.estimasiTonaseKg)} kg
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[11px] text-stone-600">
                        <span className="text-emerald-700 font-bold">{h.kualitas.matang} masak</span> · 
                        <span className="text-amber-700"> {h.kualitas.mengkal} mengkal</span> · 
                        <span className="text-red-700"> {h.kualitas.mentah} mentah</span>
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Sampah/Tangkai: {h.kualitas.tangkaiPanjang} janjang
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-700">
                      {h.noSpb ? (
                        <button
                          onClick={() => setViewSpbHarvest(h)}
                          className="hover:underline text-emerald-800 font-semibold"
                        >
                          {h.noSpb}
                        </button>
                      ) : (
                        <span className="text-stone-400 italic">Belum terbit</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          h.status === 'Di TPH'
                            ? 'bg-stone-100 text-stone-700'
                            : h.status === 'Proses Muat'
                            ? 'bg-amber-50 text-amber-800'
                            : h.status === 'Diangkut'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {h.status === 'Di TPH' ? (
                        <button
                          onClick={() => setAssigningHarvest(h)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors inline-flex items-center gap-1 shadow-xs"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Kirim Truk</span>
                        </button>
                      ) : h.noSpb ? (
                        <button
                          onClick={() => setViewSpbHarvest(h)}
                          className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="text-[11px]">SPB</span>
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tugaskan Truk & Buat SPB */}
      {assigningHarvest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-800" />
                <h3 className="text-sm font-bold text-stone-900">
                  Tugaskan Truk & Buat Surat Pengantar Buah (SPB)
                </h3>
              </div>
              <button
                onClick={() => setAssigningHarvest(null)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">Batch Panen:</span>
                  <span className="font-bold font-mono text-stone-900">{assigningHarvest.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Lokasi:</span>
                  <span className="font-semibold text-stone-800">
                    {assigningHarvest.afdeling} - {assigningHarvest.blok} ({assigningHarvest.tph})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Muatan TBS:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {assigningHarvest.jumlahJanjang} Janjang (~{formatNumber(assigningHarvest.estimasiTonaseKg)} kg)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Nomor SPB Digital:
                </label>
                <input
                  type="text"
                  value={customSpbNo}
                  onChange={(e) => setCustomSpbNo(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 font-mono text-stone-900 focus:outline-none focus:border-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Pilih Armada Truk Pengangkut:
                </label>
                <select
                  value={selectedTruckId}
                  onChange={(e) => setSelectedTruckId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:border-emerald-700 font-mono"
                >
                  {fleet.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.platNomor} - Sopir: {t.sopir} (Kapasitas: {t.kapasitasKg / 1000} Ton) - Status: {t.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
                ℹ️ Setelah diterbitkan, armada truk akan mulai pelacakan rute secara real-time dari {assigningHarvest.tph} menuju Jembatan Timbang Pabrik Kelapa Sawit (PKS).
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setAssigningHarvest(null)}
                  className="px-4 py-2 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg font-semibold shadow-xs"
                >
                  Terbitkan SPB & Mulai Angkut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cetak Surat Pengantar Buah (SPB) */}
      {viewSpbHarvest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
              <span className="text-sm font-bold text-stone-900">
                Surat Pengantar Buah (SPB) Kelapa Sawit
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-900 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak SPB</span>
                </button>
                <button
                  onClick={() => setViewSpbHarvest(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div id="printable-ticket" className="p-8 bg-white font-mono text-xs text-stone-800">
              <div className="text-center border-b-2 border-dashed border-stone-300 pb-3 mb-4">
                <h1 className="text-base font-bold text-stone-900">ESTATE BUKIT SAWIT RAYA</h1>
                <p className="text-[10px] text-stone-500 font-sans">
                  SURAT PENGANTAR BUAH (SPB) KELAPA SAWIT RESMI
                </p>
                <div className="mt-2 inline-block px-3 py-1 border border-stone-800 font-bold text-xs">
                  NO. SPB: {viewSpbHarvest.noSpb}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-2 mb-4 pb-4 border-b border-stone-200">
                <div className="flex justify-between">
                  <span className="text-stone-500">TANGGAL:</span>
                  <span>{formatTanggalIndo(viewSpbHarvest.tanggal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">JAM MUAT:</span>
                  <span>{viewSpbHarvest.waktu} WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">AFDELING / BLOK:</span>
                  <span>{viewSpbHarvest.afdeling} - {viewSpbHarvest.blok}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">TITIK KUMPUL:</span>
                  <span>{viewSpbHarvest.tph}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">MANDOR PANEN:</span>
                  <span>{viewSpbHarvest.mandor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">PEMENAN:</span>
                  <span>{viewSpbHarvest.pemanen}</span>
                </div>
              </div>

              <div className="mb-4 pb-4 border-b border-stone-200">
                <div className="font-bold mb-2">RINCIAN MUATAN TBS:</div>
                <div className="flex justify-between py-1">
                  <span>Jumlah Janjang Panen:</span>
                  <span className="font-bold tabular-nums">{viewSpbHarvest.jumlahJanjang} Janjang</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Estimasi BJR Kebun:</span>
                  <span className="tabular-nums">{viewSpbHarvest.bjrEstimasi} kg / janjang</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Estimasi Berat Total:</span>
                  <span className="font-bold text-emerald-900 tabular-nums">
                    {formatNumber(viewSpbHarvest.estimasiTonaseKg)} kg
                  </span>
                </div>
                <div className="flex justify-between py-1 text-stone-500 text-[11px]">
                  <span>Grading TPH:</span>
                  <span>
                    Masak: {viewSpbHarvest.kualitas.matang} · Mengkal: {viewSpbHarvest.kualitas.mengkal} · Mentah: {viewSpbHarvest.kualitas.mentah}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 text-center text-[11px] pt-4 mt-6 border-t border-stone-300">
                <div>
                  <p className="text-stone-500 mb-10">Mandor Panen,</p>
                  <p className="font-bold underline">{viewSpbHarvest.mandor}</p>
                </div>
                <div>
                  <p className="text-stone-500 mb-10">Sopir Angkut,</p>
                  <p className="font-bold underline">Sopir Armada</p>
                </div>
                <div>
                  <p className="text-stone-500 mb-10">Pos Security Gate,</p>
                  <p className="font-bold underline">Petugas Keamanan</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setViewSpbHarvest(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
