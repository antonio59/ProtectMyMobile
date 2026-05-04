'use client';

import { BarChart3, MapPin, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Thefts Tracked" value={stats?.totalThefts.toLocaleString() || '0'} subtext="Across all data sources" icon={BarChart3} color="blue" />
        <StatCard label="Live Data Points" value={stats?.bySource['police.uk API']?.toLocaleString() || '0'} subtext="From police.uk API" icon={MapPin} color="red" />
        <StatCard label="Locations Monitored" value={stats?.uniqueLocations.toLocaleString() || '0'} subtext="UK cities & boroughs" icon={TrendingUp} color="green" />
        <StatCard label="Date Range" value={dateRangeText.split(' ').slice(-1)[0] || '—'} subtext={dateRangeText} icon={Calendar} color="purple" />
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
      <div className="bg-primary-subtle border border-blue-100 rounded-xl p-4 text-xs text-blue-800">
        <strong>About the data:</strong> Live trends are sourced from the police.uk API (theft-from-the-person category).
        This specifically covers street theft (snatching/pickpocketing) and may not include all mobile phone thefts.
        Static baseline figures from Met Police and Home Office estimates are shown elsewhere on this page.
      </div>
    </div>
  );
}
