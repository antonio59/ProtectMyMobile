import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const create = mutation({
  args: {
    adminToken: v.optional(v.string()),
    timestamp: v.number(),
    source: v.string(),
    status: v.union(
      v.literal("started"),
      v.literal("success"),
      v.literal("partial"),
      v.literal("failed")
    ),
    recordsProcessed: v.optional(v.number()),
    recordsCreated: v.optional(v.number()),
    recordsSkipped: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    details: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const { adminToken, ...rest } = args;
    return await ctx.db.insert("importLogs", rest);
  },
});

export const update = mutation({
  args: {
    adminToken: v.optional(v.string()),
    id: v.id("importLogs"),
    status: v.union(
      v.literal("started"),
      v.literal("success"),
      v.literal("partial"),
      v.literal("failed")
    ),
    recordsProcessed: v.optional(v.number()),
    recordsCreated: v.optional(v.number()),
    recordsSkipped: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    details: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const { adminToken, id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    source: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("started"),
        v.literal("success"),
        v.literal("partial"),
        v.literal("failed")
      )
    ),
  },
  handler: async (ctx, args) => {
    let logs;

    // Apply filters if provided
    if (args.source) {
      logs = await ctx.db
        .query("importLogs")
        .withIndex("by_source", (q) => q.eq("source", args.source!))
        .order("desc")
        .collect();
    } else if (args.status) {
      logs = await ctx.db
        .query("importLogs")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      logs = await ctx.db
        .query("importLogs")
        .withIndex("by_timestamp")
        .order("desc")
        .collect();
    }

    // Apply additional filter if both source and status are provided
    if (args.source && args.status) {
      logs = logs.filter((log) => log.status === args.status);
    }

    // Apply limit
    if (args.limit) {
      logs = logs.slice(0, args.limit);
    }

    return logs;
  },
});

export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("importLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allLogs = await ctx.db.query("importLogs").collect();

    if (allLogs.length === 0) {
      return {
        totalImports: 0,
        successRate: 0,
        lastImportBySource: {},
        statusBreakdown: {
          started: 0,
          success: 0,
          partial: 0,
          failed: 0,
        },
        recordStats: {
          totalProcessed: 0,
          totalCreated: 0,
          totalSkipped: 0,
        },
        averageDuration: 0,
      };
    }

    // Calculate status breakdown
    const statusBreakdown = allLogs.reduce(
      (acc, log) => {
        acc[log.status] = (acc[log.status] || 0) + 1;
        return acc;
      },
      { started: 0, success: 0, partial: 0, failed: 0 } as Record<string, number>
    );

    // Calculate success rate (excluding "started" status)
    const completedLogs = allLogs.filter((log) => log.status !== "started");
    const successfulLogs = completedLogs.filter(
      (log) => log.status === "success" || log.status === "partial"
    );
    const successRate =
      completedLogs.length > 0
        ? (successfulLogs.length / completedLogs.length) * 100
        : 0;

    // Get last import time by source
    const lastImportBySource: Record<string, number> = {};
    const sourceGroups = allLogs.reduce((acc, log) => {
      if (!acc[log.source]) {
        acc[log.source] = [];
      }
      acc[log.source].push(log);
      return acc;
    }, {} as Record<string, typeof allLogs>);

    for (const [source, logs] of Object.entries(sourceGroups)) {
      const sortedLogs = logs.sort((a, b) => b.timestamp - a.timestamp);
      lastImportBySource[source] = sortedLogs[0].timestamp;
    }

    // Calculate record stats
    const recordStats = allLogs.reduce(
      (acc, log) => {
        acc.totalProcessed += log.recordsProcessed || 0;
        acc.totalCreated += log.recordsCreated || 0;
        acc.totalSkipped += log.recordsSkipped || 0;
        return acc;
      },
      { totalProcessed: 0, totalCreated: 0, totalSkipped: 0 }
    );

    // Calculate average duration (for completed imports)
    const logsWithDuration = allLogs.filter(
      (log) => log.duration !== undefined && log.duration !== null
    );
    const averageDuration =
      logsWithDuration.length > 0
        ? logsWithDuration.reduce((sum, log) => sum + (log.duration || 0), 0) /
          logsWithDuration.length
        : 0;

    return {
      totalImports: allLogs.length,
      successRate: Math.round(successRate * 100) / 100,
      lastImportBySource,
      statusBreakdown,
      recordStats,
      averageDuration: Math.round(averageDuration),
    };
  },
});

export const getBySource = query({
  args: {
    source: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("importLogs")
      .withIndex("by_source", (q) => q.eq("source", args.source))
      .order("desc")
      .take(limit);
  },
});

export const getById = query({
  args: {
    id: v.id("importLogs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
