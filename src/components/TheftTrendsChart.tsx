'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { TrendingUp, MapPin, BarChart3, RefreshCw } from 'lucide-react';
import { ChartSkeleton } from './ui/Skeleton';
import type { ChartData, ChartOptions } from 'chart.js';

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
];

interface TrendPoint {
  month: string;
  label: string;
  total: number;
  [key: string]: string | number;
}

interface TrendsData {
  months: string[];
  locations: string[];
  data: TrendPoint[];
}

function getConvexUrl() {
  if (typeof window !== 'undefined') {
    return (import.meta as any).env?.PUBLIC_CONVEX_URL || (window as any).__CONVEX_URL__;
  }
  return (import.meta as any).env?.PUBLIC_CONVEX_URL;
}

function buildChartConfig(viewMode: 'stacked' | 'lines'): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 11 } } },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#6b7280' } },
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb', tickBorderDash: [3, 3] },
        ticks: { font: { size: 11 }, color: '#6b7280' },
      },
    },
  };
}

function buildDatasets(data: TrendPoint[], locations: string[], viewMode: 'stacked' | 'lines') {
  return locations.map((loc, i) => ({
    label: loc,
    data: data.map((d) => (typeof d[loc] === 'number' ? d[loc] : 0)),
    backgroundColor: viewMode === 'stacked'
      ? `${COLORS[i % COLORS.length]}99`
      : `${COLORS[i % COLORS.length]}1A`,
    borderColor: COLORS[i % COLORS.length],
    borderWidth: 2,
    fill: true,
    tension: 0.4,
  }));
}

function TrendSummaryStats({ data }: { data: TrendsData }) {
  const latestMonth = data.data[data.data.length - 1];
  const previousMonth = data.data.length > 1 ? data.data[data.data.length - 2] : null;
  const monthChange = previousMonth && previousMonth.total > 0
    ? (((latestMonth.total - previousMonth.total) / previousMonth.total) * 100).toFixed(1)
    : null;
  const allTimeTotal = data.data.reduce((s, d) => s + d.total, 0);

  const stats = [
    { label: 'Latest month total', value: latestMonth.total.toLocaleString(), bg: 'bg-primary-subtle', text: 'text-primary-hover' },
    { label: 'All-time total', value: allTimeTotal.toLocaleString(), bg: 'bg-neutral', text: 'text-foreground' },
    {
      label: 'Month-on-month',
      value: monthChange ? `${Number(monthChange) > 0 ? '+' : ''}${monthChange}%` : '—',
      bg: monthChange && Number(monthChange) > 0 ? 'bg-destructive-subtle' : 'bg-success-subtle',
      text: monthChange && Number(monthChange) > 0 ? 'text-destructive-hover' : 'text-success',
    },
    {
      label: 'Locations tracked',
      value: (
        <span className="flex items-center gap-1">
          <MapPin className="size-4" />
          {data.locations.length}
        </span>
      ),
      bg: 'bg-neutral',
      text: 'text-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} rounded-lg p-3`}>
          <div className={`text-lg sm:text-xl font-bold ${s.text}`}>{s.value}</div>
          <div className="text-xs text-muted-foreground">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function ChartErrorState({ error, hasData, onRetry }: { error: string | null; hasData: boolean; onRetry: () => void }) {
  return (
    <div className="bg-neutral rounded-xl p-8 text-center">
      <BarChart3 className="size-12 mx-auto mb-3 text-neutral-300" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {error ? 'Unable to Load Trends' : 'Trends Coming Soon'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
        {error
          ? 'There was a problem loading the theft trends data. Please try again.'
          : 'Monthly theft trends will appear here once data has been imported from police.uk. The data is automatically refreshed weekly.'
        }
      </p>
      {(error || !hasData) && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          <RefreshCw className="size-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

function ViewModeToggle({ viewMode, onChange }: { viewMode: 'stacked' | 'lines'; onChange: (v: 'stacked' | 'lines') => void }) {
  return (
    <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
      {(['stacked', 'lines'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            viewMode === mode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {mode === 'stacked' ? 'Stacked' : 'Lines'}
        </button>
      ))}
    </div>
  );
}

export default function TheftTrendsChart() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'stacked' | 'lines'>('stacked');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<unknown>(null);

  const fetchTrends = useCallback(async () => {
    let cancelled = false;
    const url = getConvexUrl();
    if (!url) {
      setError('Convex URL not configured');
      setLoading(false);
      return;
    }
    try {
      const client = new ConvexHttpClient(url);
      const result = await client.query(api.theftDataPoints.getMonthlyTrends, { topN: 6 });
      if (!cancelled) { setData(result); setLoading(false); }
    } catch (e: any) {
      if (!cancelled) { setError(e.message || 'Unable to load trends data'); setLoading(false); }
    }
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  useEffect(() => {
    if (!data || !canvasRef.current || loading) return;
    const { locations, data: chartData } = data;
    let chartInstance: unknown;

    async function initChart() {
      const { default: Chart } = await import('chart.js/auto');
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      if (chartRef.current) { (chartRef.current as { destroy: () => void }).destroy(); }

      const labels = chartData.map((d: TrendPoint) => d.label);
      const datasets = buildDatasets(chartData, locations, viewMode);

      chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets } as ChartData<'line'>,
        options: buildChartConfig(viewMode),
      });
      chartRef.current = chartInstance;
    }

    initChart();
    return () => { if (chartInstance) { (chartInstance as { destroy: () => void }).destroy(); } };
  }, [data, viewMode, loading]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchTrends();
  }, [fetchTrends]);

  if (loading) return <ChartSkeleton />;
  if (error || !data || data.data.length === 0) {
    return <ChartErrorState error={error} hasData={!!data && data.data.length > 0} onRetry={handleRetry} />;
  }

  const { locations, data: points } = data;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            Monthly Theft Trends
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {locations.length} locations tracked &middot; {points.length} months of data
          </p>
        </div>
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
      </div>
      <TrendSummaryStats data={data} />
      <div className="w-full h-[350px] sm:h-[400px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
