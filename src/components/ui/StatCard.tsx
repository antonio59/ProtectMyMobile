'use client';

import { CHART_KEY_COLORS as CHART_COLORS } from '@/lib/chartPalette';

export default function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  color: keyof typeof CHART_COLORS;
}) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${CHART_COLORS[color]}15` }}>
          <Icon className="size-5" style={{ color: CHART_COLORS[color] }} />
        </div>
      </div>
    </div>
  );
}
