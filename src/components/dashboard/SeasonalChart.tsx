'use client';

import { useRef } from 'react';
import { Sun } from 'lucide-react';
import { useChartJS } from '../../hooks/useChart';
import type { SeasonalData } from '../../hooks/useDashboardData';

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

export default function SeasonalChart({ data }: { data: SeasonalData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useChartJS(
    canvasRef,
    (Chart, ctx) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
      gradient.addColorStop(1, 'rgba(245, 158, 11, 0.05)');

      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.months,
          datasets: [
            {
              label: 'Average Thefts',
              data: data.averages,
              backgroundColor: gradient,
              borderColor: '#f59e0b',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: '#fff',
              pointBorderColor: '#f59e0b',
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
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
                label: (ctx: any) => `Avg: ${ctx.raw} thefts`,
              },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#6b7280' } },
            y: { beginAtZero: true, grid: { color: '#e5e7eb', borderDash: [3, 3] }, ticks: { font: { size: 10 }, color: '#6b7280' } },
          },
        },
      });
    },
    [data]
  );

  const maxIndex = data.averages.indexOf(Math.max(...data.averages));
  const minIndex = data.averages.indexOf(Math.min(...data.averages));

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 border border-border shadow-sm h-full flex flex-col">
      <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
        <Sun className="size-5 text-warning" />
        Seasonal Pattern
      </h3>
      <p className="text-xs text-muted-foreground mb-4">Average thefts per month across all years</p>
      <div className="flex-1 min-h-[200px]">
        <canvas ref={canvasRef} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-destructive-subtle rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-destructive-hover">{data.months[maxIndex]}</div>
          <div className="text-[10px] text-destructive uppercase tracking-wide font-medium">Peak month</div>
        </div>
        <div className="bg-success-subtle rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-success">{data.months[minIndex]}</div>
          <div className="text-[10px] text-success uppercase tracking-wide font-medium">Lowest month</div>
        </div>
      </div>
    </div>
  );
}
