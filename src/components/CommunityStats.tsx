// Community Stats Display - Top Metrics Cards
// Shows live statistics before voting

import { useEffect, useState } from 'react';
import type { CommunityStats } from '../lib/convexData';
import { getMostCommonLocation, getSecurityAdoptionRate } from '../lib/convexData';
import { TrendingDown, MapPin, Shield, AlertTriangle } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { statsRefreshTrigger } from '../lib/stores/communityStore';

interface Props {
  initialStats: CommunityStats | null;
}

export default function CommunityStatsDisplay({ initialStats }: Props) {
  const [stats, setStats] = useState<CommunityStats | null>(initialStats);
  const [loading, setLoading] = useState(!initialStats);
  const refreshCount = useStore(statsRefreshTrigger);

  useEffect(() => {
    // Skip first fetch if we have initialStats and it's the first render (refreshCount === 0)
    if (initialStats && refreshCount === 0) return;

    setLoading(true);
    fetch('/api/community/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setLoading(false);
      });
  }, [refreshCount]); // Re-run when refreshCount changes

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-neutral-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-neutral-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">Unable to load community statistics. Please try again later.</p>
      </div>
    );
  }

  const mostCommonLocation = getMostCommonLocation(stats);
  const securityAdoption = getSecurityAdoptionRate(stats);
  const recoveryRate = stats.recoveryStats.recoveryRate || 0;
  const reportingRate = stats.policeStats.reportingRate || 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">
          Community Insights
        </h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Based on <span className="font-bold text-primary">{stats.totalResponses.toLocaleString()}</span> anonymous responses from our community
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Recovery Rate */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-md p-6 border-2 border-red-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-700">Recovery Rate</h3>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <div className="mb-2">
            <div className="text-4xl font-bold text-red-600">{recoveryRate}%</div>
          </div>
          <div className="text-xs text-neutral-600">
            {100 - recoveryRate}% of phones are never recovered
          </div>
        </div>

        {/* Most Common Location */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-700">Top Risk Zone</h3>
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mb-2">
            <div className="text-xl font-bold text-blue-900 mb-1">{mostCommonLocation}</div>
          </div>
          <div className="text-xs text-neutral-600">
            Most common theft location
          </div>
        </div>

        {/* Security Adoption */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-700">Security Use</h3>
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div className="mb-2">
            <div className="text-4xl font-bold text-green-600">{securityAdoption}%</div>
          </div>
          <div className="text-xs text-neutral-600">
            Have some security protection
          </div>
        </div>

        {/* Police Reporting */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg shadow-md p-6 border-2 border-teal-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-700">Police Reports</h3>
            <AlertTriangle className="h-5 w-5 text-teal-600" />
          </div>
          <div className="mb-2">
            <div className="text-4xl font-bold text-teal-600">{reportingRate}%</div>
          </div>
          <div className="text-xs text-neutral-600">
            Reported theft to police
          </div>
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
        <h3 className="font-semibold text-neutral-900 mb-4 flex items-center">
          <span className="text-xl mr-2">📊</span> Key Findings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-700">
          <div className="flex items-start">
            <span className="text-primary mr-2">•</span>
            <span>
              <strong>{stats.totalStolen}</strong> people have experienced phone theft
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-primary mr-2">•</span>
            <span>
              <strong>{stats.securityStats.usingFindMyDevice}</strong> users have Find My Device enabled
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-primary mr-2">•</span>
            <span>
              <strong>{stats.locationStats.publicTransport}</strong> thefts occurred on public transport
            </span>
          </div>
          <div className="flex items-start">
            <span className="text-primary mr-2">•</span>
            <span>
              <strong>{stats.replacementStats.insurance}</strong> people used insurance to replace their phone
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
