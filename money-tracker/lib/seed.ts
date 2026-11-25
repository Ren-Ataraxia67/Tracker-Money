import Database from 'better-sqlite3';
import { INCOME_KATEGORI_NAMES } from './utils';

const DEFAULT_KATEGORI = [
  'Makan & Minum',
  'Transport',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Tagihan',
  'Pendidikan',
  'Lainnya',
  ...INCOME_KATEGORI_NAMES,
];

export function seedKategori(db: Database.Database): void {
  const count = (db.prepare('SELECT COUNT(*) as count FROM kategori').get() as { count: number }).count;

  // Hanya seed kategori pengeluaran default jika tabel masih kosong
  if (count === 0) {
    const insert = db.prepare('INSERT OR IGNORE INTO kategori (nama_kategori) VALUES (?)');
    const insertMany = db.transaction((items: string[]) => {
      for (const item of items) {
        insert.run(item);
      }
    });
    insertMany(DEFAULT_KATEGORI);
    console.log('[DB] Kategori default berhasil di-seed.');
  }

  // Pastikan kategori pemasukan wajib selalu tersedia
  const insertIncome = db.prepare('INSERT OR IGNORE INTO kategori (nama_kategori) VALUES (?)');
  const ensureIncome = db.transaction((items: readonly string[]) => {
    for (const item of items) {
      insertIncome.run(item);
    }
  });
  ensureIncome(INCOME_KATEGORI_NAMES);
}
