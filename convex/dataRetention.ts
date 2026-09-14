import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

const DAY_MS = 24 * 60 * 60 * 1000;

// Retention periods matching the commitments in /privacy. Keep these in sync
// with the policy text.
const RETENTION = {
  contactSubmissions: 365 * DAY_MS,
  communityResponses: 730 * DAY_MS,
  unpublishedExperienceReports: 90 * DAY_MS,
  theftReports: 730 * DAY_MS,
  analyticsEvents: 365 * DAY_MS,
  pageViews: 365 * DAY_MS,
} as const;

/**
 * Deletes personal data that has outlived its retention period, per the
 * privacy policy. Called monthly by /api/cron/purge-data (admin-token gated).
 */
export const purgeExpired = mutation({
  args: { adminToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const now = Date.now();
    const deleted: Record<string, number> = {};

    const purgeTable = async (
      table: "contactSubmissions" | "communityResponses" | "theftReports" | "analyticsEvents" | "pageViews" | "experienceReports",
      maxAge: number,
      extra?: (doc: any) => boolean,
    ) => {
      const cutoff = now - maxAge;
      const docs = await ctx.db.query(table).collect();
      let count = 0;
      for (const doc of docs) {
        if (doc._creationTime < cutoff && (!extra || extra(doc))) {
          await ctx.db.delete(doc._id);
          count++;
        }
      }
      deleted[table] = count;
    };

    await purgeTable("contactSubmissions", RETENTION.contactSubmissions);
    await purgeTable("communityResponses", RETENTION.communityResponses);
    await purgeTable("theftReports", RETENTION.theftReports);
    await purgeTable("analyticsEvents", RETENTION.analyticsEvents);
    await purgeTable("pageViews", RETENTION.pageViews);
    await purgeTable("experienceReports", RETENTION.unpublishedExperienceReports, (doc) => !doc.approved);

    return { deleted, purgedAt: new Date(now).toISOString() };
  },
});
