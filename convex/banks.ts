import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { insertRow, listRows, patchById, removeById } from "./lib/crud";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => listRows(ctx, "banks", args.activeOnly),
});

export const create = mutation({
  args: {
    adminToken: v.optional(v.string()),
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
  handler: async (ctx, args) => insertRow(ctx, "banks", args),
});

export const update = mutation({
  args: {
    adminToken: v.optional(v.string()),
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
  handler: async (ctx, args) => patchById(ctx, args),
});

export const remove = mutation({
  args: {
    adminToken: v.optional(v.string()),
    id: v.id("banks"),
  },
  handler: async (ctx, args) => removeById(ctx, args),
});
