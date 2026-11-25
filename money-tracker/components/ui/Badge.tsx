import type { Tipe } from '@/types';

interface TipeBadgeProps {
  tipe: Tipe;
  size?: 'sm' | 'md';
}

export function TipeBadge({ tipe, size = 'md' }: TipeBadgeProps) {
  const isIncome = tipe === 'pemasukan';
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClass} rounded-full font-medium ${
        isIncome
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-red-50 text-red-700 ring-1 ring-red-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          isIncome ? 'bg-emerald-500' : 'bg-red-500'
        }`}
      />
      {isIncome ? 'Pemasukan' : 'Pengeluaran'}
    </span>
  );
}
