#!/usr/bin/env node
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { UK_LOCATIONS, fetchPoliceUKData, generateMonthRange, sleep } from "../src/lib/police-uk";

const convexUrl = process.env.PUBLIC_CONVEX_URL;
const cronSecret = process.env.CRON_SECRET;

if (!convexUrl || !cronSecret) {
  console.error("Missing PUBLIC_CONVEX_URL or CRON_SECRET");
  process.exit(1);
}

const convex = new ConvexHttpClient(convexUrl);

const RATE_LIMIT_MS = 600;

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
