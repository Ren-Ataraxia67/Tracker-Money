import Database from 'better-sqlite3';

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS kategori (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_kategori   TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS transaksi (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_transaksi  TEXT NOT NULL,
      nominal         REAL NOT NULL,
      tipe            TEXT NOT NULL CHECK(tipe IN ('pemasukan', 'pengeluaran')),
      kategori_id     INTEGER,
      tanggal         TEXT NOT NULL,
      FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL
    );
  `);
}
