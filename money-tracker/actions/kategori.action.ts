'use server';

import { revalidatePath } from 'next/cache';
import { insertKategori, deleteKategori } from '@/queries/kategori.query';

export type ActionResult = {
  success: boolean;
  message: string;
  data?: { id: number; nama_kategori: string };
};

// ─── Create ───────────────────────────────────────────────────────
export async function createKategoriAction(
  nama: string
): Promise<ActionResult> {
  const trimmed = nama?.trim();

  if (!trimmed) {
    return { success: false, message: 'Nama kategori tidak boleh kosong.' };
  }
  if (trimmed.length > 50) {
    return { success: false, message: 'Nama kategori maksimal 50 karakter.' };
  }

  try {
    const kategori = insertKategori(trimmed);
    revalidatePath('/transaksi');
    revalidatePath('/riwayat');
    return {
      success: true,
      message: `Kategori "${trimmed}" berhasil ditambahkan!`,
      data: kategori,
    };
  } catch (err: unknown) {
    // Handle UNIQUE constraint (kategori sudah ada)
    if (err instanceof Error && err.message.includes('UNIQUE')) {
      return { success: false, message: `Kategori "${trimmed}" sudah ada.` };
    }
    console.error('[createKategoriAction]', err);
    return { success: false, message: 'Gagal menambahkan kategori.' };
  }
}

// ─── Delete ───────────────────────────────────────────────────────
export async function deleteKategoriAction(id: number): Promise<ActionResult> {
  if (!id || isNaN(id)) {
    return { success: false, message: 'ID kategori tidak valid.' };
  }

  try {
    deleteKategori(id);
    revalidatePath('/transaksi');
    revalidatePath('/riwayat');
    return { success: true, message: 'Kategori berhasil dihapus.' };
  } catch (err) {
    console.error('[deleteKategoriAction]', err);
    return { success: false, message: 'Gagal menghapus kategori.' };
  }
}
