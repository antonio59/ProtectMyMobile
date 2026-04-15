import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.PUBLIC_CONVEX_URL || "https://giddy-civet-983.convex.cloud";
const adminToken = process.env.CRON_SECRET;

if (!adminToken) {
  console.error("CRON_SECRET is required");
  process.exit(1);
}

const convex = new ConvexHttpClient(convexUrl);

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\|[^|]*$/, "")
    .replace(/-[^-]*(?:news|bbc|sky|guardian|standard|metro|mail|telegraph|mirror|itv)[^-]*$/, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  console.log(`Connecting to ${convexUrl}...`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE DELETE"}`);

  const posts: any[] = await convex.query(api.newsPosts.list, { publishedOnly: false });
  console.log(`Total posts: ${posts.length}`);

  const groups = new Map<string, typeof posts>();
  for (const post of posts) {
    const key = normalizeTitle(post.title);
    if (!key || key.length < 10) continue;
    const group = groups.get(key) || [];
    group.push(post);
    groups.set(key, group);
  }

  let toDelete: any[] = [];

  for (const [key, group] of groups.entries()) {
    if (group.length <= 1) continue;

    // Keep: published first, longest content, then most recent
    group.sort((a, b) => {
      if (a.published !== b.published) return a.published ? -1 : 1;
      if (b.content.length !== a.content.length) return b.content.length - a.content.length;
      return (b.publishedAt || b._creationTime) - (a.publishedAt || a._creationTime);
    });

    const keeper = group[0];
    console.log(`\nDuplicate group (${group.length}): "${keeper.title}"`);
    console.log(`  Keeper: ${keeper._id} (${keeper.sourceName || "no source"})`);

    for (let i = 1; i < group.length; i++) {
      const dup = group[i];
      console.log(`  Delete: ${dup._id} — "${dup.title}" (${dup.sourceName || "no source"})`);
      toDelete.push(dup);
    }
  }

  console.log(`\n${toDelete.length} duplicates found.`);

  if (!dryRun && toDelete.length > 0) {
    console.log("Deleting duplicates...");
    for (const dup of toDelete) {
      await convex.mutation(api.newsPosts.remove, { id: dup._id, adminToken });
      console.log(`  Deleted ${dup._id}`);
    }
    console.log("Done.");
  } else if (dryRun) {
    console.log("Dry run complete. No changes made.");
  } else {
    console.log("No duplicates to delete.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
