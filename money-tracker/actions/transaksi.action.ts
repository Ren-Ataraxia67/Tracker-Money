'use server';

import { revalidatePath } from 'next/cache';
import {
  insertTransaksi,
  updateTransaksi,
  deleteTransaksi,
} from '@/queries/transaksi.query';
import { getAllKategori } from '@/queries/kategori.query';
import { isIncomeKategoriName } from '@/lib/utils';
import type { Tipe } from '@/types';

export type ActionResult = {
  success: boolean;
  message: string;
};

// ─── Validasi helper ──────────────────────────────────────────────
function validateTransaksiForm(formData: FormData): {
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
  const nama_transaksi = (formData.get('nama_transaksi') as string)?.trim();
  const nominalRaw = formData.get('nominal') as string;
  const tipe = formData.get('tipe') as string;
  const kategori_id_raw = formData.get('kategori_id') as string;
  const tanggal = formData.get('tanggal') as string;

  if (!nama_transaksi) return { valid: false, error: 'Nama transaksi wajib diisi.' };
  if (!nominalRaw || isNaN(Number(nominalRaw)) || Number(nominalRaw) <= 0)
    return { valid: false, error: 'Nominal harus berupa angka lebih dari 0.' };
  if (tipe !== 'pemasukan' && tipe !== 'pengeluaran')
    return { valid: false, error: 'Tipe transaksi tidak valid.' };
  if (!tanggal) return { valid: false, error: 'Tanggal wajib diisi.' };

  const kategori_id = kategori_id_raw ? Number(kategori_id_raw) : null;
  if (tipe === 'pemasukan' && kategori_id !== null) {
    const kategori = getAllKategori().find((k) => k.id === kategori_id);
    if (!kategori || !isIncomeKategoriName(kategori.nama_kategori)) {
      return {
        valid: false,
        error: 'Kategori pemasukan hanya boleh Gaji, Bonus, Usaha, atau Saham.',
      };
    }
  }

  return {
    valid: true,
    data: {
      nama_transaksi,
      nominal: Number(nominalRaw),
      tipe: tipe as Tipe,
      kategori_id,
      tanggal,
    },
  };
}

// ─── Create ───────────────────────────────────────────────────────
export async function createTransaksiAction(
  formData: FormData
): Promise<ActionResult> {
  const validation = validateTransaksiForm(formData);
  if (!validation.valid || !validation.data) {
    return { success: false, message: validation.error ?? 'Input tidak valid.' };
  }

  try {
    insertTransaksi(validation.data);
    revalidatePath('/');
    revalidatePath('/riwayat');
    return { success: true, message: 'Transaksi berhasil ditambahkan!' };
  } catch (err) {
    console.error('[createTransaksiAction]', err);
    return { success: false, message: 'Gagal menyimpan transaksi.' };
  }
}

// ─── Update ───────────────────────────────────────────────────────
export async function updateTransaksiAction(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  const validation = validateTransaksiForm(formData);
  if (!validation.valid || !validation.data) {
    return { success: false, message: validation.error ?? 'Input tidak valid.' };
  }

  try {
    updateTransaksi(id, validation.data);
    revalidatePath('/');
    revalidatePath('/riwayat');
    return { success: true, message: 'Transaksi berhasil diperbarui!' };
  } catch (err) {
    console.error('[updateTransaksiAction]', err);
    return { success: false, message: 'Gagal memperbarui transaksi.' };
  }
}

// ─── Delete ───────────────────────────────────────────────────────
export async function deleteTransaksiAction(id: number): Promise<ActionResult> {
  if (!id || isNaN(id)) {
    return { success: false, message: 'ID transaksi tidak valid.' };
  }

  try {
    deleteTransaksi(id);
    revalidatePath('/');
    revalidatePath('/riwayat');
    return { success: true, message: 'Transaksi berhasil dihapus!' };
  } catch (err) {
    console.error('[deleteTransaksiAction]', err);
    return { success: false, message: 'Gagal menghapus transaksi.' };
  }
}
