import React from 'react';
import { WeighbridgeTicket } from '../types/palm';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import { formatKg, formatTanggalIndo } from '../utils/formatters';

interface PrintWeighbridgeTicketProps {
  ticket: WeighbridgeTicket | null;
  onClose: () => void;
}

export const PrintWeighbridgeTicket: React.FC<PrintWeighbridgeTicketProps> = ({
  ticket,
  onClose,
}) => {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden my-8">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-stone-900">
              Slip Tiket Timbang Elektronik
            </span>
            <span className="text-xs text-stone-500 font-mono">
              #{ticket.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-900 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Tiket</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Area */}
        <div id="printable-ticket" className="p-8 bg-white font-mono text-xs text-stone-800">
          {/* Company / Mill Header */}
          <div className="text-center border-b-2 border-dashed border-stone-300 pb-4 mb-4">
            <h1 className="text-base font-bold text-stone-900 tracking-wider">
              {ticket.namaPKS.toUpperCase()}
            </h1>
            <p className="text-[11px] text-stone-500 font-sans mt-0.5">
              UNIT PENGOLAHAN KELAPA SAWIT & JEMBATAN TIMBANG OTOMATIS
            </p>
            <p className="text-[10px] text-stone-400 font-sans">
              Jl. Poros Industri Sawit Km. 18, Tapung, Riau | Telp: (0761) 883921
            </p>
            <div className="mt-2 inline-block px-3 py-1 border border-stone-800 font-bold text-xs">
              TIKET TIMBANG TBS (FRESH FRUIT BUNCHES)
            </div>
          </div>

          {/* Ticket Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4 pb-4 border-b border-dashed border-stone-300">
            <div className="flex justify-between">
              <span className="text-stone-500">NO. TIKET:</span>
              <span className="font-bold">{ticket.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">TANGGAL:</span>
              <span>{formatTanggalIndo(ticket.tanggal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">NO. SPB KEBUN:</span>
              <span className="font-bold">{ticket.noSpb}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">JAM MASUK / KELUAR:</span>
              <span>{ticket.waktuMasuk} / {ticket.waktuKeluar}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">NO. POLISI TRUK:</span>
              <span className="font-bold">{ticket.platNomor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">NAMA SOPIR:</span>
              <span>{ticket.sopir}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">ASAL KEBUN / BLOK:</span>
              <span>{ticket.afdelingAsal} - {ticket.blokAsal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">JANJANG SPB:</span>
              <span className="font-bold">{ticket.jumlahJanjangSpb} Janjang</span>
            </div>
          </div>

          {/* Weighbridge Values Table */}
          <div className="mb-4 pb-4 border-b-2 border-stone-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-300 text-stone-500 text-left">
                  <th className="py-1">URAIAN TIMBANGAN</th>
                  <th className="py-1 text-right">BERAT (KG)</th>
                  <th className="py-1 text-right">KETERANGAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="py-1.5 font-bold">1. BERAT BRUTO (KENDARAAN + TBS)</td>
                  <td className="py-1.5 text-right font-bold text-sm tabular-nums">
                    {formatKg(ticket.beratBrutoKg)}
                  </td>
                  <td className="py-1.5 text-right text-stone-500">Timbang Masuk</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-bold">2. BERAT TARA (KENDARAAN KOSONG)</td>
                  <td className="py-1.5 text-right font-bold text-sm tabular-nums">
                    {formatKg(ticket.beratTaraKg)}
                  </td>
                  <td className="py-1.5 text-right text-stone-500">Timbang Keluar</td>
                </tr>
                <tr className="bg-stone-50">
                  <td className="py-1.5 font-bold text-stone-900">BERAT NETTO 1 (BRUTO - TARA)</td>
                  <td className="py-1.5 text-right font-bold text-sm tabular-nums text-stone-900">
                    {formatKg(ticket.beratNetto1Kg)}
                  </td>
                  <td className="py-1.5 text-right text-stone-500">Netto Kotor</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sortasi & Refaksi Deductions */}
          <div className="mb-4 pb-4 border-b border-dashed border-stone-300">
            <div className="font-bold text-stone-900 mb-2">POTONGAN SORTASI / REFAKSI KUALITAS:</div>
            <div className="grid grid-cols-2 gap-y-1 text-stone-600 pl-2">
              <div className="flex justify-between">
                <span>- Potongan Tangkai Panjang:</span>
                <span className="tabular-nums font-semibold">-{ticket.potonganTangkaiKg} kg</span>
              </div>
              <div className="flex justify-between">
                <span>- Potongan Sampah / Pasir:</span>
                <span className="tabular-nums font-semibold">-{ticket.potonganSampahKg} kg</span>
              </div>
              <div className="flex justify-between">
                <span>- Potongan Buah Mentah / Busuk:</span>
                <span className="tabular-nums font-semibold">-{ticket.potonganMentahKg} kg</span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold">
                <span>TOTAL REFAKSI ({ticket.refaksiPersen}%):</span>
                <span className="tabular-nums">-{formatKg(ticket.totalPotonganKg)}</span>
              </div>
            </div>
          </div>

          {/* Final Net Weight Paid */}
          <div className="p-3 bg-stone-100 rounded border border-stone-300 flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-bold text-stone-900">BERAT BERSIH DITERIMA (NETTO AKHIR):</div>
              <div className="text-[11px] text-stone-600">
                BJR Aktual: <span className="font-bold">{ticket.bjrAktual.toFixed(2)} kg/janjang</span> · 
                Deviasi: <span className={ticket.deviasiBjrKg >= 0 ? 'text-emerald-700' : 'text-amber-700'}>
                  {ticket.deviasiBjrKg >= 0 ? `+${ticket.deviasiBjrKg.toFixed(2)}` : ticket.deviasiBjrKg.toFixed(2)} kg
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold font-mono text-emerald-900 tabular-nums">
                {formatKg(ticket.beratNettoBersihKg)}
              </div>
              <div className="text-[10px] text-stone-500 font-sans">Berat Pembayaran / Faktur</div>
            </div>
          </div>

          {/* Signatures 3 Columns */}
          <div className="grid grid-cols-3 text-center text-[11px] pt-4 mt-6 border-t border-stone-300">
            <div>
              <p className="text-stone-500 mb-12">Sopir Pengangkut,</p>
              <p className="font-bold underline">{ticket.sopir}</p>
            </div>
            <div>
              <p className="text-stone-500 mb-12">Petugas Sortasi TBS,</p>
              <p className="font-bold underline">Wawan Setiawan</p>
            </div>
            <div>
              <p className="text-stone-500 mb-12">Operator Timbangan,</p>
              <p className="font-bold underline">{ticket.operatorTimbang}</p>
            </div>
          </div>

          {/* Barcode Mock */}
          <div className="mt-6 pt-3 border-t border-dashed border-stone-300 flex items-center justify-between text-[10px] text-stone-400">
            <span>TERVERIFIKASI SISTEM OTOMASI SAWITTRACK CLOUD</span>
            <span className="font-mono tracking-widest text-stone-600">||| |||||| | |||| || |||||||</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
