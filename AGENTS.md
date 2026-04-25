# AGENTS

## Project Snapshot
- Single Astro + React + TypeScript site with Convex backend and Netlify scheduled functions.
- Package manager: npm. Builds deploy to Netlify; Convex functions in `convex/`.
- Subdirectories have their own AGENTS.md (see JIT Index).

## Root Setup Commands
- Install deps: `npm install`
- Typecheck: `npm run check`
- Build: `npm run build`
- Convert OG image (optional): `node scripts/convert-og-image.mjs`

## Universal Conventions
- TypeScript strict via Astro; use `@/` imports per `tsconfig.json`.
- Prefer functional React components; follow existing Tailwind utility styling.
- Commits: keep concise, imperative; include Co-authored-by when appropriate.
- PRs: ensure `npm run check`, `npm run build`, and `npm run design:lint` pass.
- Design system: always check [`DESIGN.md`](./DESIGN.md) before adding new colors, spacing, or components. Prefer semantic tokens (`bg-card`, `text-foreground`) over literal values (`bg-white`, `text-neutral-900`).

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
- `npm run check` and `npm run build` succeed.
- Secrets not exposed; admin/cron tokens handled via env.
- Relevant docs/links updated if routing or env requirements change.
