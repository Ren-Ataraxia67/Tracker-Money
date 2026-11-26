'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  TrendingUp,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
  { href: '/transaksi', label: 'Input Transaksi', shortLabel: 'Transaksi', icon: PlusCircle },
  { href: '/riwayat', label: 'Riwayat', shortLabel: 'Riwayat', icon: History },
];

function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
        <TrendingUp className="text-white" size={18} />
      </div>
      <div>
        <p className="font-bold text-gray-900 text-sm leading-tight">Moneta</p>
        <p className="font-semibold text-blue-600 text-xs leading-tight tracking-wider">
          Catat Cuan
        </p>
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [menuOpenForPath, setMenuOpenForPath] = useState<string | null>(null);
  const mobileMenuOpen = menuOpenForPath === pathname;

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpenForPath(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const renderNavLinks = (onNavigate?: () => void) => (
    <nav className="flex-1 p-3 space-y-0.5" aria-label="Menu utama">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 mt-2 mb-1">
        Menu
      </p>
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Icon
              size={17}
              className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
            />
            <span className="flex-1">{label}</span>
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar (lg and up) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex-col z-20">
        <div className="p-5 border-b border-gray-100">
          <BrandLogo />
        </div>
        {renderNavLinks()}
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">© 2024 Moneta Catat Cuan</p>
        </div>
      </aside>

      {/* Mobile & Tablet Top Header (below lg) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMenuOpenForPath(pathname)}
              aria-label="Buka menu navigasi"
              aria-expanded={mobileMenuOpen}
              className="p-2 -ml-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <BrandLogo />
          </div>

          {/* Inline quick nav for tablet (md to lg) + quick CTA on mobile */}
          <div className="flex items-center gap-2">
            <nav className="hidden md:flex lg:hidden items-center gap-1" aria-label="Navigasi tablet">
              {navItems.map(({ href, shortLabel, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={15} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                    <span>{shortLabel}</span>
                  </Link>
                );
              })}
            </nav>

            {pathname !== '/transaksi' && (
              <Link
                href="/transaksi"
                className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
              >
                <PlusCircle size={14} />
                <span>Catat</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Slide-over Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMenuOpenForPath(null)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[82vw] bg-white h-full shadow-2xl flex flex-col z-50">
            <div className="px-4 h-14 border-b border-gray-100 flex items-center justify-between">
              <BrandLogo />
              <button
                type="button"
                onClick={() => setMenuOpenForPath(null)}
                aria-label="Tutup menu navigasi"
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {renderNavLinks(() => setMenuOpenForPath(null))}
            <div className="p-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center">© 2024 Moneta Catat Cuan</p>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (below md) */}
      <nav
        aria-label="Navigasi bawah"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-3 h-16">
          {navItems.map(({ href, shortLabel, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span
                  className={`px-3 py-1 rounded-full transition-colors ${
                    isActive ? 'bg-blue-50' : ''
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? 'text-blue-600' : 'text-gray-400'}
                  />
                </span>
                <span>{shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
