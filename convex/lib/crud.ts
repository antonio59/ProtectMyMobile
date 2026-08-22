import type { MutationCtx } from "../_generated/server";
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
