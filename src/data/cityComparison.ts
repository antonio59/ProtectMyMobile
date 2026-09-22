/**
 * Major-city comparison table shown on /statistics.
 *
 * Theft-from-the-person offences recorded within roughly 1 mile of each city
 * centre over a rolling 12-month police.uk window, with the year-on-year
 * change computed from the prior 12-month window — never a hand-written
 * percentage. London borough figures come from the shared hotspot dataset.
 *
 * Verify against the live database with:
 *   PUBLIC_CONVEX_URL=... npx tsx scripts/verify-statistics.ts
 * Greater Manchester Police does not publish street-level data to police.uk,
 * so Manchester is excluded.
 */

import { hotspotThefts } from './hotspots';

export const COMPARISON_WINDOW = {
  current: 'Jul 2025 - Jun 2026',
  previous: 'Jul 2024 - Jun 2025',
  /** Inclusive YYYY-MM-DD bounds used to recompute these figures. */
  currentStart: '2025-07-01',
  currentEnd: '2026-06-30',
  previousStart: '2024-07-01',
  previousEnd: '2025-06-30',
};

export interface CityComparisonEntry {
  /** Display name. */
  city: string;
  /** theftDataPoints.locationName used for verification lookups. */
  locationName: string;
  /** Offences in the current window. */
  thefts: number;
  /** Offences in the prior window, same geometry. */
  previousThefts: number;
  slug: string;
}

const entries: CityComparisonEntry[] = [
  { city: 'London (Westminster area)', locationName: 'Westminster', thefts: hotspotThefts('Westminster'), previousThefts: 10085, slug: 'westminster' },
  { city: 'Camden (London)', locationName: 'Camden', thefts: hotspotThefts('Camden'), previousThefts: 9324, slug: 'camden' },
  { city: 'Hackney (London)', locationName: 'Hackney', thefts: hotspotThefts('Hackney'), previousThefts: 1640, slug: 'hackney' },
  { city: 'Tower Hamlets (London)', locationName: 'Tower Hamlets', thefts: hotspotThefts('Tower Hamlets'), previousThefts: 869, slug: 'tower-hamlets' },
  { city: 'Leeds', locationName: 'Leeds City Centre', thefts: 528, previousThefts: 599, slug: 'leeds' },
  { city: 'Birmingham', locationName: 'Birmingham City Centre', thefts: 436, previousThefts: 554, slug: 'birmingham' },
  { city: 'Liverpool', locationName: 'Liverpool City Centre', thefts: 376, previousThefts: 479, slug: 'liverpool' },
  { city: 'Brighton', locationName: 'Brighton City Centre', thefts: 308, previousThefts: 401, slug: 'brighton' },
  { city: 'Bristol', locationName: 'Bristol City Centre', thefts: 282, previousThefts: 193, slug: 'bristol' },
];

/** "+12.3% YoY" / "-4.0% YoY" — computed, so the figure can never drift from the counts. */
export function formatYoY(current: number, previous: number): string {
  if (previous <= 0) return 'n/a';
  const pct = ((current - previous) / previous) * 100;
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}% YoY`;
}

/** Shape the /statistics template already renders. */
export const cityComparison = entries.map((e) => ({
  city: e.city,
  thefts: e.thefts,
  previousThefts: e.previousThefts,
  locationName: e.locationName,
  year: COMPARISON_WINDOW.current,
  change: formatYoY(e.thefts, e.previousThefts),
  slug: e.slug,
}));
