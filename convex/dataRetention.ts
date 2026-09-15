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
 * privacy policy. Called daily by /api/cron/purge-data (admin-token gated);
 * daily cadence keeps actual deletion within ~24h of each deadline.
 *
 * Bounded per run: oldest documents are scanned first (default order is
 * _creationTime) and deletions stop at DELETE_CAP, so one mutation can never
 * exceed Convex transaction limits. Any backlog drains on subsequent runs.
 */
const SCAN_LIMIT = 5000;
const DELETE_CAP = 2000;

export const purgeExpired = mutation({
  args: { adminToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const now = Date.now();
    const deleted: Record<string, number> = {};
    const truncated: string[] = [];

    const purgeTable = async (
      table: "contactSubmissions" | "communityResponses" | "theftReports" | "analyticsEvents" | "pageViews" | "experienceReports",
      maxAge: number,
      extra?: (doc: any) => boolean,
    ) => {
      const cutoff = now - maxAge;
      // Oldest first: anything past the cutoff sits at the head of the scan.
      const docs = await ctx.db.query(table).order("asc").take(SCAN_LIMIT);
      let count = 0;
      for (const doc of docs) {
        if (count >= DELETE_CAP) {
          truncated.push(table);
          break;
        }
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

    return {
      deleted,
      truncated,
      purgedAt: new Date(now).toISOString(),
    };
  },
});
