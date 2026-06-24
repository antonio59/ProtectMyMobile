import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

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
    adminToken: v.optional(v.string()),
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
    requireAdmin(ctx, args.adminToken);
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
    adminToken: v.optional(v.string()),
    date: v.string(),
    locationName: v.string(),
    dataSource: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    theftCount: v.number(),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
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
    adminToken: v.optional(v.string()),
    date: v.string(),
    locationName: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    theftCount: v.number(),
    dataSource: v.string(),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const { adminToken, ...rest } = args;
    return await ctx.db.insert("theftDataPoints", rest);
  },
});

export const getStats = query({
  args: { year: v.optional(v.string()), adminToken: v.optional(v.string()) },
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

/**
 * Get monthly theft trends for charting.
 * Returns data grouped by month with per-location breakdowns for top N locations.
 */
export const getMonthlyTrends = query({
  args: {
    topN: v.optional(v.number()),
    startYear: v.optional(v.string()),
    endYear: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("theftDataPoints").collect();

    if (all.length === 0) {
      return { months: [], locations: [], data: [] };
    }

    // Determine year range
    const years = [...new Set(all.map(p => p.date.substring(0, 4)))].sort();
    const startYear = args.startYear || years[0];
    const endYear = args.endYear || years[years.length - 1];

    const filtered = all.filter(
      p => p.date >= `${startYear}-01` && p.date <= `${endYear}-12`
    );

    // Get top locations by total theft count
    const locationTotals: Record<string, number> = {};
    for (const p of filtered) {
      locationTotals[p.locationName] = (locationTotals[p.locationName] || 0) + p.theftCount;
    }
    const topN = args.topN || 8;
    const topLocations = Object.entries(locationTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([name]) => name);

    // Build month keys in range (startYear/endYear are 4-digit years like "2024")
    const months: string[] = [];
    let y = Number(startYear);
    let m = 1;
    const endY = Number(endYear);
    const endM = 12;
    while (y < endY || (y === endY && m <= endM)) {
      months.push(`${y}-${String(m).padStart(2, "0")}`);
      m++;
      if (m > 12) { m = 1; y++; }
    }

    // Aggregate: { month: { location: count } }
    const monthData: Record<string, Record<string, number>> = {};
    for (const month of months) {
      monthData[month] = {};
      for (const loc of topLocations) {
        monthData[month][loc] = 0;
      }
    }
    for (const p of filtered) {
      const month = p.date.substring(0, 7);
      if (monthData[month] && topLocations.includes(p.locationName)) {
        monthData[month][p.locationName] = (monthData[month][p.locationName] || 0) + p.theftCount;
      }
    }

    // Flatten for chart consumption
    const data = months.map(month => ({
      month,
      label: new Date(month + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      ...monthData[month],
      total: Object.values(monthData[month]).reduce((s, v) => s + v, 0),
    }));

    return { months, locations: topLocations, data };
  },
});

/**
 * Get top locations ranked by theft count with optional year-over-year growth.
 */
export const getLocationRankings = query({
  args: {
    topN: v.optional(v.number()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("theftDataPoints").collect();
    const filtered = args.source ? all.filter(p => p.dataSource === args.source) : all;

    const locationTotals: Record<string, number> = {};
    const locationByYear: Record<string, Record<string, number>> = {};

    for (const p of filtered) {
      const year = p.date.substring(0, 4);
      locationTotals[p.locationName] = (locationTotals[p.locationName] || 0) + p.theftCount;
      if (!locationByYear[p.locationName]) locationByYear[p.locationName] = {};
      locationByYear[p.locationName][year] = (locationByYear[p.locationName][year] || 0) + p.theftCount;
    }

    const topN = args.topN || 10;
    const rankings = Object.entries(locationTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([name, total]) => {
        const years = locationByYear[name];
        const sortedYears = Object.keys(years).sort();
        const latestYear = sortedYears[sortedYears.length - 1];
        const previousYear = sortedYears[sortedYears.length - 2];
        let yoyChange: number | null = null;
        if (previousYear && years[previousYear] > 0) {
          yoyChange = ((years[latestYear] - years[previousYear]) / years[previousYear]) * 100;
        }
        return {
          name,
          total,
          years,
          latestYear,
          yoyChange: yoyChange !== null ? Number(yoyChange.toFixed(1)) : null,
        };
      });

    return rankings;
  },
});

/**
 * Get year-over-year comparison data grouped by calendar month.
 */
export const getYearOverYearComparison = query({
  args: {
    locationName: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("theftDataPoints").collect();
    let filtered = args.source ? all.filter(p => p.dataSource === args.source) : all;
    if (args.locationName) {
      filtered = filtered.filter(p => p.locationName === args.locationName);
    }

    const years = [...new Set(filtered.map(p => p.date.substring(0, 4)))].sort();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const data: Record<string, number[]> = {};
    for (const year of years) {
      data[year] = new Array(12).fill(0);
    }

    for (const p of filtered) {
      const year = p.date.substring(0, 4);
      const monthIndex = Number(p.date.substring(5, 7)) - 1;
      if (data[year]) {
        data[year][monthIndex] += p.theftCount;
      }
    }

    return { years, months, data };
  },
});

/**
 * Get seasonal patterns: average thefts per month across all years.
 */
export const getSeasonalPatterns = query({
  args: {
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("theftDataPoints").collect();
    const filtered = args.source ? all.filter(p => p.dataSource === args.source) : all;

    const monthTotals = new Array(12).fill(0);
    const monthCounts = new Array(12).fill(0);

    for (const p of filtered) {
      const monthIndex = Number(p.date.substring(5, 7)) - 1;
      monthTotals[monthIndex] += p.theftCount;
      monthCounts[monthIndex] += 1;
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const averages = monthTotals.map((total, i) =>
      monthCounts[i] > 0 ? Number((total / monthCounts[i]).toFixed(1)) : 0
    );

    return { months, averages, totals: monthTotals };
  },
});

/**
 * Get data source breakdown for doughnut/pie charts.
 */
export const getSourceBreakdown = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("theftDataPoints").collect();
    const bySource: Record<string, { records: number; thefts: number }> = {};
    for (const p of all) {
      if (!bySource[p.dataSource]) {
        bySource[p.dataSource] = { records: 0, thefts: 0 };
      }
      bySource[p.dataSource].records += 1;
      bySource[p.dataSource].thefts += p.theftCount;
    }
    return Object.entries(bySource).map(([name, stats]) => ({ name, ...stats }));
  },
});

export const ping = mutation({
  args: {},
  handler: async () => {
    return "pong";
  },
});

export const adminPing = mutation({
  args: { adminToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    return "pong";
  },
});
