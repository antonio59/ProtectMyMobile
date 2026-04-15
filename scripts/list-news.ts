import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.PUBLIC_CONVEX_URL!;
const convex = new ConvexHttpClient(convexUrl);

async function main() {
  const posts: any[] = await convex.query(api.newsPosts.list, { publishedOnly: false });
  for (const p of posts) {
    console.log(p.title);
    console.log("  " + (p.sourceName || "no source") + " | " + p.slug);
    console.log("  excerpt: " + (p.excerpt?.substring(0, 100) || "NONE"));
    console.log("  content len: " + (p.content?.length || 0));
    console.log();
  }
}

main();
