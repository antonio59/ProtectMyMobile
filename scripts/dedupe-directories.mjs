// One-off: find and remove duplicate bank/mobile provider entries in Convex.
// Usage: node scripts/dedupe-directories.mjs [--apply]
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { readFileSync } from "node:fs";

for (const file of [".env", ".env.local"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const client = new ConvexHttpClient(process.env.PUBLIC_CONVEX_URL || process.env.CONVEX_URL);
const adminToken = process.env.CRON_SECRET;
const apply = process.argv.includes("--apply");

const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

async function dedupe(table, listApi, removeApi) {
  const rows = await client.query(listApi, { activeOnly: false });
  const groups = new Map();
  for (const row of rows) {
    const key = norm(row.name) || norm(row.website);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  let removed = 0;
  for (const [, dupes] of groups) {
    if (dupes.length < 2) continue;
    // Keep the most recently verified / most complete record
    dupes.sort((a, b) => (b.lastVerified ?? 0) - (a.lastVerified ?? 0));
    const [keep, ...extras] = dupes;
    console.log(`\n[${table}] "${keep.name}" x${dupes.length} — keeping ${keep._id}`);
    for (const extra of extras) {
      console.log(`  ${apply ? "removing" : "would remove"} ${extra._id} (website: ${extra.website})`);
      if (apply) {
        await client.mutation(removeApi, { adminToken, id: extra._id });
        removed++;
      }
    }
  }
  if (removed === 0 && apply) console.log(`\n[${table}] no duplicates removed`);
  return removed;
}

console.log(apply ? "APPLYING dedupe…" : "DRY RUN (pass --apply to delete)");
const banks = await dedupe("banks", api.banks.list, api.banks.remove);
const providers = await dedupe("mobileProviders", api.mobileProviders.list, api.mobileProviders.remove);
console.log(`\nDone. Removed: ${banks + providers}`);
