'use client';

import { useSyncExternalStore } from 'react';
import { INCOME_KATEGORI_NAMES, isIncomeKategoriName } from '@/lib/utils';
import type {
  DailyData,
  Kategori,
  Summary,
  Tipe,
  Transaksi,
  TransaksiWithKategori,
} from '@/types';

const KATEGORI_KEY = 'moneta_kategori_v1';
const TRANSAKSI_KEY = 'moneta_transaksi_v1';
const STORAGE_EVENT = 'moneta-storage-updated';

const DEFAULT_KATEGORI_NAMES: string[] = [
  'Makan & Minum',
  'Transport',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Tagihan',
  'Pendidikan',
  'Lainnya',
  ...INCOME_KATEGORI_NAMES,
];

const DEFAULT_KATEGORIS: Kategori[] = DEFAULT_KATEGORI_NAMES.map((nama, idx) => ({
  id: idx + 1,
  nama_kategori: nama,
})).sort((a, b) => a.nama_kategori.localeCompare(b.nama_kategori));

export interface MoneyTrackerSnapshot {
  isReady: boolean;
  kategoris: Kategori[];
  transaksi: TransaksiWithKategori[];
  recentTransaksi: TransaksiWithKategori[];
  summary: Summary;
  dailyData: DailyData[];
}

const SERVER_SNAPSHOT: MoneyTrackerSnapshot = {
  isReady: false,
  kategoris: [],
  transaksi: [],
  recentTransaksi: [],
  summary: {
    total_pemasukan: 0,
    total_pengeluaran: 0,
    saldo: 0,
  },
  dailyData: [],
};

let cachedRawKategoris: string | null | undefined = undefined;
let cachedRawTransaksi: string | null | undefined = undefined;
let cachedSnapshot: MoneyTrackerSnapshot | null = null;

function ensureRequiredIncomeKategoris(list: Kategori[]): Kategori[] {
  const existingLower = new Set(list.map((k) => k.nama_kategori.trim().toLowerCase()));
  let nextId = list.reduce((max, k) => Math.max(max, k.id), 0) + 1;
  const merged = [...list];

  for (const name of INCOME_KATEGORI_NAMES) {
    if (!existingLower.has(name.toLowerCase())) {
      merged.push({ id: nextId++, nama_kategori: name });
      existingLower.add(name.toLowerCase());
    }
  }

  return merged.sort((a, b) => a.nama_kategori.localeCompare(b.nama_kategori));
}

function parseKategoris(raw: string | null): Kategori[] {
  if (raw === null) return DEFAULT_KATEGORIS;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_KATEGORIS;
    const valid = parsed.filter(
      (item): item is Kategori =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'number' &&
        typeof item.nama_kategori === 'string'
    );
    return ensureRequiredIncomeKategoris(valid);
  } catch {
    return DEFAULT_KATEGORIS;
  }
}

function parseTransaksi(raw: string | null): Transaksi[] {
  if (raw === null) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is Transaksi =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'number' &&
        typeof item.nama_transaksi === 'string' &&
        typeof item.nominal === 'number' &&
        (item.tipe === 'pemasukan' || item.tipe === 'pengeluaran') &&
        (item.kategori_id === null || typeof item.kategori_id === 'number') &&
        typeof item.tanggal === 'string'
    );
  } catch {
    return [];
  }
}

function buildSnapshot(kategoris: Kategori[], transaksiList: Transaksi[]): MoneyTrackerSnapshot {
  const kategoriMap = new Map<number, string>();
  for (const k of kategoris) {
    kategoriMap.set(k.id, k.nama_kategori);
  }

  const joined: TransaksiWithKategori[] = [...transaksiList]
    .sort((a, b) => {
      if (a.tanggal !== b.tanggal) return b.tanggal.localeCompare(a.tanggal);
      return b.id - a.id;
    })
    .map((t) => ({
      ...t,
      nama_kategori: t.kategori_id !== null ? (kategoriMap.get(t.kategori_id) ?? null) : null,
    }));

  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  const dailyMap = new Map<string, DailyData>();

  for (const t of joined) {
    if (t.tipe === 'pemasukan') {
      totalPemasukan += t.nominal;
    } else {
      totalPengeluaran += t.nominal;
    }

    const existing = dailyMap.get(t.tanggal) ?? {
      tanggal: t.tanggal,
      pemasukan: 0,
      pengeluaran: 0,
    };
    if (t.tipe === 'pemasukan') {
      existing.pemasukan += t.nominal;
    } else {
      existing.pengeluaran += t.nominal;
    }
    dailyMap.set(t.tanggal, existing);
  }

  const dailyData = Array.from(dailyMap.values())
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, 14);

  return {
    isReady: true,
    kategoris,
    transaksi: joined,
    recentTransaksi: joined.slice(0, 5),
    summary: {
      total_pemasukan: totalPemasukan,
      total_pengeluaran: totalPengeluaran,
      saldo: totalPemasukan - totalPengeluaran,
    },
    dailyData,
  };
}

function getSnapshot(): MoneyTrackerSnapshot {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT;

  const rawK = window.localStorage.getItem(KATEGORI_KEY);
  const rawT = window.localStorage.getItem(TRANSAKSI_KEY);

  if (cachedSnapshot && cachedRawKategoris === rawK && cachedRawTransaksi === rawT) {
    return cachedSnapshot;
  }

  const kategoris = parseKategoris(rawK);
  const transaksi = parseTransaksi(rawT);
  cachedRawKategoris = rawK;
  cachedRawTransaksi = rawT;
  cachedSnapshot = buildSnapshot(kategoris, transaksi);
  return cachedSnapshot;
}

function getServerSnapshot(): MoneyTrackerSnapshot {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('storage', listener);
  window.addEventListener(STORAGE_EVENT, listener);
  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener(STORAGE_EVENT, listener);
  };
}

function notifyStorageChange(): void {
  cachedRawKategoris = undefined;
  cachedRawTransaksi = undefined;
  cachedSnapshot = null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }
}

function readEditableKategoris(): Kategori[] {
  const raw = window.localStorage.getItem(KATEGORI_KEY);
  const list = parseKategoris(raw);
  if (raw === null) {
    window.localStorage.setItem(KATEGORI_KEY, JSON.stringify(list));
  }
  return list;
}

function readEditableTransaksi(): Transaksi[] {
  return parseTransaksi(window.localStorage.getItem(TRANSAKSI_KEY));
}

export function useMoneyTrackerData(): MoneyTrackerSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export type LocalActionResult<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};

function validateTransaksiFormData(
  formData: FormData,
  kategoris: Kategori[]
): {
  valid: boolean;
  error?: string;
  data?: {
    nama_transaksi: string;
    nominal: number;
    tipe: Tipe;
    kategori_id: number | null;
    tanggal: string;
  };
} {
  const nama_transaksi = ((formData.get('nama_transaksi') as string) ?? '').trim();
  const nominalRaw = (formData.get('nominal') as string) ?? '';
  const tipe = (formData.get('tipe') as string) ?? '';
  const kategori_id_raw = (formData.get('kategori_id') as string) ?? '';
  const tanggal = (formData.get('tanggal') as string) ?? '';

  if (!nama_transaksi) {
    return { valid: false, error: 'Nama transaksi wajib diisi.' };
  }
  const nominal = Number(nominalRaw);
  if (!nominalRaw || !Number.isFinite(nominal) || nominal <= 0) {
    return { valid: false, error: 'Nominal harus berupa angka lebih dari 0.' };
  }
  if (tipe !== 'pemasukan' && tipe !== 'pengeluaran') {
    return { valid: false, error: 'Tipe transaksi tidak valid.' };
  }
  if (!tanggal) {
    return { valid: false, error: 'Tanggal wajib diisi.' };
  }

  const kategori_id = kategori_id_raw ? Number(kategori_id_raw) : null;
  if (kategori_id !== null) {
    if (!Number.isInteger(kategori_id) || kategori_id <= 0) {
      return { valid: false, error: 'Kategori tidak valid.' };
    }
    const kategori = kategoris.find((k) => k.id === kategori_id);
    if (!kategori) {
      return { valid: false, error: 'Kategori tidak ditemukan.' };
    }
    if (tipe === 'pemasukan' && !isIncomeKategoriName(kategori.nama_kategori)) {
      return {
        valid: false,
        error: 'Kategori pemasukan hanya boleh Gaji, Bonus, Usaha, atau Saham.',
      };
    }
    if (tipe === 'pengeluaran' && isIncomeKategoriName(kategori.nama_kategori)) {
      return {
        valid: false,
        error: 'Kategori pengeluaran tidak boleh menggunakan kategori pemasukan.',
      };
    }
  }

  return {
    valid: true,
    data: {
      nama_transaksi,
      nominal,
      tipe,
      kategori_id,
      tanggal,
    },
  };
}

export function createKategoriLocal(nama: string): LocalActionResult<Kategori> {
  const trimmed = nama.trim();
  if (!trimmed) {
    return { success: false, message: 'Nama kategori tidak boleh kosong.' };
  }
  if (trimmed.length > 50) {
    return { success: false, message: 'Nama kategori maksimal 50 karakter.' };
  }

  const kategoris = readEditableKategoris();
  const duplicate = kategoris.some(
    (k) => k.nama_kategori.toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) {
    return { success: false, message: `Kategori "${trimmed}" sudah ada.` };
  }

  const nextId = kategoris.reduce((max, k) => Math.max(max, k.id), 0) + 1;
  const created: Kategori = { id: nextId, nama_kategori: trimmed };
  const nextList = [...kategoris, created].sort((a, b) =>
    a.nama_kategori.localeCompare(b.nama_kategori)
  );

  window.localStorage.setItem(KATEGORI_KEY, JSON.stringify(nextList));
  notifyStorageChange();

  return {
    success: true,
    message: `Kategori "${trimmed}" berhasil ditambahkan!`,
    data: created,
  };
}

export function createTransaksiLocal(formData: FormData): LocalActionResult {
  const kategoris = readEditableKategoris();
  const validation = validateTransaksiFormData(formData, kategoris);
  if (!validation.valid || !validation.data) {
    return { success: false, message: validation.error ?? 'Input tidak valid.' };
  }

  const transaksi = readEditableTransaksi();
  const nextId = transaksi.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  const created: Transaksi = {
    id: nextId,
    ...validation.data,
  };

  window.localStorage.setItem(TRANSAKSI_KEY, JSON.stringify([...transaksi, created]));
  notifyStorageChange();

  return { success: true, message: 'Transaksi berhasil ditambahkan!' };
}

export function updateTransaksiLocal(id: number, formData: FormData): LocalActionResult {
  const kategoris = readEditableKategoris();
  const validation = validateTransaksiFormData(formData, kategoris);
  if (!validation.valid || !validation.data) {
    return { success: false, message: validation.error ?? 'Input tidak valid.' };
  }

  const transaksi = readEditableTransaksi();
  const index = transaksi.findIndex((t) => t.id === id);
  if (index === -1) {
    return { success: false, message: 'Transaksi tidak ditemukan.' };
  }

  const updated = [...transaksi];
  updated[index] = { id, ...validation.data };

  window.localStorage.setItem(TRANSAKSI_KEY, JSON.stringify(updated));
  notifyStorageChange();

  return { success: true, message: 'Transaksi berhasil diperbarui!' };
}

export function deleteTransaksiLocal(id: number): LocalActionResult {
  if (!id || Number.isNaN(id)) {
    return { success: false, message: 'ID transaksi tidak valid.' };
  }

  const transaksi = readEditableTransaksi();
  const filtered = transaksi.filter((t) => t.id !== id);
  window.localStorage.setItem(TRANSAKSI_KEY, JSON.stringify(filtered));
  notifyStorageChange();

  return { success: true, message: 'Transaksi berhasil dihapus!' };
}
