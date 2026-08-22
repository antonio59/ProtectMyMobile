'use client';

import { useRef } from 'react';
import { Layers } from 'lucide-react';
import { useChartJS } from '../../hooks/useChart';
import type { YoYData } from '../../hooks/useDashboardData';
import { CHART_SERIES_COLORS as COLORS, CHART_TOOLTIP_BASE, CHART_TICKS, CHART_GRID } from '@/lib/chartPalette';


export default function YearOverYearChart({ data }: { data: YoYData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const years = data.years.slice(-4); // Show last 4 years max

  useChartJS(
    canvasRef,
    (Chart, ctx) => {
      const datasets = years.map((year, i) => ({
        label: year,
        data: data.data[year],
        backgroundColor: COLORS[(i + 2) % COLORS.length] + 'CC',
        borderColor: COLORS[(i + 2) % COLORS.length],
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      }));

      return new Chart(ctx, {
        type: 'bar',
        data: { labels: data.months, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10, font: { size: 11 } } },
            tooltip: { ...CHART_TOOLTIP_BASE },
          },
          scales: {
            x: { grid: { display: false }, ticks: CHART_TICKS },
            y: { beginAtZero: true, grid: CHART_GRID, ticks: CHART_TICKS },
          },
        },
      });
    },
    [data, years]
  );

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 border border-border shadow-sm h-full flex flex-col">
      <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
        <Layers className="size-5 text-primary" />
        Year-over-Year Comparison
      </h3>
      <p className="text-xs text-muted-foreground mb-4">Same month across different years</p>
      <div className="flex-1 min-h-[240px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
