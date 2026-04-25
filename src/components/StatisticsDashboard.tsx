'use client';

import { useEffect, useRef, useState } from 'react';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import {
  TrendingUp,
  MapPin,
  BarChart3,
  Calendar,
  RefreshCw,
  PieChart,
  Layers,
  Sun,
} from 'lucide-react';
import { Skeleton } from './ui/Skeleton';

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

const CHART_COLORS = {
  red: '#ef4444',
  orange: '#f97316',
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  pink: '#ec4899',
  cyan: '#06b6d4',
};

type MonthlyTrends = {
  months: string[];
  locations: string[];
  data: Array<Record<string, string | number>>;
};

type LocationRanking = {
  name: string;
  total: number;
  years: Record<string, number>;
  latestYear: string;
  yoyChange: number | null;
};

type YoYData = {
  years: string[];
  months: string[];
  data: Record<string, number[]>;
};

type SeasonalData = {
  months: string[];
  averages: number[];
  totals: number[];
};

type SourceBreakdown = Array<{ name: string; records: number; thefts: number }>;

type DashboardData = {
  trends: MonthlyTrends | null;
  rankings: LocationRanking[] | null;
  yoy: YoYData | null;
  seasonal: SeasonalData | null;
  sources: SourceBreakdown | null;
  stats: {
    totalRecords: number;
    totalThefts: number;
    bySource: Record<string, number>;
    topLocations: Array<[string, number]>;
    dateRange: { earliest: string | null; latest: string | null };
    uniqueLocations: number;
  } | null;
};

function getConvexUrl() {
  if (typeof window !== 'undefined') {
    return (import.meta as any).env?.PUBLIC_CONVEX_URL || (window as any).__CONVEX_URL__;
  }
  return (import.meta as any).env?.PUBLIC_CONVEX_URL;
}

function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const url = getConvexUrl();
    if (!url) {
      setError('Convex URL not configured');
      setLoading(false);
      return;
    }
    try {
      const client = new ConvexHttpClient(url);
      const [trends, rankings, yoy, seasonal, sources, stats] = await Promise.all([
        client.query(api.theftDataPoints.getMonthlyTrends, { topN: 8 }),
        client.query(api.theftDataPoints.getLocationRankings, { topN: 10, source: 'police.uk API' }),
        client.query(api.theftDataPoints.getYearOverYearComparison, { source: 'police.uk API' }),
        client.query(api.theftDataPoints.getSeasonalPatterns, { source: 'police.uk API' }),
        client.query(api.theftDataPoints.getSourceBreakdown, {}),
        client.query(api.theftDataPoints.getStats, {}),
      ]);
      setData({ trends, rankings, yoy, seasonal, sources, stats });
    } catch (e: any) {
      setError(e.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

// Generic Chart.js hook
function useChartJS(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  buildChart: (Chart: any, ctx: CanvasRenderingContext2D) => any,
  deps: React.DependencyList
) {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let instance: any;

    (async () => {
      const { default: Chart } = await import('chart.js/auto');
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      instance = buildChart(Chart, ctx);
      chartRef.current = instance;
    })();

    return () => {
      if (instance) instance.destroy();
      else if (chartRef.current) chartRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return chartRef;
}

function StatCard({
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
          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtext && <p className="text-xs text-neutral-400 mt-1">{subtext}</p>}
        </div>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${CHART_COLORS[color]}15` }}>
          <Icon className="size-5" style={{ color: CHART_COLORS[color] }} />
        </div>
      </div>
    </div>
  );
}

function TrendsChart({ data }: { data: MonthlyTrends }) {
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
          <p className="text-xs text-neutral-500 mt-0.5">
            {data.locations.length} locations · {data.data.length} months of live police.uk data
          </p>
        </div>
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 self-start">
          <button
            onClick={() => setViewMode('lines')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              viewMode === 'lines' ? 'bg-card text-foreground shadow-sm' : 'text-neutral-600'
            }`}
          >
            Lines
          </button>
          <button
            onClick={() => setViewMode('stacked')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              viewMode === 'stacked' ? 'bg-card text-foreground shadow-sm' : 'text-neutral-600'
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
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-lg font-bold text-neutral-700">
            {data.data.reduce((s, d) => s + (d.total as number), 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">Total tracked</div>
        </div>
        <div className={`rounded-lg p-3 ${monthChange && Number(monthChange) > 0 ? 'bg-destructive-subtle' : 'bg-green-50'}`}>
          <div className={`text-lg font-bold ${monthChange && Number(monthChange) > 0 ? 'text-destructive-hover' : 'text-green-700'}`}>
            {monthChange ? `${Number(monthChange) > 0 ? '+' : ''}${monthChange}%` : '—'}
          </div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">Month-on-month</div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-lg font-bold text-neutral-700">{data.locations.length}</div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-wide font-medium">Locations</div>
        </div>
      </div>

      <div className="w-full h-[300px] sm:h-[360px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function LocationsChart({ data }: { data: LocationRanking[] }) {
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
      <p className="text-xs text-neutral-500 mb-4">Ranked by total theft count from police.uk data</p>
      <div className="flex-1 min-h-[240px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function YearOverYearChart({ data }: { data: YoYData }) {
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
            tooltip: {
              backgroundColor: 'rgba(255,255,255,0.95)',
              titleColor: '#1f2937',
              bodyColor: '#4b5563',
              borderColor: '#e5e7eb',
              borderWidth: 1,
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#6b7280' } },
            y: { beginAtZero: true, grid: { color: '#e5e7eb', borderDash: [3, 3] }, ticks: { font: { size: 10 }, color: '#6b7280' } },
          },
        },
      });
    },
    [data, years]
  );

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 border border-border shadow-sm h-full flex flex-col">
      <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
        <Layers className="size-5 text-purple-500" />
        Year-over-Year Comparison
      </h3>
      <p className="text-xs text-neutral-500 mb-4">Same month across different years</p>
      <div className="flex-1 min-h-[240px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function SeasonalChart({ data }: { data: SeasonalData }) {
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
        <Sun className="size-5 text-amber-500" />
        Seasonal Pattern
      </h3>
      <p className="text-xs text-neutral-500 mb-4">Average thefts per month across all years</p>
      <div className="flex-1 min-h-[200px]">
        <canvas ref={canvasRef} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-destructive-subtle rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-destructive-hover">{data.months[maxIndex]}</div>
          <div className="text-[10px] text-destructive uppercase tracking-wide font-medium">Peak month</div>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-green-700">{data.months[minIndex]}</div>
          <div className="text-[10px] text-green-600 uppercase tracking-wide font-medium">Lowest month</div>
        </div>
      </div>
    </div>
  );
}

function SourcesChart({ data, totalRecords }: { data: SourceBreakdown; totalRecords: number }) {
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
        <PieChart className="size-5 text-pink-500" />
        Data Sources
      </h3>
      <p className="text-xs text-neutral-500 mb-4">Composition of our statistics database</p>
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
                <span className="text-neutral-700">{item.name}</span>
              </div>
              <span className="text-neutral-500">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StatisticsDashboard() {
  const { data, loading, error, refetch } = useDashboardData();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data || !data.trends) {
    return (
      <div className="bg-neutral-50 rounded-xl p-8 text-center border border-border">
        <BarChart3 className="size-12 mx-auto mb-3 text-neutral-300" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">Unable to Load Statistics</h3>
        <p className="text-sm text-neutral-500 max-w-md mx-auto mb-4">
          {error || 'Statistics data is not available at the moment.'}
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="size-4" />
          Try Again
        </button>
      </div>
    );
  }

  const { trends, rankings, yoy, seasonal, sources, stats } = data;
  const dateRangeText =
    stats?.dateRange.earliest && stats?.dateRange.latest
      ? `${new Date(stats.dateRange.earliest).toLocaleDateString('en-GB', {
          month: 'short',
          year: 'numeric',
        })} - ${new Date(stats.dateRange.latest).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
      : '';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Thefts Tracked"
          value={stats?.totalThefts.toLocaleString() || '0'}
          subtext="Across all data sources"
          icon={BarChart3}
          color="blue"
        />
        <StatCard
          label="Live Data Points"
          value={stats?.bySource['police.uk API']?.toLocaleString() || '0'}
          subtext="From police.uk API"
          icon={MapPin}
          color="red"
        />
        <StatCard
          label="Locations Monitored"
          value={stats?.uniqueLocations.toLocaleString() || '0'}
          subtext="UK cities & boroughs"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          label="Date Range"
          value={dateRangeText.split(' ').slice(-1)[0] || '—'}
          subtext={dateRangeText}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Main trend chart */}
      {trends && <TrendsChart data={trends} />}

      {/* Secondary charts grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {rankings && rankings.length > 0 && <LocationsChart data={rankings} />}
        {sources && sources.length > 0 && stats && (
          <SourcesChart data={sources} totalRecords={stats.totalRecords} />
        )}
      </div>

      {/* Tertiary charts grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {yoy && yoy.years.length > 1 && <YearOverYearChart data={yoy} />}
        {seasonal && <SeasonalChart data={seasonal} />}
      </div>

      {/* Data quality note */}
      <div className="bg-primary-subtle border border-blue-100 rounded-xl p-4 text-xs text-blue-800">
        <strong>About the data:</strong> Live trends are sourced from the police.uk API (theft-from-the-person category).
        This specifically covers street theft (snatching/pickpocketing) and may not include all mobile phone thefts.
        Static baseline figures from Met Police and Home Office estimates are shown elsewhere on this page.
      </div>
    </div>
  );
}
