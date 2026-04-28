'use client';

import { useEffect, useState } from 'react';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

export type MonthlyTrends = {
  months: string[];
  locations: string[];
  data: Array<Record<string, string | number>>;
};

export type LocationRanking = {
  name: string;
  total: number;
  years: Record<string, number>;
  latestYear: string;
  yoyChange: number | null;
};

export type YoYData = {
  years: string[];
  months: string[];
  data: Record<string, number[]>;
};

export type SeasonalData = {
  months: string[];
  averages: number[];
  totals: number[];
};

export type SourceBreakdown = Array<{ name: string; records: number; thefts: number }>;

export type DashboardData = {
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

export function useDashboardData() {
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
