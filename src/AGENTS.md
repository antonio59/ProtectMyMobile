# AGENTS (src)

## Package Identity
- Astro + React UI for the marketing/security site. Tailwind utility classes. Uses `@/` alias.

## Setup & Run
- Dev: `npm run dev`
- Typecheck: `npm run check`
- Build: `npm run build`
- No dedicated test script.

## Patterns & Conventions
- Pages: `src/pages/*.astro` (routes). API routes under `src/pages/api/**` (server functions).
- Components: `src/components/**` (React). Prefer functional components with Tailwind classes.
- Layout: `src/layouts/Layout.astro` wraps pages; pass `title`, `description`, `canonicalPath`, `schema`.
- Hooks: `src/hooks/**` for client utilities.
- Security helpers: `src/lib/security.ts` (API key/rate limit/IP helpers); reuse instead of re-implementing.
- Icons: prefer `lucide-react` imports; remove unused icons.
- Assets: reference public files via absolute `/` paths (e.g., `/Scenarios/...`).
- ✅ DO: Follow SEO meta/canonical/schema pattern in `src/pages/index.astro`, `src/pages/news.astro`.
- ✅ DO: Use native snap carousel pattern in `src/components/ScenarioCarousel.tsx` (no external deps).
- ❌ DON’T: Introduce new carousel deps; avoid inline secrets or hardcoded tokens.

## Touch Points / Key Files
- Layout/meta: `src/layouts/Layout.astro`
- Home CTA & scenarios promo: `src/pages/index.astro`
- Scenarios gallery page: `src/pages/scenarios.astro`
- The Problem hero CTA: `src/pages/the-problem.astro`
- News page + sidebar promo: `src/pages/news.astro`
- Header/footer/nav links: `src/components/HeaderMobile.tsx`, `src/components/Footer.astro`
- Scenario carousel component: `src/components/ScenarioCarousel.tsx`
- Security utils: `src/lib/security.ts`

## JIT Index Hints
- Components: `rg -n "export function" src/components`
- Pages/routes: `rg -n "canonicalPath" src/pages`
- API endpoints: `rg -n "export async function" src/pages/api`
- Scenario assets usage: search `/Scenarios/` in `src/pages/**`

## Common Gotchas
- Keep `set:html` content sanitized (news uses `sanitize-html`).
- Admin/cron routes rely on `CRON_SECRET`—don’t hardcode.
- Use `@/` paths; ensure tsconfig path resolution.

## Pre-PR Checks
- `npm run check && npm run build`
