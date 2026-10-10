import React from 'react';
import { HarvestRecord, TruckFleet, WeighbridgeTicket, SalesRecord } from '../types/palm';
import { formatRupiah, formatKg, formatTon, formatNumber, formatTanggalIndo } from '../utils/formatters';
import { 
  TreePine, 
  Truck, 
  Scale, 
  DollarSign, 
  ArrowUpRight, 
  ArrowRight,
  ShieldCheck, 
  AlertTriangle,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface DashboardOverviewProps {
  harvests: HarvestRecord[];
  fleet: TruckFleet[];
  tickets: WeighbridgeTicket[];
  sales: SalesRecord[];
  onNavigateTab: (tab: 'harvest' | 'tracking' | 'weighbridge' | 'sales') => void;
  onOpenAddHarvest: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  harvests,
  fleet,
  tickets,
  sales,
  onNavigateTab,
  onOpenAddHarvest,
}) => {
  // Aggregate KPIs
  const totalHarvestBunches = harvests.reduce((acc, h) => acc + h.jumlahJanjang, 0);
  const totalHarvestEstKg = harvests.reduce((acc, h) => acc + h.estimasiTonaseKg, 0);
  const totalWeighedNettoKg = tickets.reduce((acc, t) => acc + t.beratNettoBersihKg, 0);
  const totalRevenueRp = sales.reduce((acc, s) => acc + s.totalTagihanRp, 0);

  // Average refaction %
  const totalDeductionsKg = tickets.reduce((acc, t) => acc + t.totalPotonganKg, 0);
  const totalGrossNetto1Kg = tickets.reduce((acc, t) => acc + t.beratNetto1Kg, 0);
  const avgRefaksiPct = totalGrossNetto1Kg > 0 ? ((totalDeductionsKg / totalGrossNetto1Kg) * 100).toFixed(2) : '2.4';

  // Trucks in transit
  const trucksInTransit = fleet.filter((t) => t.status === 'Perjalanan ke PKS' || t.status === 'Antrean Timbang').length;

  return (
    <div className="space-y-6">
      {/* Hero Banner with Authentic Visuals */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 shadow-sm text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_palm_plantation_1791622383847.jpg"
            alt="Perkebunan Kelapa Sawit"
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-4 backdrop-blur-xs">
            <TreePine className="w-3.5 h-3.5" />
            <span>Sistem Rantai Pasok Sawit Terintegrasi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3 text-balance">
            Monitoring Panen, Pelacakan Armada & Timbangan Sawit
          </h1>

          <p className="text-sm text-stone-300 mb-6 leading-relaxed max-w-2xl">
            Pantau arus Tandan Buah Segar (TBS) mulai dari afdeling panen di kebun, pergerakan armada truk secara real-time via GPS, verifikasi berat jembatan timbang PKS (Bruto/Tara), hingga penyelesaian penjualan dan penerbitan faktur.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddHarvest}
              className="px-4 py-2.5 text-xs font-semibold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <span>+ Catat Panen Baru</span>
            </button>
            <button
              onClick={() => onNavigateTab('tracking')}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors inline-flex items-center gap-1.5 backdrop-blur-xs"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Pantau Peta Armada ({fleet.length} Truk)</span>
            </button>
            <button
              onClick={() => onNavigateTab('weighbridge')}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors inline-flex items-center gap-1.5 backdrop-blur-xs"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Terminal Timbangan PKS</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Panen */}
        <div 
          onClick={() => onNavigateTab('harvest')}
          className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-emerald-700/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Hasil Panen TBS</span>
            <TreePine className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-2 tabular-nums">
            {formatNumber(totalHarvestBunches)} <span className="text-xs font-sans font-normal text-stone-500">Janjang</span>
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
            <span>Estimasi: {formatTon(totalHarvestEstKg)}</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Armada Aktif */}
        <div 
          onClick={() => onNavigateTab('tracking')}
          className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-emerald-700/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Armada Bergerak</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-2 tabular-nums">
            {trucksInTransit} <span className="text-xs font-sans font-normal text-stone-500">Truk On-Duty</span>
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
            <span>Total {fleet.length} armada terdaftar</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: Netto Timbangan PKS */}
        <div 
          onClick={() => onNavigateTab('weighbridge')}
          className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-emerald-700/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Netto Timbang Diterima</span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-2 tabular-nums">
            {formatTon(totalWeighedNettoKg)}
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
            <span>Rata-rata Refaksi: {avgRefaksiPct}%</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 4: Penjualan */}
        <div 
          onClick={() => onNavigateTab('sales')}
          className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-emerald-700/50 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Realisasi Penjualan</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-900 mt-2 tabular-nums">
            {formatRupiah(totalRevenueRp)}
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
            <span>{sales.length} transaksi selesai</span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* 4-Step Supply Chain Pipeline Flow */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
          Alur Operasional Rantai Pasok Sawit (Kebun → PKS → Penjualan)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div 
            onClick={() => onNavigateTab('harvest')}
            className="p-4 rounded-xl border border-stone-200 hover:border-emerald-600 bg-stone-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center font-mono">
                01
              </span>
              <span className="text-[11px] font-semibold text-emerald-700">Kebun</span>
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Panen & TPH</h3>
            <p className="text-xs text-stone-500 mt-1">
              Catat janjang di Tempat Pengumpulan Hasil, grading masak/mentah, terbitkan SPB.
            </p>
            <div className="mt-3 text-xs font-mono font-bold text-stone-700">
              {harvests.filter((h) => h.status === 'Di TPH').length} Batch Menunggu
            </div>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => onNavigateTab('tracking')}
            className="p-4 rounded-xl border border-stone-200 hover:border-blue-600 bg-stone-50/50 hover:bg-blue-50/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center font-mono">
                02
              </span>
              <span className="text-[11px] font-semibold text-blue-700">Logistik</span>
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Pelacakan Live GPS</h3>
            <p className="text-xs text-stone-500 mt-1">
              Pantau armada truk di rute estate jalan tanah ke jalan poros raya secara real-time.
            </p>
            <div className="mt-3 text-xs font-mono font-bold text-stone-700">
              {fleet.filter((f) => f.status === 'Perjalanan ke PKS').length} Armada di Perjalanan
            </div>
          </div>

          {/* Step 3 */}
          <div 
            onClick={() => onNavigateTab('weighbridge')}
            className="p-4 rounded-xl border border-stone-200 hover:border-amber-600 bg-stone-50/50 hover:bg-amber-50/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center font-mono">
                03
              </span>
              <span className="text-[11px] font-semibold text-amber-700">Pabrik PKS</span>
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Jembatan Timbang</h3>
            <p className="text-xs text-stone-500 mt-1">
              Timbang Bruto, Tara, hitung sortasi refaksi, validasi BJR aktual & cetak tiket timbang.
            </p>
            <div className="mt-3 text-xs font-mono font-bold text-stone-700">
              {tickets.filter((t) => t.statusPenjualan === 'Siap Jual').length} Tiket Siap Jual
            </div>
          </div>

          {/* Step 4 */}
          <div 
            onClick={() => onNavigateTab('sales')}
            className="p-4 rounded-xl border border-stone-200 hover:border-emerald-600 bg-stone-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center font-mono">
                04
              </span>
              <span className="text-[11px] font-semibold text-emerald-700">Komersial</span>
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Penjualan TBS</h3>
            <p className="text-xs text-stone-500 mt-1">
              Faktur penjualan resmi, kalkulasi nilai transaksi per kg, dan penyelesaian pembayaran.
            </p>
            <div className="mt-3 text-xs font-mono font-bold text-stone-700">
              {formatRupiah(totalRevenueRp)} Terbayar
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Active Weighbridge Tickets & Active Fleets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Weighbridge Tickets */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Tiket Timbangan Terakhir</h3>
              <p className="text-xs text-stone-500">Hasil verifikasi timbangan bruto & tara pabrik</p>
            </div>
            <button
              onClick={() => onNavigateTab('weighbridge')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
            >
              <span>Kelola Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100 mt-3">
            {tickets.slice(0, 3).map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono font-bold text-stone-900">{t.id}</div>
                  <div className="text-stone-500 mt-0.5">
                    {t.platNomor} · {t.afdelingAsal} ({t.blokAsal})
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    SPB: {t.noSpb} · Refaksi: {t.refaksiPersen}%
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-900 text-sm tabular-nums">
                    {formatKg(t.beratNettoBersihKg)}
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mt-1 ${
                    t.statusPenjualan === 'Terjual' ? 'bg-blue-50 text-blue-800' : 'bg-emerald-50 text-emerald-800'
                  }`}>
                    {t.statusPenjualan}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Fleet Tracking Snapshot */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Status Armada Angkutan</h3>
              <p className="text-xs text-stone-500">Telemetri kecepatan & estimasi waktu tiba (ETA)</p>
            </div>
            <button
              onClick={() => onNavigateTab('tracking')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
            >
              <span>Buka Peta Live</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100 mt-3">
            {fleet.map((trk) => (
              <div key={trk.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono font-bold text-stone-900 flex items-center gap-2">
                    <span>{trk.platNomor}</span>
                    <span className="text-[11px] font-sans font-normal text-stone-500">
                      ({trk.sopir})
                    </span>
                  </div>
                  <div className="text-stone-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>Tujuan: {trk.targetDestination}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-semibold text-stone-900 tabular-nums">
                    {trk.speedKmH} km/h
                  </div>
                  <div className="text-[11px] text-stone-500">
                    ETA: {trk.etaMenit} menit
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
