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

function normalizeDirectoryName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(limited|ltd|plc|llp|mobile|bank|building|society|uk)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function websiteHost(url: unknown): string | null {
  if (typeof url !== "string") return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Idempotent insert for directory tables: if a row already exists with the
 * same normalized name or the same website host, patch it with the incoming
 * fields instead of inserting a duplicate. Runs inside the mutation so the
 * check-and-insert is transactional (no race between concurrent cron runs).
 * Returns { id, created }.
 */
export async function insertDirectoryRowIfAbsent(
  ctx: MutationCtx,
  table: string,
  args: { adminToken?: string } & Record<string, unknown>
) {
  requireAdmin(ctx, args.adminToken);
  const { adminToken, ...rest } = args;
  const rows: any[] = await ctx.db.query(table as any).collect();
  const nameKey = normalizeDirectoryName(String(rest.name ?? ""));
  const host = websiteHost(rest.website);
  const existing = rows.find((row) => {
    const rowName = normalizeDirectoryName(String(row.name ?? ""));
    if (nameKey && rowName === nameKey) return true;
    const rowHost = websiteHost(row.website);
    return host && rowHost === host;
  });
  if (existing) {
    // Fill in missing optional fields on the existing row, but never
    // overwrite populated ones (e.g. a manually curated phone number).
    const fill: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined && (existing as any)[k] === undefined) fill[k] = v;
    }
    if (Object.keys(fill).length > 0) await ctx.db.patch(existing._id, fill);
    return { id: existing._id, created: false };
  }
  const id = await ctx.db.insert(table as any, rest as any);
  return { id, created: true };
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
