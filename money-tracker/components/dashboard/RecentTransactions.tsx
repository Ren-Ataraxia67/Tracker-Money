import Link from 'next/link';
import { ArrowRight, Receipt } from 'lucide-react';
import { formatRupiah, formatDate } from '@/lib/utils';
import { TipeBadge } from '@/components/ui/Badge';
import type { TransaksiWithKategori } from '@/types';

export default function RecentTransactions({
  transaksi,
}: {
  transaksi: TransaksiWithKategori[];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-sm">Transaksi Terbaru</h2>
        <Link
          href="/riwayat"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
        >
          Lihat semua <ArrowRight size={13} />
        </Link>
      </div>

      {/* Empty state */}
      {transaksi.length === 0 ? (
        <div className="p-10 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Receipt size={22} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Belum ada transaksi</p>
          <Link
            href="/transaksi"
            className="text-blue-600 text-xs font-medium mt-1.5 inline-block hover:underline"
          >
            Tambah transaksi pertama →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {transaksi.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/60 transition-colors"
            >
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    t.tipe === 'pemasukan' ? 'bg-emerald-50' : 'bg-red-50'
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      t.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {t.tipe === 'pemasukan' ? '↑' : '↓'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {t.nama_transaksi}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {t.nama_kategori ?? 'Tanpa Kategori'} · {formatDate(t.tanggal)}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="text-right flex-shrink-0 ml-3">
                <p
                  className={`text-sm font-semibold ${
                    t.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {t.tipe === 'pemasukan' ? '+' : '-'}
                  {formatRupiah(t.nominal)}
                </p>
                <div className="flex justify-end mt-0.5">
                  <TipeBadge tipe={t.tipe} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
