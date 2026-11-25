import { getSummary, getLast5Transaksi, getSummaryByDate } from '@/queries/transaksi.query';
import SummaryCards from '@/components/dashboard/SummaryCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import Chart from '@/components/dashboard/Chart';

export default function DashboardPage() {
  const summary = getSummary();
  const recentTransaksi = getLast5Transaksi();
  const dailyData = getSummaryByDate();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan keuangan Anda</p>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Chart + Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Chart data={dailyData} />
        <RecentTransactions transaksi={recentTransaksi} />
      </div>
    </div>
  );
}
