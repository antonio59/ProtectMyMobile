import type { MutationCtx, QueryCtx } from "./_generated/server";

declare const process: {
  env: Record<string, string | undefined>;
};

export function requireAdmin(_ctx: MutationCtx | QueryCtx, token?: string) {
  // SECURITY: Always require admin token - never allow bypass
  const adminToken = process.env.CONVEX_ADMIN_TOKEN || process.env.CRON_SECRET;
  if (!adminToken) {
    throw new Error("Server configuration error: CONVEX_ADMIN_TOKEN or CRON_SECRET must be set");
  }
  if (!token || token !== adminToken) {
    throw new Error("Unauthorized: admin token required");
  }
}
