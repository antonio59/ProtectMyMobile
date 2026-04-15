import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.activeOnly) {
      return await ctx.db
        .query("mobileProviders")
        .withIndex("by_active", (q) => q.eq("active", true))
        .collect();
    }
    return await ctx.db.query("mobileProviders").collect();
  },
});

export const create = mutation({
  args: {
    adminToken: v.optional(v.string()),
    name: v.string(),
    phone: v.optional(v.string()),
    website: v.string(),
    theftContact: v.optional(v.string()),
    network: v.union(
      v.literal("EE"),
      v.literal("Vodafone"),
      v.literal("O2"),
      v.literal("Three"),
      v.literal("MVNO")
    ),
    isMvno: v.boolean(),
    parentNetwork: v.optional(v.string()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const { adminToken, ...rest } = args;
    return await ctx.db.insert("mobileProviders", rest);
  },
});

export const update = mutation({
  args: {
    adminToken: v.optional(v.string()),
    id: v.id("mobileProviders"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    theftContact: v.optional(v.string()),
    network: v.optional(
      v.union(
        v.literal("EE"),
        v.literal("Vodafone"),
        v.literal("O2"),
        v.literal("Three"),
        v.literal("MVNO")
      )
    ),
    isMvno: v.optional(v.boolean()),
    parentNetwork: v.optional(v.string()),
    active: v.optional(v.boolean()),
    lastVerified: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const { id, adminToken, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: {
    adminToken: v.optional(v.string()),
    id: v.id("mobileProviders"),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    await ctx.db.delete(args.id);
  },
});
