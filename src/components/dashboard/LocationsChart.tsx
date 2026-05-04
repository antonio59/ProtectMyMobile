'use client';

import { useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useChartJS } from '../../hooks/useChart';
import type { LocationRanking } from '../../hooks/useDashboardData';

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

export default function LocationsChart({ data }: { data: LocationRanking[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const limited = data.slice(0, 10);

  useChartJS(
    canvasRef,
    (Chart, ctx) => {
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: limited.map((d) => d.name),
          datasets: [
            {
              label: 'Total Thefts',
              data: limited.map((d) => d.total),
              backgroundColor: limited.map((_, i) => COLORS[i % COLORS.length] + 'CC'),
              borderRadius: 6,
              barPercentage: 0.7,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(255,255,255,0.95)',
              titleColor: '#1f2937',
              bodyColor: '#4b5563',
              borderColor: '#e5e7eb',
              borderWidth: 1,
              callbacks: {
                afterLabel: (ctx: any) => {
                  const item = limited[ctx.dataIndex];
                  return item.yoyChange !== null ? `YoY change: ${item.yoyChange > 0 ? '+' : ''}${item.yoyChange}%` : '';
                },
              },
            },
          },
          scales: {
            x: { grid: { color: '#e5e7eb', borderDash: [3, 3] }, ticks: { font: { size: 10 }, color: '#6b7280' } },
            y: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#374151' } },
          },
        },
      });
    },
    [limited]
  );

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 border border-border shadow-sm h-full flex flex-col">
      <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
        <MapPin className="size-5 text-red-500" />
        Top Theft Hotspots
      </h3>
      <p className="text-xs text-muted-foreground mb-4">Ranked by total theft count from police.uk data</p>
      <div className="flex-1 min-h-[240px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
