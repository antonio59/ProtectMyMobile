import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    level: v.union(v.literal("info"), v.literal("warning"), v.literal("error")),
    source: v.union(
      v.literal("news_scraper"),
      v.literal("wdtk_scraper"),
      v.literal("system"),
    ),
    message: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("systemLogs", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    level: v.optional(
      v.union(v.literal("info"), v.literal("warning"), v.literal("error")),
    ),
    source: v.optional(
      v.union(
        v.literal("news_scraper"),
        v.literal("wdtk_scraper"),
        v.literal("system"),
      ),
    ),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("systemLogs").order("desc");

    if (args.since) {
      const logs = await query
        .filter((q) => q.gt(q.field("timestamp"), args.since!))
        .collect();
      return args.limit ? logs.slice(0, args.limit) : logs;
    }

    const logs = await query.collect();

    let filtered = logs;
    if (args.level) {
      filtered = filtered.filter((l) => l.level === args.level);
    }
    if (args.source) {
      filtered = filtered.filter((l) => l.source === args.source);
    }

    return args.limit ? filtered.slice(0, args.limit) : filtered;
  },
});

export const getLastNewsFetch = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db
      .query("systemLogs")
      .withIndex("by_source", (q) => q.eq("source", "news_scraper"))
      .filter((q) => q.eq(q.field("level"), "info"))
      .order("desc")
      .first();

    return logs;
  },
});

export const getRecentErrors = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("systemLogs")
      .withIndex("by_level", (q) => q.eq("level", "error"))
      .order("desc")
      .collect();

    return args.limit ? logs.slice(0, args.limit) : logs;
  },
});
