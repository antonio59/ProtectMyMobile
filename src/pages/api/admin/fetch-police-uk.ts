import type { APIRoute } from 'astro';
import { api } from '../../../../convex/_generated/api';
import { getConvexClient, requireConvex } from '../../../lib/cron-utils';
import { requireApiKey } from '../../../lib/security';

const convex = getConvexClient();

// UK major cities with coordinates (same as seed-theft-data.ts)
const UK_LOCATIONS = [
  // London Boroughs
  { name: 'Westminster', lat: 51.4975, lng: -0.1357 },
  { name: 'Camden', lat: 51.5290, lng: -0.1255 },
  { name: 'Southwark', lat: 51.5028, lng: -0.0877 },
  { name: 'Hackney', lat: 51.5450, lng: -0.0553 },
  { name: 'Newham', lat: 51.5255, lng: 0.0352 },
  { name: 'Lambeth', lat: 51.4571, lng: -0.1231 },
  { name: 'Tower Hamlets', lat: 51.5099, lng: -0.0059 },
  { name: 'Islington', lat: 51.5465, lng: -0.1058 },
  { name: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938 },
  { name: 'Haringey', lat: 51.6000, lng: -0.1119 },

  // Other UK Cities
  { name: 'Manchester City Centre', lat: 53.4808, lng: -2.2426 },
  { name: 'Birmingham City Centre', lat: 52.4862, lng: -1.8904 },
  { name: 'Leeds City Centre', lat: 53.8008, lng: -1.5491 },
  { name: 'Glasgow City Centre', lat: 55.8642, lng: -4.2518 },
  { name: 'Liverpool City Centre', lat: 53.4084, lng: -2.9916 },
  { name: 'Bristol City Centre', lat: 51.4545, lng: -2.5879 },
  { name: 'Edinburgh City Centre', lat: 55.9533, lng: -3.1883 },
  { name: 'Sheffield City Centre', lat: 53.3811, lng: -1.4701 },
  { name: 'Cardiff City Centre', lat: 51.4816, lng: -3.1791 },
  { name: 'Newcastle City Centre', lat: 54.9783, lng: -1.6178 },
  { name: 'Nottingham City Centre', lat: 52.9548, lng: -1.1581 },
  { name: 'Belfast City Centre', lat: 54.5973, lng: -5.9301 },
  { name: 'Southampton City Centre', lat: 50.9097, lng: -1.4044 },
  { name: 'Brighton City Centre', lat: 50.8225, lng: -0.1372 },
];

// Police.uk API rate limit: 15 requests per second, but we'll be conservative
const RATE_LIMIT_MS = 100; // 10 requests per second to be safe

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPoliceUKData(lat: number, lng: number, yearMonth: string): Promise<unknown[]> {
  const url = `https://data.police.uk/api/crimes-street/theft-from-the-person?lat=${lat}&lng=${lng}&date=${yearMonth}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ProtectMyMobile/1.0 (Theft Prevention Research)',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      throw new Error(`Police.uk API error: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error(`Failed to fetch data for ${yearMonth} at ${lat},${lng}:`, error.message);
    return [];
  }
}

function generateMonthRange(startMonth: string, endMonth: string): string[] {
  const months: string[] = [];
  const [startYear, startMo] = startMonth.split('-').map(Number);
  const [endYear, endMo] = endMonth.split('-').map(Number);

  let currentYear = startYear;
  let currentMonth = startMo;

  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMo)) {
    months.push(`${currentYear}-${String(currentMonth).padStart(2, '0')}`);
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return months;
}

interface DateRange {
  startMonth: string;
  endMonth: string;
  months: string[];
}

function resolveDateRange(url: URL): DateRange | Response {
  const mode = url.searchParams.get('mode') || 'explicit';
  const recentMonths = parseInt(url.searchParams.get('months') || '3', 10);
  let startMonth = url.searchParams.get('startMonth') || '';
  let endMonth = url.searchParams.get('endMonth') || '';

  if (mode === 'recent') {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const startDate = new Date(now.getFullYear(), now.getMonth() - (recentMonths - 1), 1);
    endMonth = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
    startMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
  }

  if (!startMonth || !endMonth) {
    startMonth = '2024-01';
    endMonth = '2024-12';
  }

  const dateRegex = /^\d{4}-\d{2}$/;
  if (!dateRegex.test(startMonth) || !dateRegex.test(endMonth)) {
    return new Response(JSON.stringify({
      error: 'Invalid date format. Use YYYY-MM format (e.g., 2024-01)'
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const months = generateMonthRange(startMonth, endMonth);
  if (months.length === 0) {
    return new Response(JSON.stringify({
      error: 'Invalid date range. Start month must be before or equal to end month'
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  return { startMonth, endMonth, months };
}

interface FetchStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCrimes: number;
  byLocation: Record<string, number>;
  byMonth: Record<string, number>;
  recordsCreated: number;
  errors: string[];
}

async function fetchAllLocationData(months: string[]): Promise<{ stats: FetchStats; dataPoints: any[] }> {
  const stats: FetchStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalCrimes: 0,
    byLocation: {},
    byMonth: {},
    recordsCreated: 0,
    errors: [],
  };
  const dataPoints: any[] = [];

  for (const location of UK_LOCATIONS) {
    for (const month of months) {
      stats.totalRequests++;
      try {
        const crimes = await fetchPoliceUKData(location.lat, location.lng, month);
        stats.successfulRequests++;
        const crimeCount = crimes.length;
        stats.totalCrimes += crimeCount;
        stats.byLocation[location.name] = (stats.byLocation[location.name] || 0) + crimeCount;
        stats.byMonth[month] = (stats.byMonth[month] || 0) + crimeCount;

        if (crimeCount > 0) {
          dataPoints.push({
            date: `${month}-01`,
            locationName: location.name,
            latitude: location.lat,
            longitude: location.lng,
            theftCount: crimeCount,
            dataSource: 'police.uk API',
          });
        }
        await sleep(RATE_LIMIT_MS);
      } catch (error: any) {
        stats.failedRequests++;
        stats.errors.push(`${location.name} (${month}): ${error.message}`);
        if (error.message.includes('Rate limit')) {
          await sleep(1000);
        }
      }
    }
  }

  return { stats, dataPoints };
}

function buildSuccessResponse(stats: FetchStats, months: string[], dataPoints: any[], existing: any[]): object {
  const existingPolice = existing?.filter((e: any) => e.dataSource === 'police.uk API') || [];
  const existingKeys = new Set(existingPolice.map((e: any) => `${e.date}_${e.locationName}`));
  const newDataPoints = dataPoints.filter(dp => !existingKeys.has(`${dp.date}_${dp.locationName}`));

  return {
    success: true,
    message: `Fetched data from police.uk API for ${months.length} months across ${UK_LOCATIONS.length} locations`,
    dateRange: { months: months.length },
    locations: UK_LOCATIONS.length,
    apiStats: {
      totalRequests: stats.totalRequests,
      successful: stats.successfulRequests,
      failed: stats.failedRequests,
      successRate: stats.totalRequests > 0
        ? `${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%`
        : '0.0%',
    },
    crimeData: {
      totalCrimes: stats.totalCrimes,
      recordsCreated: newDataPoints.length,
      duplicatesSkipped: dataPoints.length - newDataPoints.length,
      existingRecords: existingPolice.length,
    },
    topLocations: Object.entries(stats.byLocation)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, crimes: count })),
    monthlyBreakdown: stats.byMonth,
    errors: stats.errors.length > 0 ? stats.errors.slice(0, 10) : undefined,
  };
}

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = requireApiKey(request);
  if (unauthorized) return unauthorized;

  const missingConvex = requireConvex(convex);
  if (missingConvex) return missingConvex;

  try {
    const dateResult = resolveDateRange(new URL(request.url));
    if (dateResult instanceof Response) return dateResult;
    const { startMonth, endMonth, months } = dateResult;

    const { stats, dataPoints } = await fetchAllLocationData(months);

    const existing = await convex.query(api.theftDataPoints.list, {
      startDate: `${startMonth}-01`,
      endDate: `${endMonth}-28`
    });

    const newDataPoints = dataPoints.filter(dp => {
      const key = `${dp.date}_${dp.locationName}`;
      return !existing?.some((e: any) => e.dataSource === 'police.uk API' && `${e.date}_${e.locationName}` === key);
    });

    if (newDataPoints.length > 0) {
      await convex.mutation(api.theftDataPoints.createBatch, {
        adminToken: import.meta.env.CRON_SECRET || process.env.CRON_SECRET,
        dataPoints: newDataPoints
      });
    }

    const response = buildSuccessResponse(stats, months, dataPoints, existing || []);
    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Police.uk fetch error:', message);
    return new Response(JSON.stringify({
      error: 'Failed to fetch police data',
      message,
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
