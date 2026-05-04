'use client';

import { useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useChartJS } from '../../hooks/useChart';
import type { MonthlyTrends } from '../../hooks/useDashboardData';

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f43f5e', // rose
  '#06b6d4', // cyan
];

export default function TrendsChart({ data }: { data: MonthlyTrends }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode, setViewMode] = useState<'stacked' | 'lines'>('lines');

  useChartJS(
    canvasRef,
    (Chart, ctx) => {
      const labels = data.data.map((d) => d.label as string);
      const datasets = data.locations.map((loc, i) => ({
        label: loc,
        data: data.data.map((d) => (typeof d[loc] === 'number' ? d[loc] : 0)),
        backgroundColor: viewMode === 'stacked' ? COLORS[i % COLORS.length] + '99' : COLORS[i % COLORS.length] + '1A',
        borderColor: COLORS[i % COLORS.length],
        borderWidth: 2,
        fill: viewMode === 'stacked',
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 5,
      }));

      return new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 10, padding: 12, font: { size: 11 }, usePointStyle: true },
            },
            tooltip: {
              backgroundColor: 'rgba(255,255,255,0.95)',
              titleColor: '#1f2937',
              bodyColor: '#4b5563',
              borderColor: '#e5e7eb',
              borderWidth: 1,
              padding: 10,
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#6b7280', maxRotation: 45 } },
            y: {
              beginAtZero: true,
              stacked: viewMode === 'stacked',
              grid: { color: '#e5e7eb', borderDash: [3, 3] },
              ticks: { font: { size: 10 }, color: '#6b7280' },
            },
          },
        },
      });
    },
    [data, viewMode]
  );

  const latest = data.data[data.data.length - 1];
  const previous = data.data.length > 1 ? data.data[data.data.length - 2] : null;
  const monthChange =
    previous && (previous.total as number) > 0
      ? ((((latest.total as number) - (previous.total as number)) / (previous.total as number)) * 100).toFixed(1)
      : null;

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="size-5 text-blue-500" />
            Monthly Theft Trends
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.locations.length} locations · {data.data.length} months of live police.uk data
          </p>
        </div>
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 self-start">
          <button
            onClick={() => setViewMode('lines')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              viewMode === 'lines' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Lines
          </button>
          <button
            onClick={() => setViewMode('stacked')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              viewMode === 'stacked' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Stacked
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-primary-subtle rounded-lg p-3">
          <div className="text-lg font-bold text-primary-hover">{(latest.total as number).toLocaleString()}</div>
          <div className="text-[10px] text-primary uppercase tracking-wide font-medium">Latest month</div>
        </div>
        <div className="bg-neutral rounded-lg p-3">
          <div className="text-lg font-bold text-foreground">
            {data.data.reduce((s, d) => s + (d.total as number), 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Total tracked</div>
        </div>
        <div className={`rounded-lg p-3 ${monthChange && Number(monthChange) > 0 ? 'bg-destructive-subtle' : 'bg-green-50'}`}>
          <div className={`text-lg font-bold ${monthChange && Number(monthChange) > 0 ? 'text-destructive-hover' : 'text-green-700'}`}>
            {monthChange ? `${Number(monthChange) > 0 ? '+' : ''}${monthChange}%` : '—'}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Month-on-month</div>
        </div>
        <div className="bg-neutral rounded-lg p-3">
          <div className="text-lg font-bold text-foreground">{data.locations.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Locations</div>
        </div>
      </div>

      <div className="w-full h-[300px] sm:h-[360px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
