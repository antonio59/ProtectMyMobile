# AGENTS (convex)

## Package Identity
- Convex functions for admin/data mutations and queries; secured via admin tokens (`convex/auth.ts`).

## Setup & Run
- Dev (if needed): `bunx convex dev`
- Deploy: `bunx convex deploy` (or with `--prod`)
- Build (part of Astro build): `bun run build`

## Patterns & Conventions
- Mutations/queries per domain file (e.g., `banks.ts`, `mobileProviders.ts`, `newsPosts.ts`).
- Admin protection: call `requireAdmin` from `convex/auth.ts` at the top of admin mutations.
- Args: prefer validated args; keep types in-line with Convex schema.
- Logging: avoid secrets; minimal console logging.
- ✅ DO: Pass `adminToken` from API/cron when invoking admin mutations.
- ❌ DON’T: Use browser `ConvexHttpClient` in server/cron contexts.

## Touch Points / Key Files
- Admin guard: `convex/auth.ts`
- Domain mutations: `convex/banks.ts`, `convex/mobileProviders.ts`, `convex/newsPosts.ts`, etc.
- Action history: `convex/adminActionHistory.ts`

## JIT Index Hints
- Find admin-protected calls: `rg -n "requireAdmin" convex`
- Find specific domain mutation: `rg -n "mutation\(" convex/<file>.ts`

## Pre-PR Checks
- Ensure admin-protected mutations still import `requireAdmin`; run `bun run build`.
