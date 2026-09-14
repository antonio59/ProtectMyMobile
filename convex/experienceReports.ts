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
    if (
      !args.where.trim() || !args.whatHappened.trim() ||
      args.where.length > 300 || args.whatHappened.length > 5000 ||
      (args.doingDifferently && args.doingDifferently.length > 2000) ||
      args.when.length > 100 || args.name.length > 200 || args.email.length > 320
    ) {
      throw new Error("Invalid submission");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email)) {
      throw new Error("Invalid email address");
    }
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
  handler: async (ctx, args) => setApproval(ctx, args),
});

export const remove = mutation({
  args: {
    id: v.id("experienceReports"),
    adminToken: v.string(),
  },
  handler: async (ctx, args) => removeById(ctx, args),
});
