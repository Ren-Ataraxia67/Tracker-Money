import { TrendingUp, TrendingDown, Wallet, type LucideIcon } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import type { Summary } from '@/types';

interface CardItem {
  label: string;
  value: number;
  Icon: LucideIcon;
  colorText: string;
  colorBg: string;
  colorBorder: string;
  colorIconBg: string;
  prefix: string;
}

export default function SummaryCards({ summary }: { summary: Summary }) {
  const cards: CardItem[] = [
    {
      label: 'Total Pemasukan',
      value: summary.total_pemasukan,
      Icon: TrendingUp,
      colorText: 'text-emerald-700',
      colorBg: 'bg-emerald-50',
      colorBorder: 'border-emerald-100',
      colorIconBg: 'bg-emerald-100',
      prefix: '+',
    },
    {
      label: 'Total Pengeluaran',
      value: summary.total_pengeluaran,
      Icon: TrendingDown,
      colorText: 'text-red-700',
      colorBg: 'bg-red-50',
      colorBorder: 'border-red-100',
      colorIconBg: 'bg-red-100',
      prefix: '-',
    },
    {
      label: 'Saldo',
      value: summary.saldo,
      Icon: Wallet,
      colorText: summary.saldo >= 0 ? 'text-blue-700' : 'text-orange-700',
      colorBg: summary.saldo >= 0 ? 'bg-blue-50' : 'bg-orange-50',
      colorBorder: summary.saldo >= 0 ? 'border-blue-100' : 'border-orange-100',
      colorIconBg: summary.saldo >= 0 ? 'bg-blue-100' : 'bg-orange-100',
      prefix: summary.saldo >= 0 ? '' : '-',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className={`rounded-xl border p-4 sm:p-5 ${card.colorBg} ${card.colorBorder} ${
            index === 2 ? 'sm:col-span-2 lg:col-span-1' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                {card.label}
              </p>
              <p className={`text-xl sm:text-2xl font-bold truncate tabular-nums ${card.colorText}`}>
                {card.label === 'Saldo'
                  ? `${card.prefix}${formatRupiah(Math.abs(card.value))}`
                  : formatRupiah(card.value)}
              </p>
            </div>
            <div className={`p-2 sm:p-2.5 rounded-lg flex-shrink-0 ${card.colorIconBg}`}>
              <card.Icon className={card.colorText} size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
