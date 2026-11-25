const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'expense-tracker.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS kategori (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_kategori TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS transaksi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_transaksi TEXT NOT NULL,
    nominal REAL NOT NULL,
    tipe TEXT NOT NULL CHECK(tipe IN ('pemasukan', 'pengeluaran')),
    kategori_id INTEGER,
    tanggal TEXT NOT NULL,
    FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL
  );
`);

// Seed kategori default
const count = db.prepare('SELECT COUNT(*) as count FROM kategori').get().count;
if (count === 0) {
  const insert = db.prepare('INSERT INTO kategori (nama_kategori) VALUES (?)');
  const categories = ['Makan & Minum','Transport','Belanja','Gaji','Hiburan','Kesehatan','Tagihan','Pendidikan','Lainnya'];
  categories.forEach(c => insert.run(c));
  console.log('[Seed] Kategori default berhasil ditambahkan.');
}

// Verifikasi
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
const kategori = db.prepare('SELECT * FROM kategori').all();

console.log('\n=== VERIFIKASI DATABASE ===');
console.log('Tables   :', tables.map(t => t.name).join(', '));
console.log('Kategori :', kategori.length, 'record');
kategori.forEach(k => console.log(`  [${k.id}] ${k.nama_kategori}`));
console.log('\n✅ Database siap!');

db.close();
