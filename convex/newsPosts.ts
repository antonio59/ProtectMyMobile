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

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\|[^|]*$/, "")
    .replace(/-[^-]*(?:news|bbc|sky|guardian|standard|metro|mail|telegraph|mirror|itv)[^-]*$/, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const cleanupDuplicates = mutation({
  args: { adminToken: v.optional(v.string()), dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const posts = await ctx.db.query("newsPosts").order("desc").collect();

    const groups = new Map<string, typeof posts>();
    for (const post of posts) {
      const key = normalizeTitle(post.title);
      if (!key || key.length < 10) continue;
      const group = groups.get(key) || [];
      group.push(post);
      groups.set(key, group);
    }

    const toDelete: Array<{ id: string; title: string; reason: string }> = [];

    for (const [key, group] of groups.entries()) {
      if (group.length <= 1) continue;

      // Sort by: published first, then longer content, then more recent
      group.sort((a, b) => {
        if (a.published !== b.published) return a.published ? -1 : 1;
        if (b.content.length !== a.content.length) return b.content.length - a.content.length;
        return (b.publishedAt || b._creationTime) - (a.publishedAt || a._creationTime);
      });

      const keeper = group[0];
      for (let i = 1; i < group.length; i++) {
        const dup = group[i];
        toDelete.push({
          id: dup._id,
          title: dup.title,
          reason: `Duplicate of "${keeper.title}"`,
        });
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
