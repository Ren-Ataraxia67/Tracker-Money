'use client';

import { useState } from 'react';
import { formatRupiah, formatDate, formatShortDate } from '@/lib/utils';
import type { DailyData } from '@/types';
import { BarChart2, TrendingUp, BarChart3 } from 'lucide-react';

type ChartMode = 'area' | 'bar';

interface Point {
  x: number;
  y: number;
}

function getNiceMax(maxValue: number): number {
  if (maxValue <= 0) return 100_000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const normalized = maxValue / magnitude;
  const niceMultipliers = [1, 2, 4, 5, 8, 10];
  const multiplier = niceMultipliers.find((m) => m >= normalized) ?? 10;
  return multiplier * magnitude;
}

function formatCompactRupiah(value: number): string {
  if (value === 0) return '0';
  const formatNum = (num: number) =>
    Number(num.toFixed(1)).toString().replace('.', ',');

  if (value >= 1_000_000_000) return `${formatNum(value / 1_000_000_000)}M`;
  if (value >= 1_000_000) return `${formatNum(value / 1_000_000)}jt`;
  if (value >= 1_000) return `${formatNum(value / 1_000)}rb`;
  return String(value);
}

/**
 * Builds a smooth cubic Bezier SVG path with horizontal tangents at each point
 * so the curve never overshoots below the 0 baseline or above data peaks.
 */
function buildSmoothPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const dx = (point.x - prev.x) * 0.45;
    return `${acc} C ${prev.x + dx} ${prev.y}, ${point.x - dx} ${point.y}, ${point.x} ${point.y}`;
  }, '');
}

function buildAreaPath(points: Point[], baselineY: number): string {
  if (points.length < 2) return '';
  const line = buildSmoothPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${line} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

export default function Chart({ data }: { data: DailyData[] }) {
  const [mode, setMode] = useState<ChartMode>('area');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-10 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
          <BarChart2 size={22} className="text-gray-400" />
        </div>
        <p className="text-gray-700 text-sm font-semibold">Belum ada data grafik</p>
        <p className="text-gray-400 text-xs mt-1">
          Grafik berdasarkan tanggal akan muncul setelah ada transaksi.
        </p>
      </div>
    );
  }

  // Reverse: oldest -> newest (for left-to-right display)
  const sortedData = [...data].reverse();
  const count = sortedData.length;
  const rawMax = Math.max(
    ...sortedData.flatMap((d) => [d.pemasukan, d.pengeluaran]),
    0
  );
  const niceMax = getNiceMax(rawMax);
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((r) => Math.round(niceMax * r));

  const totalPemasukan = sortedData.reduce((sum, d) => sum + d.pemasukan, 0);
  const totalPengeluaran = sortedData.reduce((sum, d) => sum + d.pengeluaran, 0);
  const totalSelisih = totalPemasukan - totalPengeluaran;

  const svgWidth = 600;
  const svgHeight = 200;

  const incomePoints: Point[] = sortedData.map((d, i) => ({
    x: ((i + 0.5) / count) * svgWidth,
    y: svgHeight - (d.pemasukan / niceMax) * svgHeight,
  }));

  const expensePoints: Point[] = sortedData.map((d, i) => ({
    x: ((i + 0.5) / count) * svgWidth,
    y: svgHeight - (d.pengeluaran / niceMax) * svgHeight,
  }));

  const activeData = activeIndex !== null ? sortedData[activeIndex] : null;
  const activeXPct =
    activeIndex !== null ? ((activeIndex + 0.5) / count) * 100 : 0;

  const getTooltipPositionClass = (idx: number) => {
    if (count === 1) return '-translate-x-1/2';
    if (idx === 0) return 'translate-x-0';
    if (idx === count - 1) return '-translate-x-full';
    return '-translate-x-1/2';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900 text-sm">
              Ringkasan Harian
            </h2>
            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {count} tgl
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Pemasukan &amp; pengeluaran berdasarkan tanggal
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="inline-flex items-center p-1 rounded-xl bg-gray-100/90 border border-gray-200/60">
          <button
            type="button"
            onClick={() => setMode('area')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              mode === 'area'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp size={13} />
            <span>Kurva</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('bar')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              mode === 'bar'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 size={13} />
            <span>Batang</span>
          </button>
        </div>
      </div>

      {/* Period Mini KPI Strip */}
      <div className="px-5 pt-4 grid grid-cols-3 gap-2.5">
        <div className="rounded-xl bg-emerald-50/70 border border-emerald-100/80 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium text-emerald-700/90">
              Pemasukan
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5 truncate tabular-nums">
            {formatRupiah(totalPemasukan)}
          </p>
        </div>

        <div className="rounded-xl bg-rose-50/70 border border-rose-100/80 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[11px] font-medium text-rose-700/90">
              Pengeluaran
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-rose-700 mt-0.5 truncate tabular-nums">
            {formatRupiah(totalPengeluaran)}
          </p>
        </div>

        <div
          className={`rounded-xl border px-3 py-2 ${
            totalSelisih >= 0
              ? 'bg-blue-50/70 border-blue-100/80'
              : 'bg-orange-50/70 border-orange-100/80'
          }`}
        >
          <span
            className={`text-[11px] font-medium block ${
              totalSelisih >= 0 ? 'text-blue-700/90' : 'text-orange-700/90'
            }`}
          >
            Net Periode
          </span>
          <p
            className={`text-xs sm:text-sm font-bold mt-0.5 truncate tabular-nums ${
              totalSelisih >= 0 ? 'text-blue-700' : 'text-orange-700'
            }`}
          >
            {totalSelisih >= 0 ? '+' : '-'}
            {formatRupiah(Math.abs(totalSelisih))}
          </p>
        </div>
      </div>

      {/* Chart Body */}
      <div className="p-5 pt-5 flex-1 flex flex-col justify-end">
        <div className="flex gap-3">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between h-48 text-right select-none shrink-0">
            {ticks.map((tick, i) => (
              <span
                key={i}
                className="text-[11px] text-gray-400 leading-none tabular-nums"
              >
                {tick === 0 ? '0' : `Rp${formatCompactRupiah(tick)}`}
              </span>
            ))}
          </div>

          {/* Interactive Plot */}
          <div className="flex-1 min-w-0">
            <div
              className="relative h-48"
              onMouseLeave={() => setActiveIndex(null)}
            >
              {/* Horizontal Dashed Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {ticks.map((_, i) => (
                  <div
                    key={i}
                    className={`w-full ${
                      i === ticks.length - 1
                        ? 'border-b border-gray-200'
                        : 'border-b border-dashed border-gray-100'
                    }`}
                  />
                ))}
              </div>

              {mode === 'area' ? (
                <>
                  {/* Smooth SVG Area + Line */}
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                  >
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.24" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {count > 1 && (
                      <>
                        <path
                          d={buildAreaPath(incomePoints, svgHeight)}
                          fill="url(#incomeGrad)"
                        />
                        <path
                          d={buildAreaPath(expensePoints, svgHeight)}
                          fill="url(#expenseGrad)"
                        />
                        <path
                          d={buildSmoothPath(incomePoints)}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.75"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                        />
                        <path
                          d={buildSmoothPath(expensePoints)}
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="2.75"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      </>
                    )}
                  </svg>

                  {/* Vertical Hover Crosshair */}
                  {activeIndex !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-gray-300/90 pointer-events-none transition-all duration-150"
                      style={{ left: `${activeXPct}%` }}
                    />
                  )}

                  {/* Crisp HTML Dots (never distorted by SVG aspect ratio) */}
                  {sortedData.map((d, idx) => {
                    const xPct = ((idx + 0.5) / count) * 100;
                    const incomeBottomPct = (d.pemasukan / niceMax) * 100;
                    const expenseBottomPct = (d.pengeluaran / niceMax) * 100;
                    const isActive = activeIndex === idx;

                    return (
                      <div key={d.tanggal} className="pointer-events-none">
                        <span
                          className={`absolute -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-500 border-2 border-white transition-all duration-150 ${
                            isActive
                              ? 'w-3.5 h-3.5 ring-4 ring-emerald-500/20 z-20'
                              : count === 1
                                ? 'w-3 h-3 z-10'
                                : 'w-2 h-2 opacity-80 z-10'
                          }`}
                          style={{
                            left: `${xPct}%`,
                            bottom: `${incomeBottomPct}%`,
                          }}
                        />
                        <span
                          className={`absolute -translate-x-1/2 translate-y-1/2 rounded-full bg-rose-500 border-2 border-white transition-all duration-150 ${
                            isActive
                              ? 'w-3.5 h-3.5 ring-4 ring-rose-500/20 z-20'
                              : count === 1
                                ? 'w-3 h-3 z-10'
                                : 'w-2 h-2 opacity-80 z-10'
                          }`}
                          style={{
                            left: `${xPct}%`,
                            bottom: `${expenseBottomPct}%`,
                          }}
                        />
                      </div>
                    );
                  })}

                  {/* Interactive Hover Columns */}
                  <div className="absolute inset-0 flex z-20">
                    {sortedData.map((d, idx) => (
                      <div
                        key={d.tanggal}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className="flex-1 h-full cursor-pointer"
                      />
                    ))}
                  </div>
                </>
              ) : (
                /* Modern Bar Mode */
                <div className="relative z-10 h-full flex items-end gap-2 sm:gap-3 px-1">
                  {sortedData.map((d, idx) => {
                    const incomePct =
                      d.pemasukan > 0
                        ? Math.max((d.pemasukan / niceMax) * 100, 3)
                        : 0;
                    const expensePct =
                      d.pengeluaran > 0
                        ? Math.max((d.pengeluaran / niceMax) * 100, 3)
                        : 0;
                    const isActive = activeIndex === idx;

                    return (
                      <div
                        key={d.tanggal}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`flex-1 h-full flex items-end justify-center gap-1.5 px-1.5 rounded-t-xl transition-colors duration-150 cursor-pointer ${
                          isActive ? 'bg-gray-100/70' : ''
                        }`}
                      >
                        <div className="flex-1 max-w-[24px] h-full flex items-end">
                          <div
                            className={`w-full rounded-t-lg bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 transition-all duration-300 ${
                              isActive ? 'shadow-md shadow-emerald-500/20 scale-x-105' : ''
                            }`}
                            style={{ height: `${incomePct}%` }}
                          />
                        </div>
                        <div className="flex-1 max-w-[24px] h-full flex items-end">
                          <div
                            className={`w-full rounded-t-lg bg-gradient-to-t from-rose-600 via-rose-500 to-orange-400 transition-all duration-300 ${
                              isActive ? 'shadow-md shadow-rose-500/20 scale-x-105' : ''
                            }`}
                            style={{ height: `${expensePct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Floating Glassmorphic Tooltip */}
              {activeIndex !== null && activeData && (
                <div
                  className="absolute bottom-full mb-2.5 z-30 pointer-events-none"
                  style={{ left: `${activeXPct}%` }}
                >
                  <div
                    className={`relative ${getTooltipPositionClass(activeIndex)}`}
                  >
                    <div className="bg-gray-900/95 backdrop-blur-md text-white text-xs rounded-xl shadow-xl px-3.5 py-2.5 min-w-[180px] border border-white/10">
                      <p className="font-semibold text-gray-100 mb-1.5 border-b border-white/10 pb-1">
                        {formatDate(activeData.tanggal)}
                      </p>
                      <div className="space-y-1 tabular-nums">
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-gray-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Masuk
                          </span>
                          <span className="font-medium text-emerald-300">
                            {formatRupiah(activeData.pemasukan)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-gray-300">
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            Keluar
                          </span>
                          <span className="font-medium text-rose-300">
                            {formatRupiah(activeData.pengeluaran)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/10">
                          <span className="text-gray-400">Selisih</span>
                          <span
                            className={`font-semibold ${
                              activeData.pemasukan - activeData.pengeluaran >= 0
                                ? 'text-blue-300'
                                : 'text-orange-300'
                            }`}
                          >
                            {activeData.pemasukan - activeData.pengeluaran >= 0
                              ? '+'
                              : '-'}
                            {formatRupiah(
                              Math.abs(
                                activeData.pemasukan - activeData.pengeluaran
                              )
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* X-Axis Labels */}
            <div className="flex px-1 mt-2.5">
              {sortedData.map((d, idx) => {
                const labelStep = count > 7 ? Math.ceil(count / 6) : 1;
                const showLabel =
                  idx === 0 ||
                  idx === count - 1 ||
                  activeIndex === idx ||
                  idx % labelStep === 0;

                return (
                  <div key={d.tanggal} className="flex-1 text-center min-w-0">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-full text-[11px] whitespace-nowrap transition-all ${
                        activeIndex === idx
                          ? 'bg-gray-900 text-white font-semibold'
                          : showLabel
                            ? 'text-gray-500'
                            : 'text-transparent select-none'
                      }`}
                    >
                      {formatShortDate(d.tanggal)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
