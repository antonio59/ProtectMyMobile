#!/usr/bin/env node
/**
 * Verifies the hardcoded theft figures rendered on /statistics (and the pages
 * that reuse src/data/hotspots.ts and src/data/cityComparison.ts) against the
 * live theftDataPoints table in Convex.
 *
 * Run: PUBLIC_CONVEX_URL=... npx tsx scripts/verify-statistics.ts
 * (PUBLIC_CONVEX_URL is read from .env automatically if present.)
 *
 * Exits non-zero when a published figure drifts from the police.uk data it
 * claims to summarise — run after each police.uk refresh lands, and whenever
 * the hotspot/comparison windows are rolled forward.
 */
import { readFileSync } from "node:fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { londonHotspots } from "../src/data/hotspots";
import { cityComparison, COMPARISON_WINDOW } from "../src/data/cityComparison";

// Minimal .env loading (no dotenv dependency in this repo).
if (!process.env.PUBLIC_CONVEX_URL) {
  try {
    const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
    const line = env.split("\n").find((l) => l.startsWith("PUBLIC_CONVEX_URL="));
    if (line) process.env.PUBLIC_CONVEX_URL = line.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
  } catch {}
}

const convexUrl = process.env.PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error("Missing PUBLIC_CONVEX_URL (set it or add it to .env)");
  process.exit(1);
}

const SOURCE = "police.uk API";

interface Point {
  date: string;
  locationName: string;
  theftCount: number;
  dataSource: string;
}

function monthLabel(isoMonth: string): string {
  return new Date(`${isoMonth}-01`).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

async function main() {
  const convex = new ConvexHttpClient(convexUrl!);
  const all: Point[] = await convex.query(api.theftDataPoints.list, {});
  const points = all.filter((p) => p.dataSource === SOURCE);

  // Latest complete month present in the data defines the rolling window.
  const months = [...new Set(points.map((p) => p.date.slice(0, 7)))].sort();
  const latestMonth = months[months.length - 1];
  if (!latestMonth) {
    console.error("No police.uk data found.");
    process.exit(1);
  }

  // 12-month window ending at latestMonth, and the 12 months before it.
  const end = new Date(`${latestMonth}-01`);
  const curStart = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 11, 1));
  const prevStart = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 23, 1));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const win = { curStart: iso(curStart), curEnd: `${latestMonth}-31`, prevStart: iso(prevStart), prevEnd: iso(new Date(Date.UTC(curStart.getUTCFullYear(), curStart.getUTCMonth(), 0))) };

  const totals = (start: string, stop: string) => {
    const t: Record<string, number> = {};
    for (const p of points) {
      if (p.date >= start && p.date <= stop) {
        t[p.locationName] = (t[p.locationName] || 0) + p.theftCount;
      }
    }
    return t;
  };
  const cur = totals(win.curStart, win.curEnd);
  const prev = totals(win.prevStart, win.prevEnd);

  const actualWindow = `${monthLabel(win.curStart.slice(0, 7))} - ${monthLabel(latestMonth)}`;
  console.log(`Data window in DB: ${actualWindow} (declared: "${COMPARISON_WINDOW.current}")`);
  console.log(`Prior window:      ${monthLabel(win.prevStart.slice(0, 7))} - ${monthLabel(win.prevEnd.slice(0, 7))}\n`);

  let failures = 0;
  const check = (label: string, claimed: number, actual: number | undefined) => {
    const ok = actual !== undefined && claimed === actual;
    if (!ok) failures++;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${label.padEnd(28)} claimed ${String(claimed).padStart(6)} | actual ${actual ?? "no data"}`
    );
  };

  console.log("== London hotspots (src/data/hotspots.ts) ==");
  for (const h of londonHotspots) check(h.borough, h.thefts, cur[h.borough]);

  console.log("\n== City comparison (src/data/cityComparison.ts) ==");
  for (const c of cityComparison) {
    check(`${c.city} (current)`, c.thefts, cur[c.locationName]);
    check(`${c.city} (previous)`, c.previousThefts, prev[c.locationName]);
  }

  // Informational: overlapping sources for the same location-month double-count
  // in any query that doesn't filter by dataSource.
  const byKey = new Map<string, Set<string>>();
  for (const p of all) {
    const k = `${p.date.slice(0, 7)}|${p.locationName}`;
    if (!byKey.has(k)) byKey.set(k, new Set());
    byKey.get(k)!.add(p.dataSource);
  }
  const overlapping = [...byKey.values()].filter((s) => s.size > 1).length;
  console.log(`\nLocation-months covered by >1 source (double-counted in unfiltered queries): ${overlapping}`);

  if (actualWindow !== COMPARISON_WINDOW.current) {
    console.log(`\nNOTE: declared window "${COMPARISON_WINDOW.current}" != data window "${actualWindow}" — roll COMPARISON_WINDOW forward after verifying.`);
  }

  if (failures > 0) {
    console.error(`\n${failures} figure(s) drifted from the live ${SOURCE} data.`);
    process.exit(1);
  }
  console.log("\nAll published figures match the live data.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
