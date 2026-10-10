import React, { useState } from 'react';
import { SalesRecord, WeighbridgeTicket } from '../types/palm';
import { formatRupiah, formatKg, formatTon, formatTanggalIndo } from '../utils/formatters';
import { CURRENT_TBS_BENCHMARK_PRICE } from '../data/mockData';
import { 
  DollarSign, 
  Plus, 
  FileText, 
  Printer, 
  Search, 
  CheckCircle, 
  Clock, 
  Building2,
  X
} from 'lucide-react';

interface SalesModuleProps {
  sales: SalesRecord[];
  tickets: WeighbridgeTicket[];
  onAddSale: (newSale: SalesRecord) => void;
  onUpdateSale: (updated: SalesRecord) => void;
  preselectedTicketId?: string | null;
}

export const SalesModule: React.FC<SalesModuleProps> = ({
  sales,
  tickets,
  onAddSale,
  onUpdateSale,
  preselectedTicketId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(!!preselectedTicketId);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<SalesRecord | null>(null);

  // Form states
  const readyTickets = tickets.filter((t) => t.statusPenjualan === 'Siap Jual');
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>(
    preselectedTicketId ? [preselectedTicketId] : readyTickets[0] ? [readyTickets[0].id] : []
  );
  const [buyerName, setBuyerName] = useState('PT Palma Agro Sejahtera (PKS Tapung)');
  const [contractNo, setContractNo] = useState(`KTR-TBS/PAS/X/2026-${String(sales.length + 10).padStart(2, '0')}`);
  const [pricePerKg, setPricePerKg] = useState<number>(CURRENT_TBS_BENCHMARK_PRICE);
  const [paymentMethod, setPaymentMethod] = useState<'Transfer Bank Mandiri' | 'BCA Virtual Account' | 'Giro Bilyet' | 'Tunai'>('Transfer Bank Mandiri');
  const [buyerPic, setBuyerPic] = useState('Ir. Hendro Wicaksono');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [notes, setNotes] = useState('TBS kualitas prima standar rendemen > 21%');

  // Compute total selected weight
  const selectedTicketsData = tickets.filter((t) => selectedTicketIds.includes(t.id));
  const totalWeightKg = selectedTicketsData.reduce((acc, curr) => acc + curr.beratNettoBersihKg, 0);
  const totalAmountRp = totalWeightKg * pricePerKg;

  // Toggle ticket selection
  const handleToggleTicket = (ticketId: string) => {
    if (selectedTicketIds.includes(ticketId)) {
      setSelectedTicketIds(selectedTicketIds.filter((id) => id !== ticketId));
    } else {
      setSelectedTicketIds([...selectedTicketIds, ticketId]);
    }
  };

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTicketIds.length === 0 || totalWeightKg <= 0) {
      alert('Pilih minimal satu tiket timbangan yang siap dijual.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newSale: SalesRecord = {
      id: `INV-TBS-2026/${String(sales.length + 40).padStart(3, '0')}`,
      tanggal: todayStr,
      pembeli: buyerName,
      kontrakNo: contractNo,
      tiketTimbangIds: selectedTicketIds,
      totalNettoKg: totalWeightKg,
      hargaPerKg: pricePerKg,
      totalNilaiRp: totalAmountRp,
      ppnRp: 0,
      totalTagihanRp: totalAmountRp,
      statusPembayaran: 'Lunas',
      metodePembayaran: paymentMethod,
      jatuhTempo: dueDate,
      picPembeli: buyerPic,
      catatan: notes,
    };

    onAddSale(newSale);
    setIsAddModalOpen(false);
    setSelectedInvoiceForPrint(newSale);
  };

  // Filtered sales
  const filteredSales = sales.filter((s) => {
    return (
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pembeli.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.kontrakNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Analytics totals
  const totalRevenueRp = sales.reduce((acc, curr) => acc + curr.totalTagihanRp, 0);
  const totalWeightSoldKg = sales.reduce((acc, curr) => acc + curr.totalNettoKg, 0);
  const averagePriceKg = totalWeightSoldKg > 0 ? totalRevenueRp / totalWeightSoldKg : 0;

  return (
    <div className="space-y-6">
      {/* Sales KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Total Nilai Penjualan TBS</div>
          <div className="text-xl font-bold font-mono text-emerald-900 mt-1 tabular-nums">
            {formatRupiah(totalRevenueRp)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Akumulasi penerimaan kas penjualan</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Total Volume TBS Terjual</div>
          <div className="text-xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
            {formatTon(totalWeightSoldKg)}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">{formatKg(totalWeightSoldKg)} netto bersih</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Rata-rata Harga Realisasi</div>
          <div className="text-xl font-bold font-mono text-stone-900 mt-1 tabular-nums">
            {formatRupiah(averagePriceKg)} / kg
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Benchmark Disbun: Rp {CURRENT_TBS_BENCHMARK_PRICE}/kg</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Tiket Siap Jual (Gudang/PKS)</div>
          <div className="text-xl font-bold font-mono text-amber-800 mt-1 tabular-nums">
            {readyTickets.length} Tiket
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {formatTon(readyTickets.reduce((a, b) => a + b.beratNettoBersihKg, 0))} siap difakturkan
          </div>
        </div>
      </div>

      {/* Main Table & Actions */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900">
              Daftar Faktur & Penjualan TBS
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              ({filteredSales.length} Faktur)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Cari Faktur, Pembeli, Kontrak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-600 w-60"
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Faktur Penjualan</span>
            </button>
          </div>
        </div>

        {/* Sales Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold">
              <tr>
                <th className="py-3 px-4">No. Faktur</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Pembeli / Pabrik</th>
                <th className="py-3 px-3">No. Kontrak</th>
                <th className="py-3 px-3 text-right">Volume Netto</th>
                <th className="py-3 px-3 text-right">Harga / kg</th>
                <th className="py-3 px-3 text-right">Total Transaksi</th>
                <th className="py-3 px-3">Metode Bayar</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-stone-400">
                    Belum ada data transaksi penjualan.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">
                      {sale.id}
                      <div className="text-[10px] text-stone-400 font-normal">
                        {sale.tiketTimbangIds.length} Tiket Timbang
                      </div>
                    </td>
                    <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                      {formatTanggalIndo(sale.tanggal)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-900">{sale.pembeli}</div>
                      <div className="text-[10px] text-stone-500">PIC: {sale.picPembeli}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-700">
                      {sale.kontrakNo}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-stone-900">
                      {formatKg(sale.totalNettoKg)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-stone-700">
                      {formatRupiah(sale.hargaPerKg)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-emerald-800 text-sm">
                      {formatRupiah(sale.totalTagihanRp)}
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {sale.metodePembayaran}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          sale.statusPembayaran === 'Lunas'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {sale.statusPembayaran}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedInvoiceForPrint(sale)}
                        title="Cetak Kwitansi & Faktur"
                        className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Kwitansi</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat Faktur Penjualan Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-800" />
                <h3 className="text-sm font-bold text-stone-900">
                  Buat Faktur & Kontrak Penjualan TBS
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="p-6 space-y-4 text-xs">
              {/* Buyer & Contract Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Nama Pembeli / PKS Rekanan:
                  </label>
                  <select
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                  >
                    <option value="PT Palma Agro Sejahtera (PKS Tapung)">PT Palma Agro Sejahtera (PKS Tapung)</option>
                    <option value="PT Sawit Makmur Abadi (PKS Riau Utama)">PT Sawit Makmur Abadi (PKS Riau Utama)</option>
                    <option value="PT Astra Agro Lestari Tbk - PKS Tapung">PT Astra Agro Lestari Tbk - PKS Tapung</option>
                    <option value="PKS Mandiri Sejahtera Mandau">PKS Mandiri Sejahtera Mandau</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Nomor Kontrak Penjualan:
                  </label>
                  <input
                    type="text"
                    value={contractNo}
                    onChange={(e) => setContractNo(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              {/* Price & PIC */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Harga TBS per kg (Rp):
                  </label>
                  <input
                    type="number"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-emerald-800 focus:outline-none focus:border-emerald-600"
                    required
                  />
                  <span className="text-[10px] text-stone-500">Harga acuan Disbun: Rp {CURRENT_TBS_BENCHMARK_PRICE}</span>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    PIC / Penerima Pembeli:
                  </label>
                  <input
                    type="text"
                    value={buyerPic}
                    onChange={(e) => setBuyerPic(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Metode Pembayaran:
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                    <option value="BCA Virtual Account">BCA Virtual Account</option>
                    <option value="Giro Bilyet">Giro Bilyet</option>
                    <option value="Tunai">Tunai Kasir</option>
                  </select>
                </div>
              </div>

              {/* Select Weighbridge Tickets to Include */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1.5">
                  Pilih Tiket Timbang yang Masuk Faktur ({selectedTicketIds.length} dipilih):
                </label>
                <div className="border border-stone-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-stone-100 bg-stone-50/50">
                  {tickets.map((t) => {
                    const isSelected = selectedTicketIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTicket(t.id)}
                        className={`p-2 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-50 text-emerald-900 font-medium' : 'hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-emerald-700 focus:ring-0"
                          />
                          <span className="font-mono font-bold">{t.id}</span>
                          <span className="text-stone-500">· {t.platNomor}</span>
                          <span className="text-stone-500">· {t.afdelingAsal}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold">{formatKg(t.beratNettoBersihKg)}</span>
                          <span className="text-stone-400 text-[10px] block">{t.statusPenjualan}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transaction Summary Card */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex justify-between text-stone-700">
                  <span>Total Volume Netto Bersih:</span>
                  <span className="font-mono font-bold text-sm text-stone-900 tabular-nums">
                    {formatKg(totalWeightKg)} ({formatTon(totalWeightKg)})
                  </span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Harga Kontrak:</span>
                  <span className="font-mono tabular-nums">{formatRupiah(pricePerKg)} / kg</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-emerald-900">
                  <span className="font-bold">Total Nilai Tagihan:</span>
                  <span className="text-xl font-mono font-bold tabular-nums">
                    {formatRupiah(totalAmountRp)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors font-semibold shadow-xs"
                >
                  Terbitkan Faktur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kwitansi / Print Invoice */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
              <span className="text-sm font-bold text-stone-900">
                Kwitansi & Faktur Penjualan TBS
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-900 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div id="printable-ticket" className="p-8 bg-white font-mono text-xs text-stone-800">
              <div className="text-center border-b-2 border-dashed border-stone-300 pb-3 mb-4">
                <h1 className="text-base font-bold text-stone-900">
                  ESTATE BUKIT SAWIT RAYA
                </h1>
                <p className="text-[10px] text-stone-500 font-sans">
                  DIVISI KOMERSIAL & PENJUALAN TBS KELAPA SAWIT
                </p>
                <div className="mt-2 inline-block px-3 py-1 border border-stone-800 font-bold text-xs">
                  FAKTUR PENJUALAN RESMI: {selectedInvoiceForPrint.id}
                </div>
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-stone-200">
                <div className="flex justify-between">
                  <span className="text-stone-500">TANGGAL TRANSAKSI:</span>
                  <span>{formatTanggalIndo(selectedInvoiceForPrint.tanggal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">PEMBELI / PKS:</span>
                  <span className="font-bold">{selectedInvoiceForPrint.pembeli}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">NO. KONTRAK:</span>
                  <span>{selectedInvoiceForPrint.kontrakNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">PIC PEMBELI:</span>
                  <span>{selectedInvoiceForPrint.picPembeli}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">METODE PEMBAYARAN:</span>
                  <span>{selectedInvoiceForPrint.metodePembayaran}</span>
                </div>
              </div>

              <div className="mb-4 pb-4 border-b border-stone-200">
                <div className="font-bold mb-2">RINCIAN PENJUALAN:</div>
                <div className="flex justify-between py-1">
                  <span>Volume Netto Bersih Diterima:</span>
                  <span className="font-bold tabular-nums">{formatKg(selectedInvoiceForPrint.totalNettoKg)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Harga Kontrak per kg:</span>
                  <span className="tabular-nums">{formatRupiah(selectedInvoiceForPrint.hargaPerKg)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-dashed border-stone-300 font-bold text-sm text-stone-900">
                  <span>TOTAL PEMBAYARAN:</span>
                  <span className="font-mono text-emerald-900 tabular-nums">
                    {formatRupiah(selectedInvoiceForPrint.totalTagihanRp)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 text-center text-[11px] pt-4 mt-6 border-t border-stone-300">
                <div>
                  <p className="text-stone-500 mb-10">Pihak Pembeli (PKS),</p>
                  <p className="font-bold underline">{selectedInvoiceForPrint.picPembeli}</p>
                </div>
                <div>
                  <p className="text-stone-500 mb-10">Bagian Keuangan Kebun,</p>
                  <p className="font-bold underline">Hj. Ratna Sari, S.E.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedInvoiceForPrint(null)}
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
