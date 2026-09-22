#!/usr/bin/env node
/**
 * Deletes the synthetic seed series ("Met Police 2024", "Home Office Est.")
 * from theftDataPoints. These were monthly estimates with fabricated
 * seasonality that overlapped police.uk actuals and inflated every unfiltered
 * aggregate. Real police.uk coverage now exists for the same locations.
 *
 * Requires the convex functions to be deployed first (deleteBySource is new).
 *
 * Run:
 *   PUBLIC_CONVEX_URL=https://<prod>.convex.cloud \
 *   CONVEX_ADMIN_TOKEN=<admin token> \
 *   npx tsx scripts/delete-seed-data.ts
 *
 * Dry run first (default): pass --apply to actually delete.
 */
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const SEED_SOURCES = ["Met Police 2024", "Home Office Est."];
const PROTECTED = "police.uk API";

const convexUrl = process.env.PUBLIC_CONVEX_URL;
const adminToken = process.env.CONVEX_ADMIN_TOKEN || process.env.CRON_SECRET;
const apply = process.argv.includes("--apply");

if (!convexUrl || !adminToken) {
  console.error("Missing PUBLIC_CONVEX_URL or CONVEX_ADMIN_TOKEN/CRON_SECRET");
  process.exit(1);
}

const convex = new ConvexHttpClient(convexUrl);

async function main() {
  const all: any[] = await convex.query(api.theftDataPoints.list, {});
  const bySource: Record<string, number> = {};
  for (const p of all) bySource[p.dataSource] = (bySource[p.dataSource] || 0) + 1;
  console.log("Current sources:", bySource);

  if (!apply) {
    console.log("\nDRY RUN — would delete:");
    for (const s of SEED_SOURCES) console.log(`  ${s}: ${bySource[s] ?? 0} records`);
    console.log(`  ${PROTECTED}: ${bySource[PROTECTED] ?? 0} records (kept)`);
    console.log("\nRe-run with --apply to delete.");
    return;
  }

  for (const source of SEED_SOURCES) {
    const res = await convex.mutation(api.theftDataPoints.deleteBySource, {
      adminToken,
      source,
    });
    console.log(`Deleted ${res.deleted} records from "${source}"`);
  }

  const remaining = await convex.query(api.theftDataPoints.getStats, {});
  console.log(`\nRemaining: ${remaining.totalRecords} records, ${remaining.totalThefts} thefts (${remaining.dateRange.earliest} -> ${remaining.dateRange.latest})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
