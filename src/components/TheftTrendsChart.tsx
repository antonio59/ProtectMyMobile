'use client';

import { useEffect, useRef, useState } from 'react';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { TrendingUp, MapPin, BarChart3, RefreshCw } from 'lucide-react';
import { ChartSkeleton } from './ui/Skeleton';

// Chart.js colors
const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
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

export default function TheftTrendsChart() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'stacked' | 'lines'>('stacked');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchTrends() {
      const url = getConvexUrl();
      if (!url) {
        if (!cancelled) {
          setError('Convex URL not configured');
          setLoading(false);
        }
        return;
      }
      try {
        const client = new ConvexHttpClient(url);
        const result = await client.query(api.theftDataPoints.getMonthlyTrends, { topN: 6 });
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || 'Unable to load trends data');
          setLoading(false);
        }
      }
    }
    fetchTrends();
    return () => { cancelled = true; };
  }, []);

  // Initialize Chart.js
  useEffect(() => {
    if (!data || !canvasRef.current || loading) return;

    let chartInstance: unknown;

    async function initChart() {
      const { default: Chart } = await import('chart.js/auto');
      
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      // Destroy existing chart
      if (chartRef.current) {
        (chartRef.current as { destroy: () => void }).destroy();
      }

      if (!data) return;
      const { locations, data: chartData } = data;
      const labels = chartData.map((d: TrendPoint) => d.label);

      // Create datasets
      const datasets = locations.map((loc: string, i: number) => ({
        label: loc,
        data: chartData.map((d: TrendPoint) => typeof d[loc] === 'number' ? d[loc] : 0),
        backgroundColor: viewMode === 'stacked' 
          ? COLORS[i % COLORS.length] + '99' // 60% opacity
          : COLORS[i % COLORS.length] + '1A', // 10% opacity for lines
        borderColor: COLORS[i % COLORS.length],
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }));

      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
                font: {
                  size: 11,
                },
              },
            },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#1f2937',
              bodyColor: '#4b5563',
              borderColor: '#e5e7eb',
              borderWidth: 1,
              padding: 12,
              titleFont: {
                size: 13,
                weight: 'bold',
              },
              bodyFont: {
                size: 12,
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  size: 11,
                },
                color: '#6b7280',
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: '#e5e7eb',
                tickBorderDash: [3, 3],
              },
              ticks: {
                font: {
                  size: 11,
                },
                color: '#6b7280',
              },
            },
          },
        },
      });

      chartRef.current = chartInstance;
    }

    initChart();

    return () => {
      if (chartInstance) {
        (chartInstance as { destroy: () => void }).destroy();
      }
    };
  }, [data, viewMode, loading]);

  if (loading) {
    return <ChartSkeleton />;
  }

  const handleRetry = () => {
    setLoading(true);
    setError(null);
  };

  if (error || !data || data.data.length === 0) {
    return (
      <div className="bg-neutral-50 rounded-xl p-8 text-center">
        <BarChart3 className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">
          {error ? 'Unable to Load Trends' : 'Trends Coming Soon'}
        </h3>
        <p className="text-sm text-neutral-500 max-w-md mx-auto mb-4">
          {error 
            ? 'There was a problem loading the theft trends data. Please try again.'
            : 'Monthly theft trends will appear here once data has been imported from police.uk. The data is automatically refreshed weekly.'
          }
        </p>
        {(error || data?.data.length === 0) && (
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  const { locations } = data;

  // Compute summary stats from the data
  const latestMonth = data.data[data.data.length - 1];
  const previousMonth = data.data.length > 1 ? data.data[data.data.length - 2] : null;
  const monthChange = previousMonth && previousMonth.total > 0
    ? (((latestMonth.total - previousMonth.total) / previousMonth.total) * 100).toFixed(1)
    : null;

  return (
    <div>
      {/* Header with toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Monthly Theft Trends
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {locations.length} locations tracked &middot; {data.data.length} months of data
          </p>
        </div>
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('stacked')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'stacked'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-neutral-600 hover:text-foreground'
            }`}
          >
            Stacked
          </button>
          <button
            onClick={() => setViewMode('lines')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'lines'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-neutral-600 hover:text-foreground'
            }`}
          >
            Lines
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
        <div className="bg-primary-subtle rounded-lg p-3">
          <div className="text-lg sm:text-xl font-bold text-primary-hover">
            {latestMonth.total.toLocaleString()}
          </div>
          <div className="text-xs text-primary">Latest month total</div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-lg sm:text-xl font-bold text-neutral-700">
            {data.data.reduce((s: number, d: TrendPoint) => s + d.total, 0).toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500">All-time total</div>
        </div>
        <div className={`rounded-lg p-3 ${monthChange && Number(monthChange) > 0 ? 'bg-destructive-subtle' : 'bg-green-50'}`}>
          <div className={`text-lg sm:text-xl font-bold ${monthChange && Number(monthChange) > 0 ? 'text-destructive-hover' : 'text-green-700'}`}>
            {monthChange ? `${Number(monthChange) > 0 ? '+' : ''}${monthChange}%` : '—'}
          </div>
          <div className="text-xs text-neutral-500">Month-on-month</div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-lg sm:text-xl font-bold text-neutral-700 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {locations.length}
          </div>
          <div className="text-xs text-neutral-500">Locations tracked</div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[350px] sm:h-[400px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
