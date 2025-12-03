import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.activeOnly) {
      return await ctx.db
        .query("banks")
        .withIndex("by_active", (q) => q.eq("active", true))
        .collect();
    }
    return await ctx.db.query("banks").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
    website: v.string(),
    fraudContact: v.optional(v.string()),
    category: v.union(
      v.literal("high_street"),
      v.literal("online"),
      v.literal("building_society"),
      v.literal("challenger")
    ),
    logoUrl: v.optional(v.string()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("banks", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("banks"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    fraudContact: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("high_street"),
        v.literal("online"),
        v.literal("building_society"),
        v.literal("challenger")
      )
    ),
    logoUrl: v.optional(v.string()),
    active: v.optional(v.boolean()),
    lastVerified: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});
