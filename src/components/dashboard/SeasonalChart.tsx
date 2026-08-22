'use client';

import { useRef } from 'react';
import { Sun } from 'lucide-react';
import { useChartJS } from '../../hooks/useChart';
import type { SeasonalData } from '../../hooks/useDashboardData';
import { CHART_SERIES_COLORS as COLORS, CHART_TOOLTIP_BASE, CHART_TICKS, CHART_GRID } from '@/lib/chartPalette';


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
              ...CHART_TOOLTIP_BASE,
              callbacks: {
                label: (ctx: any) => `Avg: ${ctx.raw} thefts`,
              },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: CHART_TICKS },
            y: { beginAtZero: true, grid: CHART_GRID, ticks: CHART_TICKS },
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
        <div className="bg-neutral-100 rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-success">{data.months[minIndex]}</div>
          <div className="text-[10px] text-success uppercase tracking-wide font-medium">Lowest month</div>
        </div>
      </div>
    </div>
  );
}
