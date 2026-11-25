import Database from 'better-sqlite3';
import path from 'path';
import { initSchema } from './schema';
import { seedKategori } from './seed';

const DB_PATH = path.join(process.cwd(), 'expense-tracker.db');

// Singleton pattern agar koneksi tidak dibuat berkali-kali
let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    // Aktifkan foreign keys
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

// Inisialisasi DB: jalankan schema dan seed
export function initDb(): void {
  const database = getDb();
  initSchema(database);
  seedKategori(database);
}
