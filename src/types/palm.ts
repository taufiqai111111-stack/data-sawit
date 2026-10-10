/**
 * Domain types for SawitTrack - Palm Oil Harvest & Weighbridge Supply Chain
 */

export type HarvestQuality = {
  matang: number;       // Janjang masak optimal (Ripe)
  mengkal: number;      // Janjang mengkal (Underripe)
  mentah: number;       // Janjang mentah (Unripe)
  lewatMatang: number;  // Overripe / busuk
  janjangKosong: number;// Empty bunch
  tangkaiPanjang: number;// Long stalk bunches
};

export type HarvestRecord = {
  id: string;
  tanggal: string;
  waktu: string;
  afdeling: string;      // e.g. "Afdeling I"
  blok: string;          // e.g. "Blok B-14"
  tph: string;           // e.g. "TPH 08"
  mandor: string;        // e.g. "M. Supardi"
  pemanen: string;       // e.g. "Tugimin & Slamet"
  jumlahJanjang: number; // Count of fruit bunches (TBS)
  bjrEstimasi: number;   // Berat Janjang Rata-rata estimasi (kg/janjang)
  estimasiTonaseKg: number; // jumlahJanjang * bjrEstimasi
  kualitas: HarvestQuality;
  status: 'Di TPH' | 'Proses Muat' | 'Diangkut' | 'Selesai Timbang' | 'Terjual';
  noSpb?: string;        // Surat Pengantar Buah ID
  armadaId?: string;     // Truk yang ditugaskan
  catatan?: string;
};

export type TruckFleet = {
  id: string;
  platNomor: string;     // e.g. "BK 8421 XF"
  sopir: string;         // e.g. "Joko Santoso"
  kontakSopir: string;   // e.g. "0812-7890-4421"
  kapasitasKg: number;   // e.g. 10000 kg (10 ton)
  status: 'Siap Jalan' | 'Memuat di Kebun' | 'Perjalanan ke PKS' | 'Antrean Timbang' | 'Bongkar di PKS' | 'Perjalanan Balik';
  currentLat: number;
  currentLng: number;
  speedKmH: number;
  heading: number;       // compass degrees 0-360
  targetDestination: string; // e.g. "PKS Sawit Makmur - Gate 2"
  etaMenit: number;
  jarakKm: number;
  noSpbAktif?: string;
  janjangMuat?: number;
  asalBlok?: string;
  historyRoute: [number, number][];
};

export type WeighbridgeTicket = {
  id: string;            // e.g. "WB-2026-10-0192"
  tanggal: string;
  waktuMasuk: string;
  waktuKeluar: string;
  noSpb: string;
  platNomor: string;
  sopir: string;
  afdelingAsal: string;
  blokAsal: string;
  jumlahJanjangSpb: number;
  
  // Timbangan berat
  beratBrutoKg: number;      // Berat Truk + TBS
  beratTaraKg: number;       // Berat Truk Kosong
  beratNetto1Kg: number;     // Bruto - Tara
  
  // Refaksi & Sortasi
  refaksiPersen: number;     // e.g. 3.2%
  potonganTangkaiKg: number;
  potonganSampahKg: number;
  potonganMentahKg: number;
  totalPotonganKg: number;
  
  // Hasil Akhir
  beratNettoBersihKg: number;// Netto1 - Total Potongan (Paid Weight)
  bjrAktual: number;         // beratNettoBersihKg / jumlahJanjangSpb
  deviasiBjrKg: number;      // bjrAktual - bjrEstimasi (deteksi susut)
  
  operatorTimbang: string;
  namaPKS: string;
  status: 'Draft Bruto' | 'Selesai Timbang' | 'Divalidasi' | 'Terbit Faktur';
  statusPenjualan: 'Belum Terjual' | 'Siap Jual' | 'Terjual';
  catatan?: string;
};

export type SalesRecord = {
  id: string;                // e.g. "INV-TBS-2026/088"
  tanggal: string;
  pembeli: string;           // e.g. "PT Palma Agro Sejahtera (PKS Tapung)"
  kontrakNo: string;         // e.g. "KTR-TBS/PAS/X/2026"
  tiketTimbangIds: string[]; // List of weighbridge tickets included
  totalNettoKg: number;      // Total net weight
  hargaPerKg: number;        // Price in IDR per kg
  totalNilaiRp: number;      // totalNettoKg * hargaPerKg
  ppnRp: number;             // PPh / PPN jika ada
  totalTagihanRp: number;
  statusPembayaran: 'Lunas' | 'Menunggu Pembayaran' | 'Verifikasi Kasir';
  metodePembayaran: 'Transfer Bank Mandiri' | 'BCA Virtual Account' | 'Giro Bilyet' | 'Tunai';
  jatuhTempo: string;
  picPembeli: string;
  catatan?: string;
};

export type WaypointMarker = {
  id: string;
  nama: string;
  tipe: 'kebun_tph' | 'pos_security' | 'checkpoint' | 'timbangan_pks' | 'loading_ramp' | 'kantor';
  lat: number;
  lng: number;
  deskripsi: string;
};
