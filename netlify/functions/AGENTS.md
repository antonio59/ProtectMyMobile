# AGENTS (netlify/functions)

## Package Identity
- Netlify scheduled/cron functions invoking Convex/admin routes with API key headers.

## Setup & Run
- Built with Astro build; no separate dev server.
- To dry-run locally, use Netlify CLI (not configured here) or call underlying API routes.

## Patterns & Conventions
- Each `.mts` sends `x-api-key`/`adminToken` (use `CRON_SECRET`) to internal API routes.
- Keep requests lean; handle errors with try/catch and log succinctly.
- ✅ DO: Update headers if secrets/paths change.
- ❌ DON’T: Check in secrets or change schedules without coordinating Netlify config.

## Touch Points / Key Files
- `fetch-news.mts`, `monitor-wdtk.mts`, `send-foi-requests.mts`, `verify-directory.mts`

## JIT Index Hints
- Find headers: `rg -n "x-api-key" netlify/functions`

## Pre-PR Checks
- `npm run build` (ensures functions bundle).
