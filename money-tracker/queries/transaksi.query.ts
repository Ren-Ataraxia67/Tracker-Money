import { getDb } from '@/lib/db';
import type { TransaksiWithKategori, Summary, MonthlyData, DailyData } from '@/types';

export function getAllTransaksi(): TransaksiWithKategori[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      t.id,
      t.nama_transaksi,
      t.nominal,
      t.tipe,
      t.kategori_id,
      t.tanggal,
      k.nama_kategori
    FROM transaksi t
    LEFT JOIN kategori k ON t.kategori_id = k.id
    ORDER BY t.tanggal DESC, t.id DESC
  `).all() as TransaksiWithKategori[];
}

export function getLast5Transaksi(): TransaksiWithKategori[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      t.id,
      t.nama_transaksi,
      t.nominal,
      t.tipe,
      t.kategori_id,
      t.tanggal,
      k.nama_kategori
    FROM transaksi t
    LEFT JOIN kategori k ON t.kategori_id = k.id
    ORDER BY t.tanggal DESC, t.id DESC
    LIMIT 5
  `).all() as TransaksiWithKategori[];
}

export function getTransaksiById(id: number): TransaksiWithKategori | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT
      t.id,
      t.nama_transaksi,
      t.nominal,
      t.tipe,
      t.kategori_id,
      t.tanggal,
      k.nama_kategori
    FROM transaksi t
    LEFT JOIN kategori k ON t.kategori_id = k.id
    WHERE t.id = ?
  `).get(id) as TransaksiWithKategori | undefined;
}

export function getSummary(): Summary {
  const db = getDb();
  const result = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN tipe = 'pemasukan' THEN nominal ELSE 0 END), 0) AS total_pemasukan,
      COALESCE(SUM(CASE WHEN tipe = 'pengeluaran' THEN nominal ELSE 0 END), 0) AS total_pengeluaran
    FROM transaksi
  `).get() as { total_pemasukan: number; total_pengeluaran: number };

  return {
    total_pemasukan: result.total_pemasukan,
    total_pengeluaran: result.total_pengeluaran,
    saldo: result.total_pemasukan - result.total_pengeluaran,
  };
}

export function insertTransaksi(data: {
  nama_transaksi: string;
  nominal: number;
  tipe: 'pemasukan' | 'pengeluaran';
  kategori_id: number | null;
  tanggal: string;
}): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO transaksi (nama_transaksi, nominal, tipe, kategori_id, tanggal)
    VALUES (@nama_transaksi, @nominal, @tipe, @kategori_id, @tanggal)
  `).run(data);
}

export function updateTransaksi(
  id: number,
  data: {
    nama_transaksi: string;
    nominal: number;
    tipe: 'pemasukan' | 'pengeluaran';
    kategori_id: number | null;
    tanggal: string;
  }
): void {
  const db = getDb();
  db.prepare(`
    UPDATE transaksi
    SET nama_transaksi = @nama_transaksi,
        nominal        = @nominal,
        tipe           = @tipe,
        kategori_id    = @kategori_id,
        tanggal        = @tanggal
    WHERE id = @id
  `).run({ ...data, id });
}

export function deleteTransaksi(id: number): void {
  const db = getDb();
  db.prepare('DELETE FROM transaksi WHERE id = ?').run(id);
}

export function getSummaryByMonth(): MonthlyData[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      strftime('%Y-%m', tanggal) AS bulan,
      COALESCE(SUM(CASE WHEN tipe = 'pemasukan' THEN nominal ELSE 0 END), 0) AS pemasukan,
      COALESCE(SUM(CASE WHEN tipe = 'pengeluaran' THEN nominal ELSE 0 END), 0) AS pengeluaran
    FROM transaksi
    GROUP BY bulan
    ORDER BY bulan DESC
    LIMIT 6
  `).all() as MonthlyData[];
}

export function getSummaryByDate(limit = 14): DailyData[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      tanggal,
      COALESCE(SUM(CASE WHEN tipe = 'pemasukan' THEN nominal ELSE 0 END), 0) AS pemasukan,
      COALESCE(SUM(CASE WHEN tipe = 'pengeluaran' THEN nominal ELSE 0 END), 0) AS pengeluaran
    FROM transaksi
    GROUP BY tanggal
    ORDER BY tanggal DESC
    LIMIT ?
  `).all(limit) as DailyData[];
}
