import { getAllTransaksi } from '@/queries/transaksi.query';
import { getAllKategori } from '@/queries/kategori.query';
import { getSummary } from '@/queries/transaksi.query';
import RiwayatTable from '@/components/riwayat/RiwayatTable';
import { formatRupiah } from '@/lib/utils';

export default function RiwayatPage() {
  const transaksi = getAllTransaksi();
  const kategoris = getAllKategori();
  const summary = getSummary();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-500 text-sm mt-1">
            Semua catatan pemasukan dan pengeluaran
          </p>
        </div>

        {/* Mini Summary */}
        <div className="flex gap-3 flex-wrap">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5 text-center">
            <p className="text-xs text-gray-500 font-medium">Pemasukan</p>
            <p className="text-sm font-bold text-emerald-700 mt-0.5">
              {formatRupiah(summary.total_pemasukan)}
            </p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 text-center">
            <p className="text-xs text-gray-500 font-medium">Pengeluaran</p>
            <p className="text-sm font-bold text-red-700 mt-0.5">
              {formatRupiah(summary.total_pengeluaran)}
            </p>
          </div>
          <div className={`border rounded-lg px-4 py-2.5 text-center ${
            summary.saldo >= 0
              ? 'bg-blue-50 border-blue-100'
              : 'bg-orange-50 border-orange-100'
          }`}>
            <p className="text-xs text-gray-500 font-medium">Saldo</p>
            <p className={`text-sm font-bold mt-0.5 ${
              summary.saldo >= 0 ? 'text-blue-700' : 'text-orange-700'
            }`}>
              {summary.saldo < 0 ? '-' : ''}
              {formatRupiah(Math.abs(summary.saldo))}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <RiwayatTable transaksi={transaksi} kategoris={kategoris} />
    </div>
  );
}
