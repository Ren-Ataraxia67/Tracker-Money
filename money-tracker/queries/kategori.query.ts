import { getDb } from '@/lib/db';
import type { Kategori } from '@/types';

export function getAllKategori(): Kategori[] {
  const db = getDb();
  return db.prepare(`
    SELECT id, nama_kategori
    FROM kategori
    ORDER BY nama_kategori ASC
  `).all() as Kategori[];
}

export function insertKategori(nama_kategori: string): Kategori {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO kategori (nama_kategori) VALUES (?)
  `).run(nama_kategori.trim());

  return {
    id: result.lastInsertRowid as number,
    nama_kategori: nama_kategori.trim(),
  };
}

export function deleteKategori(id: number): void {
  const db = getDb();
  db.prepare('DELETE FROM kategori WHERE id = ?').run(id);
}
