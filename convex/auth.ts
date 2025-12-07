import type { MutationCtx, QueryCtx } from "./_generated/server";

const ADMIN_TOKEN = process.env.CONVEX_ADMIN_TOKEN || process.env.CRON_SECRET;

export function requireAdmin(_ctx: MutationCtx | QueryCtx, token?: string) {
  if (!ADMIN_TOKEN) return; // If not configured, allow for now to avoid hard lockout
  if (token === ADMIN_TOKEN) return;
  throw new Error("Unauthorized: admin token required");
}
