'use client';

import { BarChart3, MapPin, TrendingUp, Calendar, RefreshCw, Download } from 'lucide-react';
import { Skeleton } from './ui/Skeleton';
import { useDashboardData } from '../hooks/useDashboardData';
import StatCard from './ui/StatCard';
import TrendsChart from './dashboard/TrendsChart';
import LocationsChart from './dashboard/LocationsChart';
import YearOverYearChart from './dashboard/YearOverYearChart';
import SeasonalChart from './dashboard/SeasonalChart';
import SourcesChart from './dashboard/SourcesChart';

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
      <div className="bg-neutral rounded-xl p-8 text-center border border-border">
        <BarChart3 className="size-12 mx-auto mb-3 text-neutral-300" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load Statistics</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          {error || 'Statistics data is not available at the moment.'}
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          <RefreshCw className="size-4" />
          Try Again
        </button>
      </div>
    );
  }

  const { trends, rankings, yoy, seasonal, sources, stats } = data;
  const latestMonth = stats?.dateRange.latest
    ? new Date(stats.dateRange.latest).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : '—';
  const dateRangeText =
    stats?.dateRange.earliest && stats?.dateRange.latest
      ? `Since ${new Date(stats.dateRange.earliest).toLocaleDateString('en-GB', {
          month: 'short',
          year: 'numeric',
        })}`
      : '';

  // Export exactly what the charts render: month, total, per-location counts.
  const exportCsv = () => {
    if (!trends) return;
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['month', 'total', ...trends.locations];
    const lines = trends.data.map((d) => [
      d.month ?? d.label,
      d.total ?? 0,
      ...trends.locations.map((loc) => (typeof d[loc] === 'number' ? d[loc] : 0)),
    ]);
    const csv = [header, ...lines]
      .map((row) => row.map(escape).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'protectmymobile-theft-trends.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Recorded Thefts" value={(stats?.theftsBySource?.['police.uk API'] ?? stats?.totalThefts ?? 0).toLocaleString()} subtext="police.uk theft-from-the-person" icon={BarChart3} color="blue" />
        <StatCard label="Live Data Points" value={stats?.bySource['police.uk API']?.toLocaleString() || '0'} subtext="From police.uk API" icon={MapPin} color="red" />
        <StatCard label="Locations Monitored" value={stats?.uniqueLocations.toLocaleString() || '0'} subtext="UK cities & boroughs" icon={TrendingUp} color="green" />
        <StatCard label="Latest Data" value={latestMonth} subtext={dateRangeText} icon={Calendar} color="purple" />
      </div>
      {trends && <TrendsChart data={trends} />}
      <div className="grid md:grid-cols-2 gap-4">
        {rankings && rankings.length > 0 && <LocationsChart data={rankings} />}
        {sources && sources.length > 0 && stats && <SourcesChart data={sources} totalRecords={stats.totalRecords} />}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {yoy && yoy.years.length > 1 && <YearOverYearChart data={yoy} />}
        {seasonal && <SeasonalChart data={seasonal} />}
      </div>
      <div className="bg-primary-subtle border border-border rounded-xl p-4 text-xs text-primary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p>
          <strong>About the data:</strong> Live trends are sourced from the police.uk API (theft-from-the-person category).
          This specifically covers street theft (snatching/pickpocketing) and may not include all mobile phone thefts.
          Static baseline figures from Met Police and Home Office estimates are shown elsewhere on this page.
        </p>
        {trends && (
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-foreground font-medium hover:bg-neutral-100 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <Download className="size-3.5" />
            Download CSV
          </button>
        )}
      </div>
    </div>
  );
}
