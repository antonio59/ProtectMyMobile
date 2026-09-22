import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let points = await ctx.db
      .query("theftDataPoints")
      .withIndex("by_date")
      .order("asc")
      .collect();

    if (args.source) {
      points = points.filter((p) => p.dataSource === args.source);
    }
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

    // Sources can overlap (e.g. seed estimates vs police.uk actuals for the
    // same location-month), so totalThefts is not a unique-offence count.
    const theftsBySource = all.reduce((acc, p) => {
      acc[p.dataSource] = (acc[p.dataSource] || 0) + p.theftCount;
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
      theftsBySource,
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
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let all = await ctx.db.query("theftDataPoints").collect();

    // Sources overlap (seed estimates vs police.uk actuals for the same
    // location-month) — mixing them double-counts. Callers charting police
    // data must pass source: 'police.uk API'.
    if (args.source) {
      all = all.filter(p => p.dataSource === args.source);
    }

    if (all.length === 0) {
      return { months: [], locations: [], data: [] };
    }

    // Determine year range. Public args are clamped to the data's actual
    // span: a caller-supplied endYear of "9999" would otherwise build ~95k
    // month entries, and non-numeric input would loop forever on NaN.
    const years = [...new Set(all.map(p => p.date.substring(0, 4)))].sort();
    const minY = Number(years[0]);
    const maxY = Number(years[years.length - 1]);
    const clampYear = (raw: string | undefined, fallback: number) => {
      const n = Number(raw);
      return Number.isFinite(n) && /^\d{4}$/.test(raw ?? "")
        ? Math.min(Math.max(n, minY), maxY)
        : fallback;
    };
    const startYear = String(clampYear(args.startYear, minY));
    const endYear = String(clampYear(args.endYear, maxY));

    // Dates are stored as YYYY-MM-DD (always "-01" today); comparing against
    // "YYYY-12" would drop every December record of the end year.
    const filtered = all.filter(
      p => p.date >= `${startYear}-01` && p.date <= `${endYear}-12-31`
    );

    // Get top locations by total theft count
    const locationTotals: Record<string, number> = {};
    for (const p of filtered) {
      locationTotals[p.locationName] = (locationTotals[p.locationName] || 0) + p.theftCount;
    }
    // Cap topN: each location adds a key to every month object.
    const topN = Math.min(Math.max(args.topN || 8, 1), 20);
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
    const monthTotals: Record<string, number> = {};
    for (const month of months) {
      monthData[month] = {};
      monthTotals[month] = 0;
      for (const loc of topLocations) {
        monthData[month][loc] = 0;
      }
    }
    const topSet = new Set(topLocations);
    for (const p of filtered) {
      const month = p.date.substring(0, 7);
      if (monthData[month]) {
        // "total" must cover every monitored location, not just the top-N
        // series shown in the chart, or summary cards undercount.
        monthTotals[month] += p.theftCount;
        if (topSet.has(p.locationName)) {
          monthData[month][p.locationName] += p.theftCount;
        }
      }
    }

    // Flatten for chart consumption
    const data = months.map(month => ({
      month,
      label: new Date(month + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      ...monthData[month],
      total: monthTotals[month],
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
    // Per-location, per-year, per-month totals so YoY can compare the same
    // calendar months — a partial latest year must never be compared against
    // a full prior year.
    const locationByYearMonth: Record<string, Record<string, Record<number, number>>> = {};

    for (const p of filtered) {
      const year = p.date.substring(0, 4);
      const month = Number(p.date.substring(5, 7));
      locationTotals[p.locationName] = (locationTotals[p.locationName] || 0) + p.theftCount;
      if (!locationByYear[p.locationName]) locationByYear[p.locationName] = {};
      locationByYear[p.locationName][year] = (locationByYear[p.locationName][year] || 0) + p.theftCount;
      if (!locationByYearMonth[p.locationName]) locationByYearMonth[p.locationName] = {};
      if (!locationByYearMonth[p.locationName][year]) locationByYearMonth[p.locationName][year] = {};
      locationByYearMonth[p.locationName][year][month] =
        (locationByYearMonth[p.locationName][year][month] || 0) + p.theftCount;
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
        let monthsCompared = 0;
        if (previousYear) {
          const latestMonths = locationByYearMonth[name]?.[latestYear] ?? {};
          const prevMonths = locationByYearMonth[name]?.[previousYear] ?? {};
          const comparedMonths = Object.keys(latestMonths).map(Number);
          const prevSamePeriod = comparedMonths.reduce(
            (sum, m) => sum + (prevMonths[m] || 0), 0,
          );
          monthsCompared = comparedMonths.length;
          if (prevSamePeriod > 0) {
            yoyChange = ((years[latestYear] - prevSamePeriod) / prevSamePeriod) * 100;
          }
        }
        return {
          name,
          total,
          years,
          latestYear,
          yoyChange: yoyChange !== null ? Number(yoyChange.toFixed(1)) : null,
          monthsCompared,
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

    // Average must be per calendar month across the years that contain it:
    // total for that month in each year, then averaged over the year count.
    // Dividing by record count instead produced a per-location average (~1/24
    // of the real monthly total) and broke on uneven coverage.
    const byYearMonth: Record<string, number[]> = {};
    const monthTotals = new Array(12).fill(0);

    for (const p of filtered) {
      const year = p.date.substring(0, 4);
      const monthIndex = Number(p.date.substring(5, 7)) - 1;
      if (!byYearMonth[year]) byYearMonth[year] = new Array(12).fill(0);
      byYearMonth[year][monthIndex] += p.theftCount;
      monthTotals[monthIndex] += p.theftCount;
    }

    const yearsWithMonth = new Array(12).fill(0);
    for (const yearData of Object.values(byYearMonth)) {
      for (let i = 0; i < 12; i++) {
        if (yearData[i] > 0) yearsWithMonth[i]++;
      }
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const averages = monthTotals.map((total, i) =>
      yearsWithMonth[i] > 0 ? Number((total / yearsWithMonth[i]).toFixed(1)) : 0
    );

    return { months, averages, totals: monthTotals, yearsPerMonth: yearsWithMonth };
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

/**
 * Delete every data point from one source (e.g. removing synthetic seed data
 * once real police.uk coverage exists). Refuses the live police.uk source so a
 * typo can't wipe the primary dataset.
 */
export const deleteBySource = mutation({
  args: {
    adminToken: v.optional(v.string()),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    if (args.source === "police.uk API") {
      throw new Error("Refusing to delete the primary police.uk source");
    }
    const matches = await ctx.db
      .query("theftDataPoints")
      .collect()
      .then((all) => all.filter((p) => p.dataSource === args.source));
    for (const p of matches) {
      await ctx.db.delete(p._id);
    }
    return { deleted: matches.length, source: args.source };
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
