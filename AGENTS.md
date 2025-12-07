# AGENTS

## Project Snapshot
- Single Astro + React + TypeScript site with Convex backend and Netlify scheduled functions.
- Package manager: Bun. Builds deploy to Netlify; Convex functions in `convex/`.
- Subdirectories have their own AGENTS.md (see JIT Index).

## Root Setup Commands
- Install deps: `bun install`
- Typecheck: `bun run check`
- Build: `bun run build`
- Convert OG image (optional): `node scripts/convert-og-image.mjs`

## Universal Conventions
- TypeScript strict via Astro; use `@/` imports per `tsconfig.json`.
- Prefer functional React components; follow existing Tailwind utility styling.
- Commits: keep concise, imperative; include Co-authored-by when appropriate.
- PRs: ensure `bun run check` and `bun run build` pass.

## Security & Secrets
- Never commit secrets. Use `.env` / Netlify env vars / Convex env. Do not log secrets.
- Cron/admin routes expect `CRON_SECRET`/admin tokens; keep them out of code and commits.

## JIT Index (what to open, not what to paste)
### Areas
- UI & pages: `src/` → [see `src/AGENTS.md`](src/AGENTS.md)
- Convex backend: `convex/` → [see `convex/AGENTS.md`](convex/AGENTS.md)
- Netlify schedulers: `netlify/functions/` → [see `netlify/functions/AGENTS.md`](netlify/functions/AGENTS.md)
- Utility scripts: `scripts/` → [see `scripts/AGENTS.md`](scripts/AGENTS.md)
- Assets (scenarios/OG/logo): `public/` (no code; referenced from `src`)

### Quick Find Commands
- Find a component: `rg -n "export function .*" src/components`
- Find an Astro page/route: `ls src/pages` or `rg -n "canonicalPath" src/pages`
- Find API routes: `rg -n "export async function" src/pages/api`
- Find Convex functions: `rg -n "mutation|query" convex`
- Find Netlify scheduled functions: `ls netlify/functions`

## Definition of Done
- `bun run check` and `bun run build` succeed.
- Secrets not exposed; admin/cron tokens handled via env.
- Relevant docs/links updated if routing or env requirements change.
