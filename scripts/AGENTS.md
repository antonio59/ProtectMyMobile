# AGENTS (scripts)

## Package Identity
- Utility scripts (e.g., OG image conversion).

## Setup & Run
- Convert OG PNG: `node scripts/convert-og-image.mjs`
- Verify published stats vs live data: `npx tsx scripts/verify-statistics.ts` (needs `PUBLIC_CONVEX_URL`)
- Remove synthetic seed records: `npx tsx scripts/delete-seed-data.ts` (dry-run; add `--apply`, needs `PUBLIC_CONVEX_URL` + `CONVEX_ADMIN_TOKEN`/`CRON_SECRET`)
- Uses `@resvg/resvg-js`; ensure deps installed (`pnpm install`).

## Patterns & Conventions
- Keep scripts ESM (`type: module`).
- Write outputs to `public/` (e.g., `og-image.png`).

## Touch Points
- `scripts/convert-og-image.mjs`
- `scripts/verify-statistics.ts` — recompute published figures from Convex; exits non-zero on drift
- `scripts/delete-seed-data.ts` — one-off removal of `Met Police 2024`/`Home Office Est.` sources (already run in prod)

## Pre-PR Checks
- If scripts changed: run the script you modified and verify output in `public/`.
