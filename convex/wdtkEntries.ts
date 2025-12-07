import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: {
    status: v.optional(v.string()),
    hasData: v.optional(v.boolean()),
    imported: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.hasData !== undefined) {
      return await ctx.db
        .query("wdtkEntries")
        .withIndex("by_has_data", (q) => q.eq("hasData", args.hasData!))
        .order("desc")
        .collect();
    }
    if (args.imported !== undefined) {
      return await ctx.db
        .query("wdtkEntries")
        .withIndex("by_imported", (q) => q.eq("dataImported", args.imported!))
        .order("desc")
        .collect();
    }
    if (args.status) {
      return await ctx.db
        .query("wdtkEntries")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("wdtkEntries").order("desc").collect();
  },
});

export const getByWdtkId = query({
  args: { wdtkId: v.string() },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("wdtkEntries")
      .withIndex("by_wdtk_id", (q) => q.eq("wdtkId", args.wdtkId))
      .collect();
    return entries[0] || null;
  },
});

export const create = mutation({
  args: {
    adminToken: v.optional(v.string()),
    wdtkId: v.string(),
    title: v.string(),
    url: v.string(),
    publishedAt: v.number(),
    policeForce: v.optional(v.string()),
    status: v.union(
      v.literal("successful"),
      v.literal("partial"),
      v.literal("refused"),
      v.literal("awaiting"),
      v.literal("classification"),
      v.literal("unknown")
    ),
    hasData: v.boolean(),
    dataImported: v.boolean(),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    // Check if already exists
    const { adminToken, ...rest } = args;
    const existing = await ctx.db
      .query("wdtkEntries")
      .withIndex("by_wdtk_id", (q) => q.eq("wdtkId", rest.wdtkId))
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    return await ctx.db.insert("wdtkEntries", rest);
  },
});

export const update = mutation({
  args: {
    adminToken: v.optional(v.string()),
    id: v.id("wdtkEntries"),
    status: v.optional(v.union(
      v.literal("successful"),
      v.literal("partial"),
      v.literal("refused"),
      v.literal("awaiting"),
      v.literal("classification"),
      v.literal("unknown")
    )),
    hasData: v.optional(v.boolean()),
    dataImported: v.optional(v.boolean()),
    importedAt: v.optional(v.number()),
    recordsImported: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const { id, adminToken, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const markAsImported = mutation({
  args: {
    adminToken: v.optional(v.string()),
    id: v.id("wdtkEntries"),
    recordsImported: v.number(),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    await ctx.db.patch(args.id, {
      dataImported: true,
      importedAt: Date.now(),
      recordsImported: args.recordsImported,
    });
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("wdtkEntries").collect();
    
    return {
      total: all.length,
      successful: all.filter(e => e.status === "successful").length,
      partial: all.filter(e => e.status === "partial").length,
      refused: all.filter(e => e.status === "refused").length,
      awaiting: all.filter(e => e.status === "awaiting").length,
      withData: all.filter(e => e.hasData).length,
      imported: all.filter(e => e.dataImported).length,
      pendingImport: all.filter(e => e.hasData && !e.dataImported).length,
      totalRecordsImported: all.reduce((sum, e) => sum + (e.recordsImported || 0), 0),
    };
  },
});
