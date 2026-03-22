import { useState, useEffect } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { TrendingUp, MapPin, BarChart3, RefreshCw } from 'lucide-react';
import { ChartSkeleton } from './ui/Skeleton';

// Lazy-load Recharts to keep initial bundle small
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

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

export default function TheftTrendsChart() {
  const convex = useConvex();
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'stacked' | 'lines'>('stacked');

  useEffect(() => {
    let cancelled = false;
    async function fetchTrends() {
      try {
        const result = await convex.query(api.theftDataPoints.getMonthlyTrends, { topN: 6 });
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError('Unable to load trends data');
          setLoading(false);
        }
      }
    }
    fetchTrends();
    return () => { cancelled = true; };
  }, [convex]);

  if (loading) {
    return <ChartSkeleton />;
  }

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Re-fetch will happen via useEffect
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
        {error && (
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
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
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
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Stacked
          </button>
          <button
            onClick={() => setViewMode('lines')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'lines'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Lines
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-lg sm:text-xl font-bold text-blue-700">
            {latestMonth.total.toLocaleString()}
          </div>
          <div className="text-xs text-blue-600">Latest month total</div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-lg sm:text-xl font-bold text-neutral-700">
            {data.data.reduce((s, d) => s + d.total, 0).toLocaleString()}
          </div>
          <div className="text-xs text-neutral-500">All-time total</div>
        </div>
        <div className={`rounded-lg p-3 ${monthChange && Number(monthChange) > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
          <div className={`text-lg sm:text-xl font-bold ${monthChange && Number(monthChange) > 0 ? 'text-red-700' : 'text-green-700'}`}>
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
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'stacked' ? (
            <AreaChart data={data.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
              {locations.map((loc, i) => (
                <Area
                  key={loc}
                  type="monotone"
                  dataKey={loc}
                  stackId="1"
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          ) : (
            <AreaChart data={data.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
              {locations.map((loc, i) => (
                <Area
                  key={loc}
                  type="monotone"
                  dataKey={loc}
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.1}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
