import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireAdmin } from "../auth";

// Shared admin-guarded mutation handlers for the directory-style tables
// (banks, mobileProviders, policeForces, foiRequests, wdtkEntries).

/** Patch a document by `id` with every remaining arg, after the admin check. */
export async function patchById(
  ctx: MutationCtx,
  args: { adminToken?: string; id: string } & Record<string, unknown>
) {
  requireAdmin(ctx, args.adminToken);
  const { id, adminToken, ...updates } = args;
  await ctx.db.patch(id as any, updates);
}

/** Delete a document by `id`, after the admin check. */
export async function removeById(
  ctx: MutationCtx,
  args: { adminToken?: string; id: string }
) {
  requireAdmin(ctx, args.adminToken);
  await ctx.db.delete(args.id as any);
}

/** Insert a document into `table` with every arg except `adminToken`. */
export async function insertRow(
  ctx: MutationCtx,
  table: string,
  args: { adminToken?: string } & Record<string, unknown>
) {
  requireAdmin(ctx, args.adminToken);
  const { adminToken, ...rest } = args;
  return await ctx.db.insert(table as any, rest as any);
}

/** Set the approved flag (and approvedAt timestamp) on a report, after the admin check. */
export async function setApproval(
  ctx: MutationCtx,
  args: { adminToken?: string; id: string; approved: boolean }
) {
  requireAdmin(ctx, args.adminToken);
  await ctx.db.patch(args.id as any, {
    approved: args.approved,
    approvedAt: args.approved ? Date.now() : undefined,
  });
}

/** List rows of a directory table, optionally only active ones via by_active index. */
export async function listRows(ctx: QueryCtx, table: string, activeOnly?: boolean) {
  if (activeOnly) {
    return await ctx.db
      .query(table as any)
      .withIndex("by_active", (q: any) => q.eq("active", true))
      .collect();
  }
  return await ctx.db.query(table as any).collect();
}
