import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: {
    approvedOnly: v.optional(v.boolean()),
    adminToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.approvedOnly) {
      // Public access - only approved reports
      return await ctx.db
        .query("experienceReports")
        .withIndex("by_approved", (q) => q.eq("approved", true))
        .order("desc")
        .collect();
    }
    // Admin access - requires token to view all reports (including unapproved)
    requireAdmin(ctx, args.adminToken);
    return await ctx.db
      .query("experienceReports")
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    hasExperiencedTheft: v.boolean(),
    when: v.string(),
    where: v.string(),
    whatHappened: v.string(),
    doingDifferently: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Public can submit reports - they start unapproved
    return await ctx.db.insert("experienceReports", {
      ...args,
      approved: false,
    });
  },
});

export const updateApproval = mutation({
  args: {
    id: v.id("experienceReports"),
    approved: v.boolean(),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Admin only - requires token
    requireAdmin(ctx, args.adminToken);
    await ctx.db.patch(args.id, {
      approved: args.approved,
      approvedAt: args.approved ? Date.now() : undefined,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("experienceReports"),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Admin only - requires token
    requireAdmin(ctx, args.adminToken);
    await ctx.db.delete(args.id);
  },
});
