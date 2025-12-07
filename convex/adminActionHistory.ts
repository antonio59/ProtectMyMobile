import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("adminActionHistory")
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    adminToken: v.optional(v.string()),
    adminId: v.string(),
    adminUsername: v.string(),
    actionType: v.union(
      v.literal("approve_experience"),
      v.literal("unapprove_experience"),
      v.literal("respond_contact"),
      v.literal("mark_spam")
    ),
    targetId: v.string(),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const { adminToken, ...rest } = args;
    return await ctx.db.insert("adminActionHistory", rest);
  },
});
