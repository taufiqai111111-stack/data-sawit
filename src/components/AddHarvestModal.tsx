import React, { useState } from 'react';
import { HarvestRecord, HarvestQuality } from '../types/palm';
import { X, TreePine, Calculator } from 'lucide-react';

interface AddHarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHarvest: (record: HarvestRecord) => void;
  nextId: string;
}

export const AddHarvestModal: React.FC<AddHarvestModalProps> = ({
  isOpen,
  onClose,
  onAddHarvest,
  nextId,
}) => {
  if (!isOpen) return null;

  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [waktu, setWaktu] = useState('08:00');
  const [afdeling, setAfdeling] = useState('Afdeling I');
  const [blok, setBlok] = useState('Blok A-05');
  const [tph, setTph] = useState('TPH 05');
  const [mandor, setMandor] = useState('Supardi Hartono');
  const [pemanen, setPemanen] = useState('Sukiman & Wagimin');
  const [jumlahJanjang, setJumlahJanjang] = useState<number>(360);
  const [bjrEstimasi, setBjrEstimasi] = useState<number>(22.5);

  // Quality grading
  const [matang, setMatang] = useState<number>(330);
  const [mengkal, setMengkal] = useState<number>(20);
  const [mentah, setMentah] = useState<number>(5);
  const [lewatMatang, setLewatMatang] = useState<number>(3);
  const [janjangKosong, setJanjangKosong] = useState<number>(2);
  const [tangkaiPanjang, setTangkaiPanjang] = useState<number>(4);
  const [catatan, setCatatan] = useState('Panen ancak standar pagi hari, buah segar');

  const estimasiTonaseKg = Math.round(jumlahJanjang * bjrEstimasi);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const kualitas: HarvestQuality = {
      matang,
      mengkal,
      mentah,
      lewatMatang,
      janjangKosong,
      tangkaiPanjang,
    };

    const newRecord: HarvestRecord = {
      id: nextId,
      tanggal,
      waktu,
      afdeling,
      blok,
      tph,
      mandor,
      pemanen,
      jumlahJanjang,
      bjrEstimasi,
      estimasiTonaseKg,
      kualitas,
      status: 'Di TPH',
      catatan,
    };

    onAddHarvest(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-emerald-800" />
            <h3 className="text-sm font-bold text-stone-900">
              Input Hasil Panen Kelapa Sawit di TPH
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Lokasi & Tim Panen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Afdeling:</label>
              <select
                value={afdeling}
                onChange={(e) => setAfdeling(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 focus:border-emerald-700"
              >
                <option value="Afdeling I">Afdeling I (Areal Barat)</option>
                <option value="Afdeling II">Afdeling II (Areal Tengah)</option>
                <option value="Afdeling III">Afdeling III (Areal Timur)</option>
                <option value="Afdeling IV">Afdeling IV (Areal Lembah)</option>
              </select>
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Blok Panen:</label>
              <input
                type="text"
                value={blok}
                onChange={(e) => setBlok(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">TPH (Titik Kumpul):</label>
              <input
                type="text"
                value={tph}
                onChange={(e) => setTph(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Mandor Panen:</label>
              <input
                type="text"
                value={mandor}
                onChange={(e) => setMandor(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Nama Pemanen:</label>
              <input
                type="text"
                value={pemanen}
                onChange={(e) => setPemanen(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5"
                required
              />
            </div>
          </div>

          {/* Tonase & Janjang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-stone-50 rounded-lg border border-stone-200">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Jumlah Janjang Panen (TBS):
              </label>
              <input
                type="number"
                value={jumlahJanjang}
                onChange={(e) => setJumlahJanjang(Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-sm text-stone-900"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Estimasi BJR (kg / janjang):
              </label>
              <input
                type="number"
                step="0.1"
                value={bjrEstimasi}
                onChange={(e) => setBjrEstimasi(Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-sm text-stone-900"
                required
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between text-xs pt-1 border-t border-stone-200 text-stone-600">
              <span className="flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-stone-400" />
                <span>Estimasi Tonase TBS:</span>
              </span>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                {estimasiTonaseKg.toLocaleString('id-ID')} kg ({(estimasiTonaseKg / 1000).toFixed(2)} Ton)
              </span>
            </div>
          </div>

          {/* Sortasi / Kualitas Panen TBS */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1.5">
              Grading Kualitas Buah di TPH (Janjang):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
                <span className="text-[11px] text-emerald-900 block font-medium">Buah Matang:</span>
                <input
                  type="number"
                  value={matang}
                  onChange={(e) => setMatang(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-emerald-200 rounded px-2 py-1 font-mono text-emerald-900"
                />
              </div>
              <div className="p-2 bg-amber-50 rounded border border-amber-100">
                <span className="text-[11px] text-amber-900 block font-medium">Buah Mengkal:</span>
                <input
                  type="number"
                  value={mengkal}
                  onChange={(e) => setMengkal(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-amber-200 rounded px-2 py-1 font-mono text-amber-900"
                />
              </div>
              <div className="p-2 bg-red-50 rounded border border-red-100">
                <span className="text-[11px] text-red-900 block font-medium">Buah Mentah:</span>
                <input
                  type="number"
                  value={mentah}
                  onChange={(e) => setMentah(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-red-200 rounded px-2 py-1 font-mono text-red-900"
                />
              </div>
              <div className="p-2 bg-stone-100 rounded border border-stone-200">
                <span className="text-[11px] text-stone-700 block font-medium">Lewat Matang:</span>
                <input
                  type="number"
                  value={lewatMatang}
                  onChange={(e) => setLewatMatang(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-stone-300 rounded px-2 py-1 font-mono"
                />
              </div>
              <div className="p-2 bg-stone-100 rounded border border-stone-200">
                <span className="text-[11px] text-stone-700 block font-medium">Janjang Kosong:</span>
                <input
                  type="number"
                  value={janjangKosong}
                  onChange={(e) => setJanjangKosong(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-stone-300 rounded px-2 py-1 font-mono"
                />
              </div>
              <div className="p-2 bg-stone-100 rounded border border-stone-200">
                <span className="text-[11px] text-stone-700 block font-medium">Tangkai Panjang:</span>
                <input
                  type="number"
                  value={tangkaiPanjang}
                  onChange={(e) => setTangkaiPanjang(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-stone-300 rounded px-2 py-1 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Catatan Lapangan:</label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg font-semibold shadow-xs"
            >
              Simpan Data Panen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
