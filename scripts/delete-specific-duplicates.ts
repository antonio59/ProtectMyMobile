import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.PUBLIC_CONVEX_URL!;
const adminToken = process.env.CRON_SECRET!;
const convex = new ConvexHttpClient(convexUrl);

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const posts: any[] = await convex.query(api.newsPosts.list, { publishedOnly: false });

  const keeperId = "k17bv3fsz87veww78rajjksrrn84wmbg";
  const keeper = posts.find((p) => p._id === keeperId);
  if (!keeper) {
    console.log("Keeper not found. Aborting.");
    return;
  }

  const toDelete: any[] = [];

  for (const p of posts) {
    if (p._id === keeperId) continue;
    const t = p.title.toLowerCase();

    const isRaidDuplicate =
      (t.includes("stolen phones") && t.includes("raid")) ||
      (t.includes("suspected stolen phones") && t.includes("found")) ||
      (t.includes("stolen mobiles trade") && t.includes("london store")) ||
      (t.includes("police raid london store") && t.includes("stolen")) ||
      t.includes("kilburn shop raid") ||
      (t.includes("phones seized") && t.includes("raid") && t.includes("london shop"));

    if (isRaidDuplicate) {
      toDelete.push(p);
    }
  }

  console.log(`Keeper: "${keeper.title}" (${keeper._id}) — ${keeper.content.length} chars`);
  console.log(`Found ${toDelete.length} duplicates to delete.\n`);

  for (const dup of toDelete) {
    console.log(`  ${dryRun ? "[DRY] Would delete" : "Deleting"}: "${dup.title}" (${dup._id}) — ${dup.content.length} chars`);
    if (!dryRun) {
      await convex.mutation(api.newsPosts.remove, { id: dup._id, adminToken });
    }
  }
}

main().catch(console.error);
