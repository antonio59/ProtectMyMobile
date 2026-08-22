'use client';

import { useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useChartJS } from '../../hooks/useChart';
import type { LocationRanking } from '../../hooks/useDashboardData';
import { CHART_SERIES_COLORS as COLORS, CHART_TOOLTIP_BASE, CHART_TICKS, CHART_GRID } from '@/lib/chartPalette';


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
              ...CHART_TOOLTIP_BASE,
              callbacks: {
                afterLabel: (ctx: any) => {
                  const item = limited[ctx.dataIndex];
                  return item.yoyChange !== null ? `YoY change: ${item.yoyChange > 0 ? '+' : ''}${item.yoyChange}%` : '';
                },
              },
            },
          },
          scales: {
            x: { grid: CHART_GRID, ticks: CHART_TICKS },
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
        <MapPin className="size-5 text-destructive" />
        Top Theft Hotspots
      </h3>
      <p className="text-xs text-muted-foreground mb-4">Ranked by total theft count from police.uk data</p>
      <div className="flex-1 min-h-[240px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
