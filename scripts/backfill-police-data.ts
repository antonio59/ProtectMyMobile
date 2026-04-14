#!/usr/bin/env node
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.PUBLIC_CONVEX_URL;
const cronSecret = process.env.CRON_SECRET;

if (!convexUrl || !cronSecret) {
  console.error("Missing PUBLIC_CONVEX_URL or CRON_SECRET");
  process.exit(1);
}

const convex = new ConvexHttpClient(convexUrl);

const UK_LOCATIONS = [
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

const RATE_LIMIT_MS = 600;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPoliceUKData(lat: number, lng: number, yearMonth: string, retries = 3): Promise<any[]> {
  const url = `https://data.police.uk/api/crimes-street/theft-from-the-person?lat=${lat}&lng=${lng}&date=${yearMonth}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'ProtectMyMobile/1.0 (Theft Prevention Research)' },
      });
      if (response.status === 429) {
        const delay = 2000 * attempt;
        console.log(`  Rate limit ${yearMonth} @ ${lat},${lng}, waiting ${delay}ms (attempt ${attempt})`);
        await sleep(delay);
        continue;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      if (attempt === retries) {
        console.error(`  Failed ${yearMonth} @ ${lat},${lng}:`, error.message);
        return [];
      }
      await sleep(1000 * attempt);
    }
  }
  return [];
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

async function main() {
  const startMonth = process.argv[2] || '2025-01';
  const endMonth = process.argv[3] || '2025-03';
  const months = generateMonthRange(startMonth, endMonth);

  console.log(`Backfilling police data: ${months[0]} to ${months[months.length - 1]}`);
  console.log(`Locations: ${UK_LOCATIONS.length}, Months: ${months.length}`);

  const existing = await convex.query(api.theftDataPoints.list, {
    startDate: `${startMonth}-01`,
    endDate: `${endMonth}-28`,
  });
  const existingKeys = new Set(
    existing?.filter((e: any) => e.dataSource === 'police.uk API')
      .map((e: any) => `${e.date}_${e.locationName}`)
  );
  console.log(`Existing police.uk records in range: ${existingKeys.size}`);

  const dataPoints: any[] = [];
  let totalCrimes = 0;
  let skipped = 0;

  for (const location of UK_LOCATIONS) {
    for (const month of months) {
      const dateKey = `${month}-01`;
      const existingKey = `${dateKey}_${location.name}`;
      if (existingKeys.has(existingKey)) {
        skipped++;
        continue;
      }

      const crimes = await fetchPoliceUKData(location.lat, location.lng, month);
      if (crimes.length > 0) {
        dataPoints.push({
          date: dateKey,
          locationName: location.name,
          latitude: location.lat,
          longitude: location.lng,
          theftCount: crimes.length,
          dataSource: 'police.uk API',
        });
        totalCrimes += crimes.length;
      }
      await sleep(RATE_LIMIT_MS);
    }
    process.stdout.write('.');
  }
  console.log('\n');

  if (dataPoints.length > 0) {
    const CHUNK_SIZE = 50;
    let created = 0;
    for (let i = 0; i < dataPoints.length; i += CHUNK_SIZE) {
      const chunk = dataPoints.slice(i, i + CHUNK_SIZE);
      try {
        const ids = await convex.mutation(api.theftDataPoints.createBatch, {
          adminToken: cronSecret,
          dataPoints: chunk,
        });
        created += ids.length;
        console.log(`Uploaded chunk ${Math.floor(i / CHUNK_SIZE) + 1}: ${ids.length} records`);
      } catch (e: any) {
        console.error(`Failed uploading chunk ${Math.floor(i / CHUNK_SIZE) + 1}:`, e.message);
      }
    }
    console.log(`Total created: ${created} new records (${totalCrimes} total crimes)`);
  } else {
    console.log('No new records to create');
  }
  console.log(`Skipped duplicates: ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
