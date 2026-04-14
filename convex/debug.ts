import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const testAdmin = mutation({
  args: { token: v.optional(v.string()) },
  handler: async (_ctx, args) => {
    try {
      const adminToken = process.env.CONVEX_ADMIN_TOKEN || process.env.CRON_SECRET;
      if (!adminToken) {
        return { error: "No admin token configured", hasCron: !!process.env.CRON_SECRET, hasAdmin: !!process.env.CONVEX_ADMIN_TOKEN };
      }
      if (!args.token || args.token !== adminToken) {
        return { error: "Token mismatch", provided: !!args.token, matches: args.token === adminToken, expectedLength: adminToken.length };
      }
      return { success: true };
    } catch (e: any) {
      return { error: e.message, stack: e.stack };
    }
  },
});
