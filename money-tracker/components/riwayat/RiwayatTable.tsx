'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, X, CheckCircle, XCircle, FileText } from 'lucide-react';
import { TipeBadge } from '@/components/ui/Badge';
import {
  INCOME_KATEGORI_NAMES,
  isIncomeKategoriName,
  formatRupiah,
  formatDate,
  todayISO,
} from '@/lib/utils';
import {
  updateTransaksiAction,
  deleteTransaksiAction,
} from '@/actions/transaksi.action';
import type { TransaksiWithKategori, Kategori, Tipe } from '@/types';

interface Props {
  transaksi: TransaksiWithKategori[];
  kategoris: Kategori[];
}

export default function RiwayatTable({ transaksi, kategoris }: Props) {
  const router = useRouter();

  // Edit modal state
  const [editingItem, setEditingItem] = useState<TransaksiWithKategori | null>(null);
  const [editTipe, setEditTipe] = useState<Tipe>('pengeluaran');
  const [editKategoriId, setEditKategoriId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMessage, setEditMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Delete inline confirmation
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ success: boolean; text: string } | null>(null);

  const showToast = (success: boolean, text: string) => {
    setToast({ success, text });
    setTimeout(() => setToast(null), 4000);
  };

  const openEdit = (item: TransaksiWithKategori) => {
    setEditingItem(item);
    setEditTipe(item.tipe);
    setEditKategoriId(item.kategori_id ? String(item.kategori_id) : '');
    setEditMessage(null);
  };

  const editFilteredKategoris =
    editTipe === 'pemasukan'
      ? INCOME_KATEGORI_NAMES.map((name) =>
          kategoris.find((k) => k.nama_kategori.toLowerCase() === name.toLowerCase())
        ).filter((k): k is Kategori => Boolean(k))
      : kategoris.filter((k) => !isIncomeKategoriName(k.nama_kategori));

  const handleEditTipeChange = (nextTipe: Tipe) => {
    setEditTipe(nextTipe);
    const selected = kategoris.find((k) => String(k.id) === editKategoriId);
    if (
      selected &&
      ((nextTipe === 'pemasukan' && !isIncomeKategoriName(selected.nama_kategori)) ||
        (nextTipe === 'pengeluaran' && isIncomeKategoriName(selected.nama_kategori)))
    ) {
      setEditKategoriId('');
    }
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsUpdating(true);
    setEditMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set('tipe', editTipe);

    const result = await updateTransaksiAction(editingItem.id, formData);
    setIsUpdating(false);

    if (result.success) {
      setEditingItem(null);
      showToast(true, result.message);
      router.refresh();
    } else {
      setEditMessage({ success: false, text: result.message });
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    const result = await deleteTransaksiAction(id);
    setIsDeleting(false);
    setDeletingId(null);

    if (result.success) {
      showToast(true, result.message);
      router.refresh();
    } else {
      showToast(false, result.message);
    }
  };

  return (
    <div className="relative">
      {/* Global Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-sm font-medium border ${
            toast.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {toast.success ? (
            <CheckCircle size={16} className="flex-shrink-0 text-emerald-600" />
          ) : (
            <XCircle size={16} className="flex-shrink-0 text-red-600" />
          )}
          {toast.text}
        </div>
      )}

      {/* Empty state */}
      {transaksi.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={26} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">Belum ada transaksi</p>
          <p className="text-gray-400 text-sm mt-1">Mulai tambahkan transaksi pertama Anda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Transaksi</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipe</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nominal</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transaksi.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(t.tanggal)}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                      {t.nama_transaksi}
                    </td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs">
                        {t.nama_kategori ?? 'Tanpa Kategori'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <TipeBadge tipe={t.tipe} size="sm" />
                    </td>
                    <td className={`px-5 py-4 text-right font-semibold whitespace-nowrap ${
                      t.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {t.tipe === 'pemasukan' ? '+' : '-'}{formatRupiah(t.nominal)}
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      {deletingId === t.id ? (
                        // Inline delete confirmation
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs text-gray-500">Hapus?</span>
                          <button
                            onClick={() => handleDelete(t.id)}
                            disabled={isDeleting}
                            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
                          >
                            {isDeleting ? '...' : 'Ya'}
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            disabled={isDeleting}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors font-medium"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEdit(t)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeletingId(t.id)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Row count */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">
              Total <span className="font-semibold text-gray-600">{transaksi.length}</span> transaksi
            </p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditingItem(null)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Edit Transaksi</h3>
                <p className="text-xs text-gray-400 mt-0.5">Perbarui detail transaksi</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              {/* Tipe Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                  {(['pengeluaran', 'pemasukan'] as Tipe[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleEditTipeChange(t)}
                      className={`py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                        editTipe === t
                          ? t === 'pengeluaran'
                            ? 'bg-white text-red-600 shadow-sm ring-1 ring-red-100'
                            : 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {t === 'pengeluaran' ? '↓ Pengeluaran' : '↑ Pemasukan'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama */}
              <div>
                <label htmlFor="edit_nama" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Transaksi <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit_nama"
                  name="nama_transaksi"
                  type="text"
                  required
                  defaultValue={editingItem.nama_transaksi}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Nominal */}
              <div>
                <label htmlFor="edit_nominal" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nominal (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit_nominal"
                  name="nominal"
                  type="number"
                  required
                  min="1"
                  step="1"
                  defaultValue={editingItem.nominal}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Kategori */}
              <div>
                <label htmlFor="edit_kategori" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kategori
                </label>
                <select
                  id="edit_kategori"
                  name="kategori_id"
                  value={editKategoriId}
                  onChange={(e) => setEditKategoriId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">-- Tanpa Kategori --</option>
                  {editFilteredKategoris.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal */}
              <div>
                <label htmlFor="edit_tanggal" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  id="edit_tanggal"
                  name="tanggal"
                  type="date"
                  required
                  defaultValue={editingItem.tanggal}
                  max={todayISO()}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Error message */}
              {editMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                  <XCircle size={15} className="flex-shrink-0" />
                  {editMessage.text}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
