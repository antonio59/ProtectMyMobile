import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Track an analytics event
export const trackEvent = mutation({
  args: {
    eventType: v.union(
      v.literal("security_checkup_started"),
      v.literal("security_checkup_completed"),
      v.literal("emergency_guide_viewed"),
      v.literal("bank_contact_clicked"),
      v.literal("provider_contact_clicked"),
      v.literal("community_survey_completed"),
      v.literal("scenario_viewed"),
      v.literal("news_article_viewed"),
      v.literal("page_404"),
    ),
    metadata: v.optional(v.object({
      score: v.optional(v.number()),
      scoreLevel: v.optional(v.string()),
      bankName: v.optional(v.string()),
      providerName: v.optional(v.string()),
      scenarioId: v.optional(v.string()),
      articleSlug: v.optional(v.string()),
      categoryBreakdown: v.optional(v.string()),
      url: v.optional(v.string()),
    })),
    sessionId: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("analyticsEvents", {
      eventType: args.eventType,
      metadata: args.metadata,
      sessionId: args.sessionId,
      userAgent: args.userAgent,
      referrer: args.referrer,
    });
  },
});

// Get analytics summary for admin dashboard
export const getSummary = query({
  args: {
    days: v.optional(v.number()), // Default to 30 days
    adminToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

    const allEvents = await ctx.db
      .query("analyticsEvents")
      .filter((q) => q.gte(q.field("_creationTime"), cutoff))
      .collect();

    // Count by event type
    const eventCounts: Record<string, number> = {};
    allEvents.forEach(event => {
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
    });

    // Security checkup stats
    const checkupCompleted = allEvents.filter(e => e.eventType === "security_checkup_completed");
    const checkupStarted = allEvents.filter(e => e.eventType === "security_checkup_started");
    const completionRate = checkupStarted.length > 0
      ? Math.round((checkupCompleted.length / checkupStarted.length) * 100)
      : 0;

    // Average security score
    const scores = checkupCompleted
      .map(e => e.metadata?.score)
      .filter((s): s is number => s !== undefined);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Score distribution
    const scoreDistribution = {
      excellent: checkupCompleted.filter(e => e.metadata?.scoreLevel === "Excellent").length,
      good: checkupCompleted.filter(e => e.metadata?.scoreLevel === "Good").length,
      fair: checkupCompleted.filter(e => e.metadata?.scoreLevel === "Fair").length,
      needsImprovement: checkupCompleted.filter(e => e.metadata?.scoreLevel === "Needs Improvement").length,
    };

    // Daily breakdown for last 7 days
    const dailyBreakdown: { date: string; events: number; checkups: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayEvents = allEvents.filter(e =>
        e._creationTime >= dayStart.getTime() && e._creationTime < dayEnd.getTime()
      );
      const dayCheckups = dayEvents.filter(e => e.eventType === "security_checkup_completed");

      dailyBreakdown.push({
        date: dayStart.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
        events: dayEvents.length,
        checkups: dayCheckups.length,
      });
    }

    // Top scenarios viewed
    const scenarioViews = allEvents
      .filter(e => e.eventType === "scenario_viewed" && e.metadata?.scenarioId)
      .reduce((acc, e) => {
        const id = e.metadata?.scenarioId || "unknown";
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Top banks clicked
    const bankClicks = allEvents
      .filter(e => e.eventType === "bank_contact_clicked" && e.metadata?.bankName)
      .reduce((acc, e) => {
        const name = e.metadata?.bankName || "unknown";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalEvents: allEvents.length,
      eventCounts,
      securityCheckup: {
        started: checkupStarted.length,
        completed: checkupCompleted.length,
        completionRate,
        avgScore,
        scoreDistribution,
      },
      dailyBreakdown,
      topScenarios: Object.entries(scenarioViews)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topBanks: Object.entries(bankClicks)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  },
});

// Get recent events for activity feed
export const getRecentEvents = query({
  args: {
    limit: v.optional(v.number()),
    adminToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const events = await ctx.db
      .query("analyticsEvents")
      .order("desc")
      .take(limit);

    return events.map(event => ({
      id: event._id,
      eventType: event.eventType,
      metadata: event.metadata,
      timestamp: event._creationTime,
    }));
  },
});

// Get security checkup analytics detail
export const getCheckupAnalytics = query({
  args: {
    days: v.optional(v.number()),
    adminToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

    const checkupEvents = await ctx.db
      .query("analyticsEvents")
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), cutoff),
          q.or(
            q.eq(q.field("eventType"), "security_checkup_started"),
            q.eq(q.field("eventType"), "security_checkup_completed")
          )
        )
      )
      .collect();

    const completed = checkupEvents.filter(e => e.eventType === "security_checkup_completed");

    // Parse category breakdowns
    const categoryStats: Record<string, { total: number; count: number }> = {
      device: { total: 0, count: 0 },
      sim: { total: 0, count: 0 },
      apps: { total: 0, count: 0 },
      backup: { total: 0, count: 0 },
      awareness: { total: 0, count: 0 },
    };

    completed.forEach(event => {
      if (event.metadata?.categoryBreakdown) {
        try {
          const breakdown = JSON.parse(event.metadata.categoryBreakdown);
          Object.entries(breakdown).forEach(([cat, pct]) => {
            if (categoryStats[cat]) {
              categoryStats[cat].total += pct as number;
              categoryStats[cat].count += 1;
            }
          });
        } catch {
          // Skip invalid JSON
        }
      }
    });

    // Calculate averages
    const categoryAverages = Object.entries(categoryStats).map(([cat, data]) => ({
      category: cat,
      avgScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
    }));

    return {
      totalStarted: checkupEvents.filter(e => e.eventType === "security_checkup_started").length,
      totalCompleted: completed.length,
      categoryAverages,
      recentCompletions: completed.slice(0, 20).map(e => ({
        timestamp: e._creationTime,
        score: e.metadata?.score,
        scoreLevel: e.metadata?.scoreLevel,
      })),
    };
  },
});
