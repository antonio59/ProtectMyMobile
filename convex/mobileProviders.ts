import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { insertRow, listRows, patchById, removeById } from "./lib/crud";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => listRows(ctx, "mobileProviders", args.activeOnly),
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
  handler: async (ctx, args) => insertRow(ctx, "mobileProviders", args),
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
  handler: async (ctx, args) => patchById(ctx, args),
});

export const remove = mutation({
  args: {
    adminToken: v.optional(v.string()),
    id: v.id("mobileProviders"),
  },
  handler: async (ctx, args) => removeById(ctx, args),
});
