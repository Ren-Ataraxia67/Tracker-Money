export const INCOME_KATEGORI_NAMES = ['Gaji', 'Bonus', 'Usaha', 'Saham'] as const;

export function isIncomeKategoriName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return INCOME_KATEGORI_NAMES.some((item) => item.toLowerCase() === normalized);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function formatMonth(monthStr: string): string {
  // monthStr format: YYYY-MM
  const [year, month] = monthStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat('id-ID', {
    month: 'short',
    year: '2-digit',
  }).format(date);
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
