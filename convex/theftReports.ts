import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";
import { removeById, setApproval } from "./lib/crud";

export const list = query({
  args: {
    approvedOnly: v.optional(v.boolean()),
    adminToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.approvedOnly) {
      return await ctx.db
        .query("theftReports")
        .withIndex("by_approved", (q) => q.eq("approved", true))
        .order("desc")
        .collect();
    }
    // Admin access - requires token to view all reports (including unapproved)
    requireAdmin(ctx, args.adminToken);
    return await ctx.db
      .query("theftReports")
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    locationName: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    theftDate: v.optional(v.string()),
    description: v.optional(v.string()),
    itemType: v.optional(v.string()),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("theftReports", {
      ...args,
      approved: false,
      createdAt: Date.now(),
    });
  },
});

export const updateApproval = mutation({
  args: {
    id: v.id("theftReports"),
    approved: v.boolean(),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => setApproval(ctx, args),
});

export const deleteReport = mutation({
  args: {
    id: v.id("theftReports"),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => removeById(ctx, args),
});
