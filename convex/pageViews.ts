import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const record = mutation({
  args: {
    path: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ipHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pageViews", args);
  },
});

export const getStats = query({
  args: { daysBack: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const daysBack = args.daysBack || 30;
    const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;

    const allViews = await ctx.db.query("pageViews").collect();
    const recentViews = allViews.filter((v) => v._creationTime > cutoff);

    const pathCounts: Record<string, number> = {};
    const uniqueVisitors = new Set<string>();

    for (const view of recentViews) {
      pathCounts[view.path] = (pathCounts[view.path] || 0) + 1;
      if (view.ipHash) {
        uniqueVisitors.add(view.ipHash);
      }
    }

    const topPages = Object.entries(pathCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }));

    const recentViewsList = recentViews
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 20)
      .map((v) => ({ path: v.path, createdAt: v._creationTime }));

    return {
      totalViews: recentViews.length,
      uniqueVisitors: uniqueVisitors.size,
      topPages,
      recentViews: recentViewsList,
    };
  },
});
