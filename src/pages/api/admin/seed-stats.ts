import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { requireApiKey } from '../../../lib/security';

// Realistic data patterns for seeding
const CITIES = [
  { name: 'Manchester', lat: 53.4808, lng: -2.2426, risk: 'High' },
  { name: 'Birmingham', lat: 52.4862, lng: -1.8904, risk: 'High' },
  { name: 'Leeds', lat: 53.8008, lng: -1.5491, risk: 'Medium' },
  { name: 'Glasgow', lat: 55.8642, lng: -4.2518, risk: 'Medium' },
  { name: 'Liverpool', lat: 53.4084, lng: -2.9916, risk: 'Medium' },
];

const LONDON_BOROUGHS = [
  { name: 'Westminster', lat: 51.4975, lng: -0.1357, risk: 'Very High' },
  { name: 'Camden', lat: 51.5290, lng: -0.1255, risk: 'High' },
  { name: 'Hackney', lat: 51.5450, lng: -0.0553, risk: 'High' },
  { name: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, risk: 'High' },
  { name: 'Lambeth', lat: 51.4607, lng: -0.1163, risk: 'High' },
];

const MONTHS = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'];

function generateCount(baseRisk: string) {
  let base = 50;
  if (baseRisk === 'Low') base = 100;
  if (baseRisk === 'Medium') base = 300;
  if (baseRisk === 'High') base = 600;
  if (baseRisk === 'Very High') base = 1200;
  const randomFactor = Math.random() * 0.4 + 0.8;
  return Math.round(base * randomFactor);
}

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = requireApiKey(request);
  if (unauthorized) return unauthorized;

  const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return new Response('Convex not configured', { status: 500 });
  }

  const convex = new ConvexHttpClient(convexUrl);

  try {
    const dataPoints: Array<{
      date: string;
      locationName: string;
      latitude: number;
      longitude: number;
      theftCount: number;
      dataSource: string;
    }> = [];

    // Generate data for UK Cities
    for (const city of CITIES) {
      for (const month of MONTHS) {
        let seasonalMult = 1;
        if (month.endsWith('07') || month.endsWith('08') || month.endsWith('12')) seasonalMult = 1.2;
        const count = Math.round(generateCount(city.risk) * seasonalMult);
        
        dataPoints.push({
          date: `${month}-01`,
          locationName: city.name,
          latitude: city.lat,
          longitude: city.lng,
          theftCount: count,
          dataSource: 'simulated_police_data'
        });
      }
    }

    // Generate data for London Boroughs
    for (const borough of LONDON_BOROUGHS) {
      for (const month of MONTHS) {
        let seasonalMult = 1;
        if (month.endsWith('07') || month.endsWith('08') || month.endsWith('12')) seasonalMult = 1.25;
        const count = Math.round(generateCount(borough.risk) * seasonalMult);

        dataPoints.push({
          date: `${month}-01`,
          locationName: borough.name,
          latitude: borough.lat,
          longitude: borough.lng,
          theftCount: count,
          dataSource: 'simulated_met_data'
        });
      }
    }

    // Insert in batches
    const BATCH_SIZE = 50;
    for (let i = 0; i < dataPoints.length; i += BATCH_SIZE) {
      const batch = dataPoints.slice(i, i + BATCH_SIZE);
      await convex.mutation(api.theftDataPoints.createBatch, { adminToken: import.meta.env.CRON_SECRET || process.env.CRON_SECRET, dataPoints: batch });
    }

    return new Response(`Data seeded successfully: ${dataPoints.length} data points`, { status: 200 });
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};
