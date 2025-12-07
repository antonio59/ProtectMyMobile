import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("contactSubmissions")
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactSubmissions", {
      ...args,
      responded: false,
    });
  },
});

export const updateResponse = mutation({
  args: {
    adminToken: v.optional(v.string()),
    id: v.id("contactSubmissions"),
    responseMessage: v.string(),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    await ctx.db.patch(args.id, {
      responded: true,
      responseMessage: args.responseMessage,
      respondedAt: Date.now(),
    });
  },
});
