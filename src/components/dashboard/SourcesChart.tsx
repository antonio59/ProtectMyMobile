'use client';

import { useRef } from 'react';
import { PieChart } from 'lucide-react';
import { useChartJS } from '../../hooks/useChart';
import type { SourceBreakdown } from '../../hooks/useDashboardData';

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

export default function SourcesChart({ data, totalRecords }: { data: SourceBreakdown; totalRecords: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useChartJS(
    canvasRef,
    (Chart, ctx) => {
      return new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.map((d) => d.name),
          datasets: [
            {
              data: data.map((d) => d.records),
              backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10, font: { size: 11 } } },
            tooltip: {
              backgroundColor: 'rgba(255,255,255,0.95)',
              titleColor: '#1f2937',
              bodyColor: '#4b5563',
              borderColor: '#e5e7eb',
              borderWidth: 1,
              callbacks: {
                label: (ctx: any) => {
                  const item = data[ctx.dataIndex];
                  const pct = totalRecords > 0 ? ((item.records / totalRecords) * 100).toFixed(1) : '0';
                  return `${item.name}: ${item.records} records (${pct}%) · ${item.thefts.toLocaleString()} thefts`;
                },
              },
            },
          },
        },
      });
    },
    [data, totalRecords]
  );

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 border border-border shadow-sm h-full flex flex-col">
      <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
        <PieChart className="size-5 text-destructive" />
        Data Sources
      </h3>
      <p className="text-xs text-muted-foreground mb-4">Composition of our statistics database</p>
      <div className="flex-1 min-h-[200px] flex items-center justify-center">
        <canvas ref={canvasRef} />
      </div>
      <div className="mt-3 space-y-1">
        {data.map((item, i) => {
          const pct = totalRecords > 0 ? ((item.records / totalRecords) * 100).toFixed(1) : '0';
          return (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-foreground">{item.name}</span>
              </div>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
