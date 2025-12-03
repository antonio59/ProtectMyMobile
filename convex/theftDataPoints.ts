import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let points = await ctx.db
      .query("theftDataPoints")
      .withIndex("by_date")
      .order("asc")
      .collect();

    if (args.startDate) {
      points = points.filter((p) => p.date >= args.startDate!);
    }
    if (args.endDate) {
      points = points.filter((p) => p.date <= args.endDate!);
    }
    return points;
  },
});

export const createBatch = mutation({
  args: {
    dataPoints: v.array(
      v.object({
        date: v.string(),
        locationName: v.string(),
        latitude: v.number(),
        longitude: v.number(),
        theftCount: v.number(),
        dataSource: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const point of args.dataPoints) {
      const id = await ctx.db.insert("theftDataPoints", point);
      ids.push(id);
    }
    return ids;
  },
});

export const upsert = mutation({
  args: {
    date: v.string(),
    locationName: v.string(),
    dataSource: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    theftCount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("theftDataPoints")
      .withIndex("by_date_location_source", (q) =>
        q
          .eq("date", args.date)
          .eq("locationName", args.locationName)
          .eq("dataSource", args.dataSource)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        latitude: args.latitude,
        longitude: args.longitude,
        theftCount: args.theftCount,
      });
      return existing._id;
    }
    return await ctx.db.insert("theftDataPoints", args);
  },
});

export const create = mutation({
  args: {
    date: v.string(),
    locationName: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    theftCount: v.number(),
    dataSource: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("theftDataPoints", args);
  },
});

export const getStats = query({
  args: { year: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let all = await ctx.db.query("theftDataPoints").collect();
    
    // Filter by year if specified
    if (args.year) {
      all = all.filter(p => p.date.startsWith(args.year!));
    }
    
    const bySource = all.reduce((acc, p) => {
      acc[p.dataSource] = (acc[p.dataSource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byLocation = all.reduce((acc, p) => {
      acc[p.locationName] = (acc[p.locationName] || 0) + p.theftCount;
      return acc;
    }, {} as Record<string, number>);

    const dates = all.map(p => p.date).sort();
    
    return {
      totalRecords: all.length,
      totalThefts: all.reduce((sum, p) => sum + p.theftCount, 0),
      bySource,
      topLocations: Object.entries(byLocation)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      dateRange: {
        earliest: dates[0] || null,
        latest: dates[dates.length - 1] || null,
      },
      uniqueLocations: new Set(all.map(p => p.locationName)).size,
    };
  },
});

export const getAvailableYears = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("theftDataPoints").collect();
    const years = new Set(all.map(p => p.date.substring(0, 4)));
    return Array.from(years).sort().reverse();
  },
});

export const listByYear = query({
  args: { year: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("theftDataPoints").collect();
    return all.filter(p => p.date.startsWith(args.year));
  },
});
