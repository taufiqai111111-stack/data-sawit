import React, { useState, useEffect } from 'react';
import { WeighbridgeTicket, TruckFleet, HarvestRecord } from '../types/palm';
import { PrintWeighbridgeTicket } from './PrintWeighbridgeTicket';
import { 
  Scale, 
  Search, 
  Download, 
  Printer, 
  Check, 
  RefreshCw, 
  TrendingDown, 
  Truck,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { formatKg, formatTanggalIndo, formatNumber } from '../utils/formatters';

interface WeighbridgeModuleProps {
  tickets: WeighbridgeTicket[];
  fleet: TruckFleet[];
  harvests: HarvestRecord[];
  onAddTicket: (newTicket: WeighbridgeTicket) => void;
  onUpdateTicket: (updated: WeighbridgeTicket) => void;
  onConvertToSale: (ticket: WeighbridgeTicket) => void;
}

export const WeighbridgeModule: React.FC<WeighbridgeModuleProps> = ({
  tickets,
  fleet,
  harvests,
  onAddTicket,
  onUpdateTicket,
  onConvertToSale,
}) => {
  // Live Weighbridge Terminal State
  const [liveScaleWeight, setLiveScaleWeight] = useState<number>(15480);
  const [scaleStable, setScaleStable] = useState<boolean>(true);
  const [terminalMode, setTerminalMode] = useState<'bruto' | 'tara'>('bruto');
  
  // Terminal Form Fields
  const [selectedTruckPlate, setSelectedTruckPlate] = useState<string>(fleet[1]?.platNomor || '');
  const [inputSpbNo, setInputSpbNo] = useState<string>('SPB-BSR/2026/0410');
  const [inputDriver, setInputDriver] = useState<string>('Hendra Gunawan');
  const [inputAfdeling, setInputAfdeling] = useState<string>('Afdeling I');
  const [inputBlok, setInputBlok] = useState<string>('Blok A-04');
  const [inputJanjang, setInputJanjang] = useState<number>(450);
  
  // Captured weights in terminal
  const [capturedBruto, setCapturedBruto] = useState<number>(15480);
  const [capturedTara, setCapturedTara] = useState<number>(6420);
  const [potonganTangkai, setPotonganTangkai] = useState<number>(110);
  const [potonganSampah, setPotonganSampah] = useState<number>(90);
  const [potonganMentah, setPotonganMentah] = useState<number>(50);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewTicketForPrint, setViewTicketForPrint] = useState<WeighbridgeTicket | null>(null);

  // Digital Scale slight fluctuation simulation for realism
  useEffect(() => {
    const timer = setInterval(() => {
      // Minor jitter +/- 10-20 kg simulating wind / sensor jitter
      setLiveScaleWeight((prev) => {
        const jitter = (Math.random() - 0.5) * 20;
        return Math.round(prev + jitter);
      });
      setScaleStable(true);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // Sync driver & afdeling when truck plate selected
  const handleSelectTruck = (plat: string) => {
    setSelectedTruckPlate(plat);
    const trk = fleet.find((t) => t.platNomor === plat);
    if (trk) {
      setInputDriver(trk.sopir);
      if (trk.noSpbAktif) setInputSpbNo(trk.noSpbAktif);
      if (trk.janjangMuat) setInputJanjang(trk.janjangMuat);
      if (trk.asalBlok) {
        const parts = trk.asalBlok.split('(');
        setInputBlok(parts[0]?.trim() || 'Blok A-04');
        setInputAfdeling(parts[1]?.replace(')', '').trim() || 'Afdeling I');
      }
    }
  };

  // Calculations
  const calculatedNetto1 = Math.max(0, capturedBruto - capturedTara);
  const totalPotonganKg = potonganTangkai + potonganSampah + potonganMentah;
  const calculatedNettoBersih = Math.max(0, calculatedNetto1 - totalPotonganKg);
  const refaksiPersen = calculatedNetto1 > 0 ? ((totalPotonganKg / calculatedNetto1) * 100).toFixed(2) : '0.00';
  const calculatedBjrAktual = inputJanjang > 0 ? calculatedNettoBersih / inputJanjang : 0;
  const estimasiBjr = 22.0;
  const deviasiBjr = calculatedBjrAktual - estimasiBjr;

  // Handle finalize weighbridge ticket
  const handleSaveWeighbridgeTicket = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    const newTicket: WeighbridgeTicket = {
      id: `WB-2026-10-${String(tickets.length + 92).padStart(4, '0')}`,
      tanggal: dateStr,
      waktuMasuk: '10:15',
      waktuKeluar: timeStr,
      noSpb: inputSpbNo,
      platNomor: selectedTruckPlate,
      sopir: inputDriver,
      afdelingAsal: inputAfdeling,
      blokAsal: inputBlok,
      jumlahJanjangSpb: inputJanjang,
      beratBrutoKg: capturedBruto,
      beratTaraKg: capturedTara,
      beratNetto1Kg: calculatedNetto1,
      refaksiPersen: parseFloat(refaksiPersen),
      potonganTangkaiKg: potonganTangkai,
      potonganSampahKg: potonganSampah,
      potonganMentahKg: potonganMentah,
      totalPotonganKg: totalPotonganKg,
      beratNettoBersihKg: calculatedNettoBersih,
      bjrAktual: calculatedBjrAktual,
      deviasiBjrKg: deviasiBjr,
      operatorTimbang: 'Rahmat Hidayat (WB-01)',
      namaPKS: 'PKS Tapung Sentosa',
      status: 'Divalidasi',
      statusPenjualan: 'Siap Jual',
      catatan: 'Timbang otomatis tersertifikasi digital',
    };

    onAddTicket(newTicket);
    setViewTicketForPrint(newTicket);
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.platNomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.noSpb.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sopir.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'ready' && t.statusPenjualan === 'Siap Jual') ||
      (filterStatus === 'sold' && t.statusPenjualan === 'Terjual');

    return matchesSearch && matchesStatus;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'No Tiket',
      'Tanggal',
      'No SPB',
      'Plat Truk',
      'Sopir',
      'Afdeling',
      'Janjang',
      'Bruto (kg)',
      'Tara (kg)',
      'Netto 1 (kg)',
      'Refaksi (kg)',
      'Netto Bersih (kg)',
      'BJR Aktual',
      'Status',
    ];

    const rows = filteredTickets.map((t) => [
      t.id,
      t.tanggal,
      t.noSpb,
      t.platNomor,
      t.sopir,
      t.afdelingAsal,
      t.jumlahJanjangSpb,
      t.beratBrutoKg,
      t.beratTaraKg,
      t.beratNetto1Kg,
      t.totalPotonganKg,
      t.beratNettoBersihKg,
      t.bjrAktual.toFixed(2),
      t.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_timbangan_sawit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Scale Indicator Terminal */}
      <div className="bg-stone-900 text-white rounded-xl border border-stone-800 p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Terminal Jembatan Timbang Digital PKS Tapung</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Manajemen Penimbangan Bruto & Tara TBS
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Platform Timbangan Elektronik 60 Ton (Avery Weigh-Tronix / Toledo 8142 kompatibel)
            </p>
          </div>

          {/* Digital 7-Segment Weight Display */}
          <div className="flex items-center gap-4 bg-stone-950 px-6 py-4 rounded-xl border border-stone-800">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold tracking-wider">
                  {scaleStable ? 'STABLE' : 'MOTION'}
                </span>
              </div>
              <div className="text-4xl lg:text-5xl font-mono font-bold text-emerald-400 tracking-wider tabular-nums">
                {formatNumber(liveScaleWeight)}
              </div>
              <div className="text-[11px] text-stone-400 font-mono">KILOGRAM (KG) · NET 0.00</div>
            </div>

            <div className="flex flex-col gap-2 pl-4 border-l border-stone-800">
              <button
                onClick={() => {
                  if (terminalMode === 'bruto') {
                    setCapturedBruto(liveScaleWeight);
                  } else {
                    setCapturedTara(liveScaleWeight);
                  }
                }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Ambil Berat</span>
              </button>
              <button
                onClick={() => setLiveScaleWeight(terminalMode === 'bruto' ? 15450 : 6400)}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Simulasi Truk Baru</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Weight Processing Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-2">
          {/* Step 1: Kendaraan & SPB */}
          <div className="bg-stone-800/60 p-3.5 rounded-lg border border-stone-700/60 space-y-2.5">
            <div className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Kendaraan & SPB</span>
            </div>
            <div>
              <label className="text-[11px] text-stone-400 block mb-1">Pilih Plat Truk:</label>
              <select
                value={selectedTruckPlate}
                onChange={(e) => handleSelectTruck(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                {fleet.map((t) => (
                  <option key={t.id} value={t.platNomor}>
                    {t.platNomor} - {t.sopir} ({t.status})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-stone-400 block mb-1">Nomor SPB Kebun:</label>
              <input
                type="text"
                value={inputSpbNo}
                onChange={(e) => setInputSpbNo(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-stone-400 block mb-1">Asal Afdeling:</label>
                <input
                  type="text"
                  value={inputAfdeling}
                  onChange={(e) => setInputAfdeling(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-md px-2 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-400 block mb-1">Jumlah Janjang:</label>
                <input
                  type="number"
                  value={inputJanjang}
                  onChange={(e) => setInputJanjang(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-md px-2 py-1 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Bruto & Tara Capture */}
          <div className="bg-stone-800/60 p-3.5 rounded-lg border border-stone-700/60 space-y-2.5">
            <div className="text-xs font-bold text-stone-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Hasil Timbang (kg)</span>
              </span>
              <div className="flex bg-stone-900 rounded p-0.5 text-[10px]">
                <button
                  onClick={() => setTerminalMode('bruto')}
                  className={`px-2 py-0.5 rounded ${terminalMode === 'bruto' ? 'bg-emerald-700 text-white' : 'text-stone-400'}`}
                >
                  Bruto
                </button>
                <button
                  onClick={() => setTerminalMode('tara')}
                  className={`px-2 py-0.5 rounded ${terminalMode === 'tara' ? 'bg-emerald-700 text-white' : 'text-stone-400'}`}
                >
                  Tara
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-stone-400 block mb-1">Berat Bruto (Truk + TBS):</label>
              <input
                type="number"
                value={capturedBruto}
                onChange={(e) => setCapturedBruto(Number(e.target.value))}
                className="w-full bg-stone-900 border border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] text-stone-400 block mb-1">Berat Tara (Truk Kosong):</label>
              <input
                type="number"
                value={capturedTara}
                onChange={(e) => setCapturedTara(Number(e.target.value))}
                className="w-full bg-stone-900 border border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold"
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-stone-400">Netto 1 (Kotor):</span>
              <span className="font-mono font-bold text-white text-sm">
                {formatKg(calculatedNetto1)}
              </span>
            </div>
          </div>

          {/* Step 3: Sortasi & Refaksi Potongan */}
          <div className="bg-stone-800/60 p-3.5 rounded-lg border border-stone-700/60 space-y-2">
            <div className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span>3. Potongan Sortasi / Refaksi</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-stone-400 block mb-0.5">Tangkai (kg):</label>
                <input
                  type="number"
                  value={potonganTangkai}
                  onChange={(e) => setPotonganTangkai(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-400 block mb-0.5">Sampah (kg):</label>
                <input
                  type="number"
                  value={potonganSampah}
                  onChange={(e) => setPotonganSampah(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-400 block mb-0.5">Mentah (kg):</label>
                <input
                  type="number"
                  value={potonganMentah}
                  onChange={(e) => setPotonganMentah(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 text-xs space-y-1 text-stone-400 border-t border-stone-700/60">
              <div className="flex justify-between">
                <span>Total Potongan:</span>
                <span className="font-mono text-amber-400 font-bold">-{formatKg(totalPotonganKg)}</span>
              </div>
              <div className="flex justify-between">
                <span>Refaksi (%):</span>
                <span className="font-mono text-white">{refaksiPersen}%</span>
              </div>
            </div>
          </div>

          {/* Step 4: Final Net & Save */}
          <div className="bg-emerald-950/60 p-3.5 rounded-lg border border-emerald-800/60 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-300">
                4. Netto Bersih Diterima
              </div>
              <div className="text-2xl font-mono font-bold text-white mt-2 tabular-nums">
                {formatKg(calculatedNettoBersih)}
              </div>
              <div className="text-[11px] text-emerald-200/80 mt-1 space-y-0.5">
                <div>BJR Aktual: <span className="font-bold text-white">{calculatedBjrAktual.toFixed(2)} kg</span></div>
                <div>Deviasi Kebun: <span className="font-bold text-white">{deviasiBjr >= 0 ? `+${deviasiBjr.toFixed(2)}` : deviasiBjr.toFixed(2)} kg</span></div>
              </div>
            </div>

            <button
              onClick={handleSaveWeighbridgeTicket}
              className="mt-3 w-full py-2 px-3 text-xs font-semibold text-stone-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan & Terbitkan Tiket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weighbridge Tickets Management Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900">
              Riwayat Tiket Jembatan Timbang
            </h3>
            <span className="text-xs font-semibold text-stone-500 font-mono">
              ({filteredTickets.length} Tiket)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Cari No Tiket, Plat, SPB..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 w-56"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-0.5 bg-stone-100 rounded-lg text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterStatus === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterStatus('ready')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterStatus === 'ready' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Siap Jual
              </button>
              <button
                onClick={() => setFilterStatus('sold')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterStatus === 'sold' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Terjual
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold">
              <tr>
                <th className="py-3 px-4">No. Tiket</th>
                <th className="py-3 px-3">Tanggal & Jam</th>
                <th className="py-3 px-3">Truk / Sopir</th>
                <th className="py-3 px-3">Asal Afdeling</th>
                <th className="py-3 px-3 text-right">Janjang SPB</th>
                <th className="py-3 px-3 text-right">Bruto (kg)</th>
                <th className="py-3 px-3 text-right">Tara (kg)</th>
                <th className="py-3 px-3 text-right">Potongan (kg)</th>
                <th className="py-3 px-3 text-right">Netto Bersih</th>
                <th className="py-3 px-3 text-right">BJR Aktual</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-stone-400">
                    Tidak ada data tiket timbangan yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">
                      {ticket.id}
                      <div className="text-[10px] text-stone-500 font-normal">
                        {ticket.noSpb}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                      <div>{formatTanggalIndo(ticket.tanggal)}</div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        {ticket.waktuMasuk} - {ticket.waktuKeluar}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-stone-900">{ticket.platNomor}</div>
                      <div className="text-stone-500">{ticket.sopir}</div>
                    </td>
                    <td className="py-3 px-3 text-stone-700">
                      {ticket.afdelingAsal}
                      <div className="text-[10px] text-stone-400">{ticket.blokAsal}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-800">
                      {ticket.jumlahJanjangSpb}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-700">
                      {formatNumber(ticket.beratBrutoKg)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-700">
                      {formatNumber(ticket.beratTaraKg)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-700 font-medium">
                      -{formatNumber(ticket.totalPotonganKg)}
                      <div className="text-[10px] text-stone-400 font-sans font-normal">
                        ({ticket.refaksiPersen}%)
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-emerald-800 text-sm">
                      {formatNumber(ticket.beratNettoBersihKg)} kg
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-800">
                      {ticket.bjrAktual.toFixed(2)} kg
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          ticket.statusPenjualan === 'Terjual'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {ticket.statusPenjualan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewTicketForPrint(ticket)}
                          title="Cetak Tiket Timbang"
                          className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {ticket.statusPenjualan === 'Siap Jual' && (
                          <button
                            onClick={() => onConvertToSale(ticket)}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors"
                          >
                            Jual TBS
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cetak Slip Timbang */}
      <PrintWeighbridgeTicket
        ticket={viewTicketForPrint}
        onClose={() => setViewTicketForPrint(null)}
      />
    </div>
  );
};
