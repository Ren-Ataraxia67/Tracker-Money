export type Tipe = 'pemasukan' | 'pengeluaran';

export interface Kategori {
  id: number;
  nama_kategori: string;
}

export interface Transaksi {
  id: number;
  nama_transaksi: string;
  nominal: number;
  tipe: Tipe;
  kategori_id: number | null;
  tanggal: string; // Format: YYYY-MM-DD
}

// Transaksi yang sudah di-JOIN dengan nama kategori (untuk tampilan)
export interface TransaksiWithKategori extends Transaksi {
  nama_kategori: string | null;
}

export interface Summary {
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo: number;
}

export interface MonthlyData {
  bulan: string; // Format: YYYY-MM
  pemasukan: number;
  pengeluaran: number;
}

export interface DailyData {
  tanggal: string; // Format: YYYY-MM-DD
  pemasukan: number;
  pengeluaran: number;
}
