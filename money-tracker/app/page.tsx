'use client';

import SummaryCards from '@/components/dashboard/SummaryCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import Chart from '@/components/dashboard/Chart';
import { useMoneyTrackerData } from '@/lib/storage';

export default function DashboardPage() {
  const { isReady, summary, recentTransaksi, dailyData } = useMoneyTrackerData();

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">Ringkasan keuangan Anda</p>
      </div>

      {!isReady ? (
        <div className="space-y-5 sm:space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="h-24 rounded-xl bg-gray-200/70" />
            <div className="h-24 rounded-xl bg-gray-200/70" />
            <div className="h-24 rounded-xl bg-gray-200/70 sm:col-span-2 lg:col-span-1" />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <div className="h-72 rounded-2xl bg-gray-200/70" />
            <div className="h-72 rounded-xl bg-gray-200/70" />
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <SummaryCards summary={summary} />

          {/* Chart + Recent Transactions */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <Chart data={dailyData} />
            <RecentTransactions transaksi={recentTransaksi} />
          </div>
        </>
      )}
    </div>
  );
}
