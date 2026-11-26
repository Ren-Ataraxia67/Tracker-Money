'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle, XCircle, X } from 'lucide-react';
import { createTransaksiAction } from '@/actions/transaksi.action';
import { createKategoriAction } from '@/actions/kategori.action';
import {
  INCOME_KATEGORI_NAMES,
  isIncomeKategoriName,
  todayISO,
} from '@/lib/utils';
import type { Kategori, Tipe } from '@/types';

interface Props {
  initialKategoris: Kategori[];
}

export default function TransaksiForm({ initialKategoris }: Props) {
  const router = useRouter();

  // Form state
  const [kategoris, setKategoris] = useState<Kategori[]>(initialKategoris);
  const [tipe, setTipe] = useState<Tipe>('pengeluaran');
  const [selectedKategoriId, setSelectedKategoriId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);
  const tanggalRef = useRef<HTMLInputElement>(null);

  // Tambah kategori inline
  const [showAddKategori, setShowAddKategori] = useState(false);
  const [newKategoriName, setNewKategoriName] = useState('');
  const [isAddingKategori, setIsAddingKategori] = useState(false);

  useEffect(() => {
    if (tanggalRef.current && !tanggalRef.current.value) {
      tanggalRef.current.value = todayISO();
    }
  }, []);

  const filteredKategoris =
    tipe === 'pemasukan'
      ? INCOME_KATEGORI_NAMES.map((name) =>
          kategoris.find((k) => k.nama_kategori.toLowerCase() === name.toLowerCase())
        ).filter((k): k is Kategori => Boolean(k))
      : kategoris.filter((k) => !isIncomeKategoriName(k.nama_kategori));

  const handleTipeChange = (nextTipe: Tipe) => {
    setTipe(nextTipe);
    if (nextTipe === 'pemasukan') {
      setShowAddKategori(false);
      setNewKategoriName('');
    }
    const selected = kategoris.find((k) => String(k.id) === selectedKategoriId);
    if (
      selected &&
      ((nextTipe === 'pemasukan' && !isIncomeKategoriName(selected.nama_kategori)) ||
        (nextTipe === 'pengeluaran' && isIncomeKategoriName(selected.nama_kategori)))
    ) {
      setSelectedKategoriId('');
    }
  };

  const handleAddKategori = async () => {
    if (!newKategoriName.trim()) return;
    setIsAddingKategori(true);

    const result = await createKategoriAction(newKategoriName);

    if (result.success && result.data) {
      const newK = result.data;
      setKategoris((prev) =>
        [...prev, newK].sort((a, b) => a.nama_kategori.localeCompare(b.nama_kategori))
      );
      setSelectedKategoriId(String(newK.id));
      setNewKategoriName('');
      setShowAddKategori(false);
    } else {
      setMessage({ success: false, text: result.message });
      setTimeout(() => setMessage(null), 4000);
    }

    setIsAddingKategori(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    // pastikan tipe dari state (bukan input tersembunyi)
    formData.set('tipe', tipe);

    const result = await createTransaksiAction(formData);
    setMessage({ success: result.success, text: result.message });
    setIsLoading(false);

    if (result.success) {
      (e.target as HTMLFormElement).reset();
      setSelectedKategoriId('');
      setTipe('pengeluaran');
      if (tanggalRef.current) {
        tanggalRef.current.value = todayISO();
      }
      router.refresh();
    }

    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="font-semibold text-gray-900 text-base sm:text-lg">Tambah Transaksi</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Catat pemasukan atau pengeluaran baru</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Tipe Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
              {(['pengeluaran', 'pemasukan'] as Tipe[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTipeChange(t)}
                  className={`py-2.5 px-3 sm:px-4 rounded-md text-sm font-medium transition-all ${
                    tipe === t
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

          {/* Nama Transaksi */}
          <div>
            <label htmlFor="nama_transaksi" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Transaksi <span className="text-red-500">*</span>
            </label>
            <input
              id="nama_transaksi"
              name="nama_transaksi"
              type="text"
              required
              placeholder="Contoh: Makan siang, Gaji bulanan..."
              className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Nominal */}
          <div>
            <label htmlFor="nominal" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nominal (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              id="nominal"
              name="nominal"
              type="number"
              required
              min="1"
              step="1"
              placeholder="0"
              className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
            <div className="flex gap-2">
              <select
                name="kategori_id"
                value={selectedKategoriId}
                onChange={(e) => setSelectedKategoriId(e.target.value)}
                className="flex-1 min-w-0 px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">-- Pilih Kategori --</option>
                {filteredKategoris.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kategori}
                  </option>
                ))}
              </select>
              {tipe === 'pengeluaran' && (
                <button
                  type="button"
                  onClick={() => setShowAddKategori(!showAddKategori)}
                  title="Tambah kategori baru"
                  className="px-3 py-2.5 text-sm rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  <Plus size={15} />
                  <span>Baru</span>
                </button>
              )}
            </div>

            {/* Inline tambah kategori */}
            {tipe === 'pengeluaran' && showAddKategori && (
              <div className="mt-2.5 p-3 sm:p-3.5 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-2">Tambah Kategori Baru</p>
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="text"
                    value={newKategoriName}
                    onChange={(e) => setNewKategoriName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKategori();
                      }
                    }}
                    placeholder="Nama kategori baru..."
                    maxLength={50}
                    autoFocus
                    className="flex-1 min-w-[160px] px-3 py-2 text-base sm:text-sm rounded-md border border-blue-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleAddKategori}
                      disabled={isAddingKategori || !newKategoriName.trim()}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isAddingKategori ? '...' : 'Tambah'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddKategori(false);
                        setNewKategoriName('');
                      }}
                      aria-label="Tutup tambah kategori"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tanggal */}
          <div>
            <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700 mb-1.5">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              ref={tanggalRef}
              id="tanggal"
              name="tanggal"
              type="date"
              required
              defaultValue=""
              className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              tipe === 'pengeluaran'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {isLoading
              ? 'Menyimpan...'
              : `Simpan ${tipe === 'pengeluaran' ? 'Pengeluaran ↓' : 'Pemasukan ↑'}`}
          </button>

          {/* Alert Message */}
          {message && (
            <div
              className={`flex items-center gap-2 p-3.5 rounded-lg text-sm border ${
                message.success
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {message.success ? (
                <CheckCircle size={16} className="flex-shrink-0" />
              ) : (
                <XCircle size={16} className="flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
