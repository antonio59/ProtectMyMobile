import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: { publishedOnly: v.optional(v.boolean()), adminToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.publishedOnly) {
      const posts = await ctx.db
        .query("newsPosts")
        .withIndex("by_published")
        .order("desc")
        .collect();
      return posts.filter((p) => p.published);
    }
    return await ctx.db.query("newsPosts").order("desc").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("newsPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const create = mutation({
  args: {
    adminToken: v.optional(v.string()),
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    authorId: v.optional(v.string()),
    authorName: v.string(),
    category: v.union(
      v.literal("arrest"),
      v.literal("seizure"),
      v.literal("law_change"),
      v.literal("statistics"),
      v.literal("prevention_tip"),
      v.literal("other")
    ),
    sourceUrl: v.optional(v.string()),
    sourceName: v.optional(v.string()),
    featuredImageUrl: v.optional(v.string()),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const { adminToken, ...rest } = args;
    const now = Date.now();
    return await ctx.db.insert("newsPosts", {
      ...rest,
      publishedAt: args.published ? now : undefined,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    adminToken: v.optional(v.string()),
    id: v.id("newsPosts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    authorName: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("arrest"),
        v.literal("seizure"),
        v.literal("law_change"),
        v.literal("statistics"),
        v.literal("prevention_tip"),
        v.literal("other")
      )
    ),
    sourceUrl: v.optional(v.string()),
    sourceName: v.optional(v.string()),
    featuredImageUrl: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const { id, adminToken, ...updates } = args;
    const updateData: Record<string, unknown> = { ...updates, updatedAt: Date.now() };
    if (updates.published === true) {
      const existing = await ctx.db.get(id);
      if (existing && !existing.published) {
        updateData.publishedAt = Date.now();
      }
    }
    await ctx.db.patch(id, updateData);
  },
});

export const remove = mutation({
  args: { id: v.id("newsPosts"), adminToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    await ctx.db.delete(args.id);
  },
});

// Token-based similarity — mirrors src/lib/news/dedup.ts. Kept in sync here
// because Convex functions are bundled independently from the Astro app.
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at", "for",
  "with", "as", "is", "are", "was", "were", "be", "been", "by", "from", "that",
  "this", "it", "its", "after", "into", "over", "amid", "near", "my", "your",
  "his", "her", "their", "out", "up", "off", "has", "have", "had",
]);
const SOURCE_SUFFIX = /\s+[-|–—]\s+[^-|–—]{1,40}$/;
const SIMILARITY_THRESHOLD = 0.6;
const CONTAINMENT_THRESHOLD = 0.8;
const MIN_SHARED_TOKENS = 4;

function tokenizeTitle(title: string): Set<string> {
  const tokens = title
    .replace(SOURCE_SUFFIX, "")
    .toLowerCase()
    .replace(/['’]s\b/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  return new Set(tokens);
}

function titlesAreSimilar(a: string, b: string): boolean {
  const tokensA = tokenizeTitle(a);
  const tokensB = tokenizeTitle(b);
  if (tokensA.size === 0 || tokensB.size === 0) return false;

  let shared = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) shared++;
  }
  if (shared < MIN_SHARED_TOKENS) return false;

  const union = tokensA.size + tokensB.size - shared;
  const jaccard = union === 0 ? 0 : shared / union;
  const containment = shared / Math.min(tokensA.size, tokensB.size);

  return jaccard >= SIMILARITY_THRESHOLD || containment >= CONTAINMENT_THRESHOLD;
}

export const cleanupDuplicates = mutation({
  args: { adminToken: v.optional(v.string()), dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const posts = await ctx.db.query("newsPosts").order("desc").collect();

    // Prefer the strongest article as the cluster keeper.
    const ranked = [...posts].sort((a, b) => {
      if (a.published !== b.published) return a.published ? -1 : 1;
      if (b.content.length !== a.content.length) return b.content.length - a.content.length;
      return (b.publishedAt || b._creationTime) - (a.publishedAt || a._creationTime);
    });

    // Cluster by title similarity: each post either joins an existing keeper's
    // cluster or becomes a new keeper.
    const keepers: typeof posts = [];
    const toDelete: Array<{ id: string; title: string; reason: string }> = [];

    for (const post of ranked) {
      const keeper = keepers.find((k) => titlesAreSimilar(k.title, post.title));
      if (keeper) {
        toDelete.push({
          id: post._id,
          title: post.title,
          reason: `Duplicate of "${keeper.title}"`,
        });
      } else {
        keepers.push(post);
      }
    }

    if (!args.dryRun) {
      for (const item of toDelete) {
        await ctx.db.delete(item.id as any);
      }
    }

    return {
      dryRun: args.dryRun ?? true,
      duplicatesFound: toDelete.length,
      deleted: args.dryRun ? 0 : toDelete.length,
      removedArticles: toDelete,
      totalArticles: posts.length,
    };
  },
});
