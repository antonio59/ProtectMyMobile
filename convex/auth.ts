import type { MutationCtx, QueryCtx } from "./_generated/server";

const ADMIN_TOKEN = process.env.CONVEX_ADMIN_TOKEN || process.env.CRON_SECRET;

export function requireAdmin(_ctx: MutationCtx | QueryCtx, token?: string) {
  // SECURITY: Always require admin token - never allow bypass
  if (!ADMIN_TOKEN) {
    throw new Error("Server configuration error: CONVEX_ADMIN_TOKEN or CRON_SECRET must be set");
  }
  if (!token || token !== ADMIN_TOKEN) {
    throw new Error("Unauthorized: admin token required");
  }
}
