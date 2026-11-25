import { getAllKategori } from '@/queries/kategori.query';
import TransaksiForm from '@/components/transaksi/TransaksiForm';

export default function TransaksiPage() {
  const kategoris = getAllKategori();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Input Transaksi</h1>
        <p className="text-gray-500 text-sm mt-1">Catat pemasukan atau pengeluaran baru</p>
      </div>

      <TransaksiForm initialKategoris={kategoris} />
    </div>
  );
}
