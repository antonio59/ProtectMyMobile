import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { approvedOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.approvedOnly) {
      return await ctx.db
        .query("experienceReports")
        .withIndex("by_approved", (q) => q.eq("approved", true))
        .order("desc")
        .collect();
    }
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
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      approved: args.approved,
      approvedAt: args.approved ? Date.now() : undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("experienceReports") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
