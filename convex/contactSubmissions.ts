import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: { adminToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
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
    const name = args.name.trim();
    const email = args.email.trim();
    const subject = args.subject.trim();
    const message = args.message.trim();

    if (!name || !email || !subject || !message) {
      throw new Error("All fields are required");
    }
    if (name.length > 200 || email.length > 320 || subject.length > 300 || message.length > 5000) {
      throw new Error("Field length exceeded");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email address");
    }

    return await ctx.db.insert("contactSubmissions", {
      name,
      email,
      subject,
      message,
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
