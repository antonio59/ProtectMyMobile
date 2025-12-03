import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { publishedOnly: v.optional(v.boolean()) },
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
    const now = Date.now();
    return await ctx.db.insert("newsPosts", {
      ...args,
      publishedAt: args.published ? now : undefined,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
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
    const { id, ...updates } = args;
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
  args: { id: v.id("newsPosts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
