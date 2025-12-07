import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: { 
    status: v.optional(v.string()),
    policeForce: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("foiRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .collect();
    }
    if (args.policeForce) {
      return await ctx.db
        .query("foiRequests")
        .withIndex("by_police_force", (q) => q.eq("policeForce", args.policeForce!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("foiRequests").order("desc").collect();
  },
});

export const getOverdue = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const requests = await ctx.db
      .query("foiRequests")
      .withIndex("by_status", (q) => q.eq("status", "sent"))
      .collect();
    
    return requests.filter(r => r.dueDate < now);
  },
});

export const create = mutation({
  args: {
    adminToken: v.optional(v.string()),
    referenceNumber: v.string(),
    policeForce: v.string(),
    policeForceEmail: v.string(),
    dateRangeStart: v.string(),
    dateRangeEnd: v.string(),
    requestBody: v.string(),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("sent")
    )),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const now = Date.now();
    // UK FOI deadline is 20 working days, roughly 28 calendar days
    const dueDate = now + (28 * 24 * 60 * 60 * 1000);
    
    return await ctx.db.insert("foiRequests", {
      referenceNumber: args.referenceNumber,
      policeForce: args.policeForce,
      policeForceEmail: args.policeForceEmail,
      dateRangeStart: args.dateRangeStart,
      dateRangeEnd: args.dateRangeEnd,
      requestBody: args.requestBody,
      status: args.status || "draft",
      requestDate: now,
      dueDate,
    });
  },
});

export const update = mutation({
  args: {
    adminToken: v.optional(v.string()),
    id: v.id("foiRequests"),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("acknowledged"),
      v.literal("extended"),
      v.literal("received"),
      v.literal("processed"),
      v.literal("rejected"),
      v.literal("overdue")
    )),
    acknowledgedAt: v.optional(v.number()),
    responseReceivedAt: v.optional(v.number()),
    processedAt: v.optional(v.number()),
    responseNotes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    responseFileUrl: v.optional(v.string()),
    responseFileName: v.optional(v.string()),
    recordsImported: v.optional(v.number()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const { id, adminToken, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const markAsSent = mutation({
  args: { id: v.id("foiRequests"), adminToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const now = Date.now();
    const dueDate = now + (28 * 24 * 60 * 60 * 1000);
    await ctx.db.patch(args.id, { 
      status: "sent",
      requestDate: now,
      dueDate,
    });
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("foiRequests").collect();
    const now = Date.now();
    
    return {
      total: all.length,
      draft: all.filter(r => r.status === "draft").length,
      sent: all.filter(r => r.status === "sent").length,
      acknowledged: all.filter(r => r.status === "acknowledged").length,
      received: all.filter(r => r.status === "received").length,
      processed: all.filter(r => r.status === "processed").length,
      rejected: all.filter(r => r.status === "rejected").length,
      overdue: all.filter(r => r.status === "sent" && r.dueDate < now).length,
      totalRecordsImported: all.reduce((sum, r) => sum + (r.recordsImported || 0), 0),
    };
  },
});
