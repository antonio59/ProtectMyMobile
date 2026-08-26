/**
 * Single source of truth for the London borough phone-theft hotspot figures.
 *
 * Theft-from-the-person offences recorded within roughly 1 mile of each borough
 * centre, July 2025 - June 2026 (police.uk street-level recorded crime).
 *
 * Rendered by /statistics, /the-problem and the London borough pages under
 * /[location]. Update the numbers here and every page follows.
 */

export type HotspotRisk = 'Extreme' | 'Very High' | 'High';

export interface LondonHotspot {
  /** Borough name as displayed. */
  borough: string;
  /** Recorded theft-from-the-person offences. */
  thefts: number;
  /** Period the count covers. */
  year: string;
  /** Human-readable source name. */
  sourceName: string;
  /** Link to the source. */
  sourceUrl: string;
  /** Short description of the worst-affected areas within the borough. */
  description: string;
  /** Editorial risk band used for badges. */
  risk: HotspotRisk;
}

const source = {
  sourceName: 'police.uk recorded crime data, 12 months to June 2026',
  sourceUrl: 'https://data.police.uk/docs/',
};

// TODO: when you next check these six figures against police.uk, export the date
// here and render it as "last verified" beside the source line. Nothing asserts a
// verification date today, because nobody has re-checked them.

/** Shared source metadata, for rendering a single "Source: ..." line. */
export const hotspotsSource = source;

/** Boroughs, highest recorded thefts first. Index order is the borough ranking. */
export const londonHotspots: LondonHotspot[] = [
  {
    borough: 'Westminster',
    thefts: 16639,
    year: 'Jul 2025 - Jun 2026',
    ...source,
    description: 'Tourist areas, West End, transport hubs',
    risk: 'Extreme',
  },
  {
    borough: 'Camden',
    thefts: 6651,
    year: 'Jul 2025 - Jun 2026',
    ...source,
    description: 'Markets, nightlife, busy high streets',
    risk: 'Very High',
  },
  {
    borough: 'Southwark',
    thefts: 5571,
    year: 'Jul 2025 - Jun 2026',
    ...source,
    description: 'Borough Market, London Bridge, South Bank',
    risk: 'Very High',
  },
  {
    borough: 'Hackney',
    thefts: 1610,
    year: 'Jul 2025 - Jun 2026',
    ...source,
    description: 'Nightlife spots, busy cafes',
    risk: 'High',
  },
  {
    borough: 'Lambeth',
    thefts: 1523,
    year: 'Jul 2025 - Jun 2026',
    ...source,
    description: 'Brixton, Waterloo, South Bank fringe',
    risk: 'High',
  },
  {
    borough: 'Tower Hamlets',
    thefts: 709,
    year: 'Jul 2025 - Jun 2026',
    ...source,
    description: 'Shoreditch, Brick Lane, Spitalfields Market',
    risk: 'High',
  },
];

/** Recorded thefts for one borough. Throws at build time if the name is unknown. */
export function hotspotThefts(borough: string): number {
  const match = londonHotspots.find((h) => h.borough === borough);
  if (!match) throw new Error(`Unknown London hotspot borough: ${borough}`);
  return match.thefts;
}

/** 1-based rank of a borough within the hotspot dataset (1 = worst affected). */
export function hotspotRank(borough: string): number {
  const index = londonHotspots.findIndex((h) => h.borough === borough);
  if (index === -1) throw new Error(`Unknown London hotspot borough: ${borough}`);
  return index + 1;
}
