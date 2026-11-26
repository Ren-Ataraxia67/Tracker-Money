'use client';

import RiwayatTable from '@/components/riwayat/RiwayatTable';
import { formatRupiah } from '@/lib/utils';
import { useMoneyTrackerData } from '@/lib/storage';

export default function RiwayatPage() {
  const { isReady, transaksi, kategoris, summary } = useMoneyTrackerData();

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Semua catatan pemasukan dan pengeluaran
          </p>
        </div>

        {/* Mini Summary */}
        <div className="grid grid-cols-2 sm:flex gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3.5 py-2 sm:px-4 sm:py-2.5 text-center">
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Pemasukan</p>
            <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5 tabular-nums truncate">
              {formatRupiah(summary.total_pemasukan)}
            </p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg px-3.5 py-2 sm:px-4 sm:py-2.5 text-center">
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Pengeluaran</p>
            <p className="text-xs sm:text-sm font-bold text-red-700 mt-0.5 tabular-nums truncate">
              {formatRupiah(summary.total_pengeluaran)}
            </p>
          </div>
          <div className={`col-span-2 sm:col-span-1 border rounded-lg px-3.5 py-2 sm:px-4 sm:py-2.5 text-center ${
            summary.saldo >= 0
              ? 'bg-blue-50 border-blue-100'
              : 'bg-orange-50 border-orange-100'
          }`}>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Saldo</p>
            <p className={`text-xs sm:text-sm font-bold mt-0.5 tabular-nums truncate ${
              summary.saldo >= 0 ? 'text-blue-700' : 'text-orange-700'
            }`}>
              {summary.saldo < 0 ? '-' : ''}
              {formatRupiah(Math.abs(summary.saldo))}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      {!isReady ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 animate-pulse space-y-3">
          <div className="h-10 rounded-lg bg-gray-100" />
          <div className="h-10 rounded-lg bg-gray-100" />
          <div className="h-10 rounded-lg bg-gray-100" />
        </div>
      ) : (
        <RiwayatTable transaksi={transaksi} kategoris={kategoris} />
      )}
    </div>
  );
}
