# Changelog

All notable changes to this project will be documented in this file.
## [Unreleased]

### Bug Fixes

- Dedup news within a single fetch run, not just against the DB
- Require API key on cron endpoints that were unauthenticated
- Resolve Tailwind v4 @theme spacing collision breaking max-w utilities
- Tell Fallow to ignore yaml CVE override
- Override yaml to 2.9.0 to resolve CVE-2026-33532
- Resolve 26 stylelint errors in global.css
- Remove unused pnpm override flagged by fallow
- Run pnpm audit on prod deps only to avoid dev transitive vuln
- Pnpm v11 CI — add lockfile, fix workspace config, migrate fallow workflow
- Correct pnpm typo in corepack workflow
- Use corepack instead of pnpm/action-setup for v11 compatibility
- Remove --frozen-lockfile for pnpm v11 compatibility
- Migrate CI from npm/bun to pnpm
- Correct pnpm-workspace.yaml format for v11
- Restore overflow-hidden with items-stretch, remove h-full conflict
- Prevent featured article text clipping, add stronger content dedup
- Use aspect-ratio on featured image instead of h-full to prevent text clipping
- Remove overflow-hidden from featured article, add image border-radius
- Tighten news card title typography — text-sm/text-base with leading-tight
- Remove unused escapeHtml export to satisfy Fallow dead-code check
- Reduce AnimatedNewsSection card title size
- Remove unused icon imports from about page
- Consistent image placeholder for articles without photos
- Remove orphaned breadcrumb props breaking astro type check
- Remove unused Breadcrumb component
- Site defaults to light theme, dark mode is explicit toggle only
- Dark mode contrast — body text color and neutral-50 override
- Move --spacing-* tokens out of @theme to restore Tailwind v4 sizing utilities
- Ignore lightningcss-linux-x64-gnu platform binary in fallow
- Resolve all fallow dead-code and astro type-check CI failures
- Use minimal wrangler.toml to avoid pre-build entry.mjs check
- Remove package-lock.json from git tracking to fix npm optional deps bug
- Switch Netlify build from yarn to npm, remove stale yarn.lock
- Add postcss override to resolve CVE-2026-41305 in transitive deps
- Remove dead code flagged by CodeQL unused-variable alerts
- Re-add @tailwindcss/typography dependency removed by fallow
- Resolve TypeScript errors from fallow refactoring
- Theft map now loads properly + shows FOI data
- Add Yarn resolutions for uuid and yaml security overrides
- Switch to Yarn for reliable cross-platform builds
- Re-upgrade Astro to v6 with Netlify CI=false
- Downgrade Astro 6→5 for Netlify Node 20 compatibility
- Use nvm explicitly in netlify build command
- Add .nvmrc for Netlify Node 22
- Add linux rollup optional dep for netlify builds
- Track package-lock.json for netlify builds
- Use npm install for netlify build (reliable in build env)
- Netlify build config for Node 22 + Bun + Leaflet CSP
- **security**: Resolve CodeQL incomplete multi-character sanitization alerts
- **cron**: Add GET fallback for directory verification endpoint
- **news**: Link all news cards to internal summary pages; reduce to weekly
- **news**: Repair broken news scraper endpoint
- **admin**: Allow adminToken in all admin-facing Convex queries
- **admin**: Clear legacy admin_auth cookie on logout
- **admin**: Secure proxies, add missing WDTK scan, tailwind safelist
- **admin**: Repair proxy and route all internal API calls through it
- **admin**: Send admin_auth cookie to /api/admin/convex proxy
- **admin**: JWT sessions, authenticated proxy, new moderation pages
- Replace useConvex with ConvexHttpClient and add mobile-web-app-capable meta
- Resolve infinite loop in getMonthlyTrends caused by year-only parsing
- Lower news relevance threshold and expand keywords
- Replace regex html parsing with node-html-parser in news scraper
- Pin node-forge 1.4.0 and smol-toml 1.6.1 to resolve high severity vulnerabilities
- Npm audit fix to resolve node-forge, brace-expansion, smol-toml vulnerabilities
- Remove brace-expansion and picomatch overrides that broke Astro SSR
- Switch CI from bun to npm to fix frozen-lockfile errors
- Remove supabase, add security overrides for picomatch/node-forge/brace-expansion/smol-toml
- Scheduled function configs and breadcrumbs across all pages
- Add missing config exports to all scheduled Netlify functions
- Remove redundant Home nav link and bump lucide-react to 0.577.0
- Override fast-xml-parser to fix security vulnerabilities
- Use any[] for latestNews to avoid type conflict
- Remaining TypeScript errors
- Resolve all TypeScript errors
- Add explicit types to resolve TypeScript errors
- Add type annotation for trendsData variable
- Make Breadcrumb items prop optional
- Remove bun.lock to allow fresh generation
- Replace recharts with Chart.js for SSR-safe charts
- Remove TheftTrendsChart from homepage to fix SSR
- Dynamically import recharts to fix SSR crash
- Remove unused ArrowRight import from SiteSearch.tsx
- Remove --frozen-lockfile to allow lockfile updates
- Restore bun.lock for Netlify build
- Security vulnerabilities, TypeScript errors, and add missing dependency
- Remove unused useEffect import (CodeQL alert #8)
- Remove reserved index name from analyticsEvents schema
- Simplify news cards and remove author metadata
- Improve news cards UX and remove duplicate titles
- Resolve all TypeScript lint errors and warnings
- Resolve esbuild version conflicts across all dependencies
- Add error handling and loading states to timelapse map
- Update statistics with accurate Met Police data and cleanup

### CI/CD

- Bump actions/checkout from 6 to 7 (#77)
- Bump actions/setup-node from 6 to 7 (#88)
- Fix fallow dead-code analysis
- Upgrade to Node 24
- Bump google/osv-scanner-action from 2.3.5 to 2.3.8 (#65)
- Bump actions/checkout from 4 to 6
- Ignore lightningcss-linux-x64-gnu in fallow dead-code scan
- Explicitly install lightningcss-linux-x64-gnu on Linux runners
- Clean node_modules before npm install to force platform-native dep resolution
- Use npm install instead of npm ci for cross-platform optional deps
- Switch all CI workflows from bun to npm
- Ignore @tailwindcss/typography in fallow dead-code scan
- Add continue-on-error to regression baseline save step
- Add Node 22 setup alongside Bun
- Make SARIF upload non-blocking when Code Scanning is disabled
- Add OSV Scanner workflow for dependency vulnerability scanning
- Bump actions/upload-artifact from 6 to 7 (#40)
- Bump actions/checkout from 4 to 6 (#39)
- Add automatic changelog workflow
- Add automatic changelog workflow
- Add automatic changelog workflow
- Bump actions/upload-artifact from 6 to 7
- Bump actions/upload-artifact from 5 to 6
- Bump actions/upload-artifact from 5 to 6 (#23)
- Bump actions/upload-artifact from 4 to 5
- Bump github/codeql-action from 3 to 4
- Bump actions/checkout from 4 to 6

### Changes

- Fix build failures and dead-code check

- news/[slug].astro and emergency.astro each had a duplicate closing
  </div> breaking the Astro compiler on CI
- [location].astro: use hotspotRank() from the shared hotspot dataset
  (fixes Fallow unused-export failure)
- slides/[id].astro: opt dynamic route into prerender explicitly for
  output: 'server'
- Address the August site audit: syndication cap, city ranks, map escaping, legal pages, safety slides (#99)

Co-authored-by: Antonio Smith <antoniojosephsmith18@gmail.com>
- Redesign directory entries as index rows and call tiles
- Restructure FAQ around the post-theft visitor journey

- Categories reordered: 'My Phone Was Just Stolen' first, then Reporting
  to Police, Blocking Your SIM & Number, Recovery & Insurance, and
  Protecting Your Next Phone last
- Category headers drop decorative icon chips for plain typography
- Fix pill filter JS bug: inactive pills were set to bg-foreground
  (black) instead of bg-neutral-100, and active used text-background
  instead of text-primary-foreground
- Hero simplified with a 'start with the first section' pointer; 'contact
  us' is now 'contact me'
- Restructure About page, single-line directory names

- About: reorganised around five visitor questions (what is it, why it
  exists, what can I do here, why trust it, how can I help); hero now
  one-sentence mission plus a single emergency CTA; stats consolidated
  into one headline figure plus a compact strip; data sources and values
  merged into one 'Why Trust It' section with a 'Built differently'
  panel absorbing the repeated free/privacy/no-ads messages; closing CTA
  card trio removed
- banks/mobile-providers: names sit on their own line at a smaller
  responsive size so they fit on one line without wrapping or
  truncating; Website link moved to the tag row
- Denser directory grids, calmer contact blocks, first-person Ko-fi

- banks/mobile-providers: auto-fill minmax(280px,1fr) grid (1-4 cols),
  20px padding, equal-height cards with contact block anchored to the
  bottom via mt-auto, names wrap instead of truncating
- Emergency contact block now reads as information: light tinted surface
  with a red left accent border, dark 20px tabular-nums tel: number,
  muted uppercase label, availability and abroad number on one compact
  secondary line. Identical treatment on both directories
- Footer: 'Support us' Ko-fi button renamed 'Buy me a coffee'
- Fix theft-methods dark card, redesign directory cards, schedule monthly verification

- the-problem: orange method card used bg-foreground, hiding title and
  description (dark-on-dark); now matches other cards
- Tip pills: icon and text align properly when the tip wraps
- banks/mobile-providers: drop coloured letter avatars, cleaner name +
  tag + website rows
- Add scheduled-verify-directory Netlify function (monthly, 1st, 07:17
  UTC) calling /api/cron/verify-directory so Last verified dates refresh
- Round header emergency button; rename About Us to About

Site voice is first-person (solo maintainer), so the footer and search
index now say About instead of About Us.
- Fix stretched icon bar in security checkup hero on mobile
- Fix mobile menu trapped inside blurred header

The sticky header's backdrop-blur creates a containing block for fixed
descendants, so the slide-out menu and backdrop were sized to the 51px
header instead of the viewport. Render them as siblings of the header.
- Fix hero layout and mobile header overflow

- Remove UK Theft Crisis badge; vertically centre hero content
- Hero image now sizes via aspect ratio at all breakpoints (was collapsing
  to a thin strip on mobile due to over-constrained absolute sizing)
- Evidence strip wraps naturally instead of truncating the sources link
- Header: burger menu now appears at tablet widths (768-1023 had no nav),
  wordmark shrinks/truncates, theme toggle hides below 400px so the
  burger never overflows the viewport edge
- Round off harsh square cards and buttons across key pages

- Home: round Share-a-stat cards, scenarios/statistics CTA banners, count box
- News: category filters to pills, round RSS button and state boxes
- Community: compact buttons to rounded-lg per DESIGN.md
- Footer: round outline Support button
- Restyle OG share images with cinematic London hero backdrop
- Drop orphaned hero video assets
- Replace flat hero animation with cinematic London street image

- Generated 2K cinematic dusk scene, cropped watermark, optimized to 164KB JPG
- Removed hero video, autoplay script, and stale VideoObject schema
- Softened overlay gradient, tightened evidence strip to one line
- Reduced mobile hero min-height; moved orphaned videos out of public/
- Fix remaining low-contrast text on dark/red backgrounds

- banks: emergency contact box uses destructive-foreground throughout
- admin theft-reports: inactive filter pills keep light styling on toggle
- Fix unreadable community insight cards (dark-on-red/dark-on-ink tokens)
- Remove stale uuid override/resolution (dep no longer in tree; fixes Fallow CI)
- Fix null-rank badge on no-data locations, tidy hero separators, correct chart footnote
- Slim hero to tagline + CTAs + one-line evidence strip; add backup guide

- Hero stat cards duplicated AnimatedStats below the fold; replaced with
  a compact sourced stat line linking to /statistics
- Prevention guide: new 'Back Up Your Device' section (iCloud/Google
  steps, storage limits, monthly verification reminder)
- Sourced borough hotspots, about-page stats; drop unpatchable vulns; remove one-off scripts

- Hotspot lists on statistics + the-problem now use police.uk figures
  (12 months to Jun 2026, ~1mi of borough centre); Southwark enters top 5
- About page: replaced unsourced stats with Met FOI / Met / ONS / CSEW figures
- pnpm overrides: @netlify/blobs@^11, @netlify/dev-utils@^6,
  @netlify/functions-dev@^2 - clears 2 of 3 Dependabot highs (image-size);
  extract-zip remains, no upstream patch, dev-only, documented in auditConfig
- Removed applied codemods and one-off fix/cleanup scripts
- Sourced city data, OG refresh, sources block, em-dash purge

- OG images regenerated with 'every seven minutes' tagline
- City comparison + location pages: real police.uk figures
  (Jul 2025-Jun 2026, theft-from-person within ~1mi of centre);
  Manchester/Edinburgh/Glasgow marked 'not published' (GMP/Police
  Scotland do not feed police.uk street data)
- statistics page: Sources & methodology block with links to Met FOI,
  Met press releases, ONS bulletins, police.uk API
- Removed unused api/admin/seed-stats endpoint (generated synthetic data)
- Purged em/en dashes from user-facing copy and outbound templates
- Retag to 'every seven minutes', add 2019-2025 trend chart

- Tagline now reflects 2025 Met rate (71,391 thefts, one every ~7.4 min)
- statistics page: year-by-year bar chart, Met FOI series 2019-2024
  plus 2025 headline series with comparability footnote
- Updated H1, meta descriptions, OG/Twitter alt text, badges
- Update theft stats to sourced 2024-2026 figures, trim hero copy

- Hero: 117,211 London thefts 2024 (Met FOI), -12.3% fall in 2025 (Met),
  248 arrests in 4-week blitz (Met, Jan-Feb 2026); drop unsourced 150%/0.8%
- Remove hero paragraph; H1 + CTAs + stats grid only
- statistics/the-problem/location/faq: year-labeled, sourced figures;
  soften unsourced recovery-rate claims
- AnimatedStats: match new sourced numbers
- Fix mobile UX sweep: lucide icon classes, contrast, spacing, excerpts

- Codemod: class -> className for lucide-react icons across 23 .astro files (213 icons were rendering unstyled at default 24px, breaking layout and positioning, e.g. detached search icons).
- mobile-providers: emergency contact box used solid bg-destructive with dark red text (unreadable) -> bg-destructive-subtle.
- banks/theft-map: restore spaces eaten before inline links ('ouremergency guide', 'byreporting').
- news: strip title prefix duplicated inside scraped excerpts (incl. source-suffix variants).
- home: shorten key-stats disclosure summary to avoid mid-phrase wrap.
- Add square 1080x1080 OG share card for 1:1 crop contexts

convert-og-image.mjs now renders both wide and square variants; Layout emits both as og:image alternates.
- Redesign OG image and logo lockup, refresh meta descriptions to new tagline

og-image + logo.svg/png now match the editorial ink/paper/alert-red system; default description, schema.org org logo, manifest, and og/twitter image alt text updated. Hero stats collapse behind a disclosure on mobile.
- Fix mobile hero readability and compact mobile buttons

Hero video becomes a cover background behind flowing content on mobile (no more cramped 4:5 overlay), scrim strengthened. touch-target min drops 44px to 40px (still above WCAG 2.2 AA 24px); hero, checkup, news CTAs get compact px-4 py-2 on small screens.
- Wire orphaned color tokens into DESIGN.md component specs
- Darken warning amber to #9A4F00 for WCAG AA contrast
- Bump convex in the convex group across 1 directory (#73)
- Bump the react group across 1 directory with 4 updates (#91)
- Drop unused exports flagged by Fallow dead-code gate
- Bump the dev-dependencies group across 1 directory with 3 updates (#95)
- Extract admin TableLoadingRow/ModalHeader, dedupe verification fetch fallback
- Dedupe analytics recent-events query prologue
- Share police.uk fetch helpers between endpoint and backfill script
- Share approval/delete/list handlers in convex crud lib
- Share admin CRUD mutation handlers in convex/lib/crud
- Share Chart.js tooltip/grid/tick options via chartPalette
- Share cron-caller boilerplate across Netlify scheduled functions
- Share headline dedup between Convex and Astro app
- Extract shared directory-discovery core into src/lib
- Editorial favicon, manifest theme, and shared chart palette
- Bring undersized interactive elements to 44px touch targets
- Bump resend from 6.14.0 to 6.20.0 (#93)
- Bump nanostores from 1.3.0 to 1.5.1 (#90)
- Bump sanitize-html from 2.17.5 to 2.17.7 (#94)
- Scope Fallow PR regression check to dead-code
- Tighten button padding to match content size
- Persist Fallow regression baseline for PR checks
- Regenerate lockfile with pnpm 11.1.1
- Optimize hero video and harden playback
- Pair inverting surfaces with semantic foreground tokens
- Sync DESIGN.md with editorial system and restore radii
- Quieter desktop nav and a text-forward news index
- Fix Fallow dead-code job: declare production deps correctly

Fallow's dead-code check fails with --fail-on-issues on three
dev-dep-in-prod findings: tailwindcss and @tailwindcss/typography are
imported by src/styles/global.css, and @resvg/resvg-js by
scripts/convert-og-image.mjs, yet all three sat in devDependencies.
Pre-existing failure, not introduced by the redesign.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015Q86Qi5hphcto97zGqhCvp
- Fix CI security job: upgrade Astro 7 and patch vulnerable transitive deps

The CI security job (pnpm audit --prod) was failing on 14 production
vulnerabilities. Upgrades astro 6 -> 7, @astrojs/netlify 7 -> 8 and
@astrojs/react 5 -> 6 to clear astro's own advisories, and pins the
remaining vulnerable transitive dependencies (js-yaml, sharp, postcss,
nanoid, svgo, tar, brace-expansion, fast-uri) via pnpm overrides.

Astro 7 requires vite 8, so the vite override moves to ^8.0.13. Tailwind
v4 no longer works through PostCSS under vite 8, so it moves to the
official @tailwindcss/vite plugin and postcss.config.mjs is removed.

Two advisories (image-size, extract-zip) have no published fix upstream
and sit in Netlify dev tooling rather than shipped code; they are listed
in auditConfig.ignoreGhsas with a note to revisit.

30 advisories -> 3, all five CI jobs verified passing locally.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015Q86Qi5hphcto97zGqhCvp
- Merge branch 'redesign/data-journalism'
- Redesign cleanup: fix remaining off-palette remnants
- Data-journalism visual system
- Patch dependencies and fix XSS/debug leaks
- Bump resend from 6.12.3 to 6.14.0 (#71)
- Bump the dev-dependencies group across 1 directory with 10 updates (#70)
- Bump sanitize-html from 2.17.3 to 2.17.5 (#69)
- Bump the react group across 1 directory with 3 updates (#67)
- Bump convex from 1.38.0 to 1.39.1 in the convex group (#60)
- Bump astro from 6.3.1 to 6.3.4 in the astro group (#59)
- Migrate from npm/bun to pnpm across all docs and scripts
- Migrate to pnpm
- We/our → I/my, add Antonio Smith credit
- News page — clean card grid, remove hardcoded colors, semantic tokens
- Remove breadcrumbs from all pages
- Compact breadcrumbs — remove pill container, reduce spacing
- Rebuild UI to match DESIGN.md light theme + semantic tokens
- Merge pull request #58 from antonio59/dependabot/github_actions/actions/checkout-6

ci: bump actions/checkout from 4 to 6
- Fix XSS and insecure randomness vulnerabilities
- Batch update all dependencies + fix security vulnerabilities
- Merge branch 'main' of https://github.com/antonio59/ProtectMyMobile
- Merge branch 'main' of https://github.com/antonio59/ProtectMyMobile
- Merge branch 'main' of https://github.com/antonio59/ProtectMyMobile
- Merge branch 'main' of https://github.com/antonio59/ProtectMyMobile
- Merge branch 'main' of https://github.com/antonio59/ProtectMyMobile
- **admin**: Add distinct 401 error messages to proxies
- Merge branch 'main' of https://github.com/antonio59/ProtectMyMobile
- Merge branch 'main' of https://github.com/antonio59/ProtectMyMobile
- Merge branch 'main' of https://github.com/antonio59/ProtectMyMobile
- Merge branch 'main' of https://github.com/antonio59/ProtectMyMobile
- Merge branch 'main' of https://github.com/antonio59/ProtectMyMobile
- Merge branch 'main' of https://github.com/antonio59/ProtectMyMobile
- Remove framer-motion to eliminate 122KB shared bundle chunk

High-impact bundle optimizations for emergency-site performance:

- Refactor HeaderMobile + SiteSearch to use CSS transitions instead of
  framer-motion (removes library from critical path of every page)
- Refactor AnimatedStats, AnimatedNewsSection, AnimatedResources to use
  a lightweight IntersectionObserver hook + CSS keyframe animations
- Add src/hooks/useInView.ts (~400 bytes) as drop-in replacement
- Delete unused PageTransition.tsx and AnimatedHero.tsx
- Remove framer-motion from package dependencies entirely
- Change TheftTrendsChart hydration from client:only/client:load to
  client:visible so Chart.js loads only when scrolled into view

Results:
- Eliminates 122KB raw / ~40KB gzipped shared proxy chunk entirely
- Most pages (emergency, banks, prevention, etc.) no longer load any
  animation library code on initial render
- 397 fewer modules in build (2267 → 1870)
- Build time ~1s faster
- npm run check: 0 errors, 0 warnings
- Merge branch 'main' of https://github.com/antonio59/ProtectMyMobile
- Standardize on npm and clean up repository artifacts

- Remove stale duplicate directories (ProtectMyMobile/, netlify/netlify/)
- Add .claude/worktrees/ and stray duplicates to .gitignore
- Replace Bun references with npm across all AGENTS.md files
- Update package.json scripts: bunx -> npx, bun run -> npx tsx for TS scripts
- Install tsx as devDependency for TypeScript script execution with npm
- Update README, TESTING_GUIDE, and IMPLEMENTATION_SUMMARY for npm
- Fix shebangs in health-check.ts and test-news-fetch.ts
- npm run check now passes cleanly (0 errors, 0 warnings)
- Fix vite security vulnerabilities via npm audit fix

- Vite Path Traversal in Optimized Deps .map Handling (GHSA-4w7w-66w2-5vf9)
- Vite Arbitrary File Read via Dev Server WebSocket (GHSA-p9ff-h696-f583)
- Updates vite from 6.4.1 to 6.4.2
- Merge remote main and resolve package.json conflicts
- Bump @tanstack/react-query from 5.95.0 to 5.99.0 (#48)
- Bump convex from 1.34.1 to 1.35.1 in the convex group (#47)
- Bump the dev-dependencies group across 1 directory with 3 updates (#46)
- Bump marked from 17.0.5 to 17.0.6 (#43)
- Bump resend from 6.9.4 to 6.10.0 (#42)
- Remove Reddit bot infrastructure and monitoring

- Delete reddit-bot.ts script and GitHub Actions workflow
- Remove admin Reddit Monitor page and nav link
- Remove Reddit social link from footer
- Clean up Reddit env vars from types, examples, and .env
- Remove Reddit from CSP connect-src
- Update DISCOVERABILITY_STRATEGY.md to reflect removed automation
- Merge pull request #33 from antonio59/dependabot/npm_and_yarn/lucide-react-0.577.0

deps: bump lucide-react from 0.562.0 to 0.577.0
- Bump lucide-react from 0.562.0 to 0.577.0
- Merge pull request #34 from antonio59/dependabot/npm_and_yarn/astro-7227d57b7f

deps: bump the astro group with 2 updates
- Bump the astro group with 2 updates
- Merge pull request #35 from antonio59/dependabot/npm_and_yarn/convex-081ab26ef1

deps: bump convex from 1.34.0 to 1.34.1 in the convex group
- Bump convex from 1.34.0 to 1.34.1 in the convex group
- Fix news fetch timeout - remove 3s delay between sources, reduce parser timeout to 5s
- Update dependencies to fix vulnerabilities
- Update bun.lock after installing dependencies
- Fix package.json syntax: add missing comma
- Merge pr/9 (ours)
- **deps**: Bump resend from 6.5.0 to 6.5.1
- Merge pr/8 (ours)
- **deps**: Bump @rollup/rollup-darwin-arm64 from 4.53.2 to 4.53.3
- Merge pr/7 (ours)
- **deps**: Bump @supabase/supabase-js from 2.81.1 to 2.83.0
- Merge pr/6 (ours)
- **deps**: Bump @tanstack/react-query from 5.90.9 to 5.90.10
- Merge pr/5 (ours)
- **deps**: Bump the ui group with 2 updates
- Merge pr/4 (ours)
- **deps**: Bump @types/react from 19.2.4 to 19.2.6 in the react group
- Merge pr/31 (ours)
- Bump lucide-react from 0.562.0 to 0.577.0
- Merge pr/30 (ours)
- Bump lucide-react from 0.562.0 to 0.576.0
- Merge pr/3 (ours)
- **deps**: Bump astro from 5.15.6 to 5.15.9 in the astro group
- Merge pr/29 (ours)
- Merge pr/28 (ours)
- Bump lucide-react from 0.562.0 to 0.575.0
- Merge pr/27 (ours)
- Bump lucide-react from 0.562.0 to 0.564.0
- Merge pr/26 (ours)
- Bump the dev-dependencies group with 3 updates
- Merge pr/25 (ours)
- Bump lucide-react from 0.562.0 to 0.563.0
- Merge pr/24 (ours)
- Bump the dev-dependencies group with 3 updates
- Merge pr/23 (ours)
- Merge pr/22 (ours)
- Bump lucide-react from 0.556.0 to 0.562.0
- Merge pr/21 (ours)
- Bump lucide-react from 0.556.0 to 0.561.0
- Merge pr/20 (ours)
- Bump the dev-dependencies group with 2 updates
- Merge pr/2 (ours)
- **deps**: Bump actions/checkout from 4 to 5
- Merge pr/16 (ours)
- Bump lucide-react in the ui group across 1 directory

Bumps the ui group with 1 update in the / directory: [lucide-react](https://github.com/lucide-icons/lucide/tree/HEAD/packages/lucide-react).


Updates `lucide-react` from 0.553.0 to 0.556.0
- [Release notes](https://github.com/lucide-icons/lucide/releases)
- [Commits](https://github.com/lucide-icons/lucide/commits/0.556.0/packages/lucide-react)

---
updated-dependencies:
- dependency-name: lucide-react
  dependency-version: 0.556.0
  dependency-type: direct:production
  update-type: version-update:semver-minor
  dependency-group: ui
...

Signed-off-by: dependabot[bot] <support@github.com>
- Merge pr/15 (ours)
- **deps**: Bump actions/checkout from 4 to 6
- Merge pr/14 (ours)
- **deps**: Bump recharts from 3.4.1 to 3.5.0
- Merge pr/13 (ours)
- **deps**: Bump resend from 6.5.0 to 6.5.2
- Resolve conflicts: keep current package.json, remove lockfile
- **deps**: Bump marked from 17.0.0 to 17.0.1
- Resolve package.json conflict, keep both radix and supabase deps
- **deps**: Bump @supabase/supabase-js from 2.81.1 to 2.84.0
- Remove package-lock.json, keep Bun
- **deps**: Bump the astro group across 1 directory with 2 updates
- Resolve CI conflict, keep Bun
- **deps**: Bump actions/setup-node from 4 to 6
- Switch to text-focused news cards with icons
- Enhance news cards design with featured images and modern UI
- Fix CodeQL vulnerabilities
- Bump the dev-dependencies group with 2 updates (#20)
- Bump lucide-react from 0.556.0 to 0.562.0 (#22)
- Add admin news management, SEO improvements, and social sharing

- Fix news card title/excerpt display (smaller text, more lines)
- Add AdminLayout with sidebar navigation
- Add admin dashboard (/admin) with stats overview
- Add news management page (/admin/news) with edit/delete/publish
- Add NewsArticle and BreadcrumbList schema to news posts
- Add social sharing buttons to news articles (Twitter, Facebook, WhatsApp, Reddit)
- Add Twitter/Reddit social links to footer
- Add twitter:site and twitter:image:alt meta tags
- Update robots.txt to block /admin and /api routes
- Fix Layout to accept array of schemas
- Remove systemLogs - simplify logging to console
- Fix news cards to show full titles and excerpts

- Removed line-clamp truncation from titles and excerpts
- Larger title text (text-xl) for better readability
- Full excerpt display without truncation
- Added source name display
- Removed systemLogs dependency from news page (Convex schema not deployed)
- Simplified health endpoint to work without systemLogs
- Improved card layout with better spacing
- Fix Netlify build error - remove invalid context environment variables
- Fix news scraper with monitoring and multiple sources

- Fixed Google News RSS blocking by adding User-Agent header
- Added 4 news sources with priority-based fallback (Google News x2, BBC UK, Guardian UK Crime)
- Improved content filtering to exclude car/vehicle theft articles
- Implemented exponential backoff retry logic (1s, 2s, 4s delays)
- Added comprehensive system logging with info/warning/error levels
- Created health check endpoint at /api/health
- Added status dashboard on news page showing last fetch time and recent errors
- Changed cron schedule from weekly to daily at 9 AM UTC
- Created test scripts for manual testing (scripts/test-news-fetch.ts, scripts/health-check.ts)
- Updated WDTK scraper with logging
- Enhanced error handling and email notifications
- Added rate limiting (3s delay between sources, max 15 articles per run)
- Created NEWS_SCRAPING.md and TESTING_GUIDE.md documentation
- Update components to use new package features

Calendar (react-day-picker v9):
- Updated to new v9 class name structure
- Simpler, more semantic class names (day_disabled → disabled, etc.)
- Updated Chevron component API
- Better accessibility support

Drawer (vaul 1.1):
- Added direction prop (top, bottom, left, right)
- Support for side drawers (left/right)
- Dynamic handle positioning based on direction
- Better flexibility for different UI patterns

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Update packages to latest versions

Package updates:
- marked: 12.0.2 → 17.0.1
- react-day-picker: 8.10.1 → 9.12.0
- vaul: 0.9.9 → 1.1.2
- react-resizable-panels: 2.1.9 → 3.0.6

Fixed RSS feed to use correct Convex API (newsPosts.list)

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add SEO enhancements

New features:
- RSS feed at /rss.xml for news articles
- Web App Manifest for PWA support
- Netlify _headers for security headers and caching

Layout improvements:
- Preconnect hints for Google Fonts (faster loading)
- Theme color meta tag
- Apple touch icon and web app meta tags
- RSS feed link in head

Security headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

Caching:
- Immutable cache for /_astro/* (hashed assets)
- 1 week cache for images and scenarios
- 1 day cache for OG image

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Merge pull request #19 from antonio59/dependabot/github_actions/actions/upload-artifact-5

ci: Bump actions/upload-artifact from 4 to 5
- Merge pull request #18 from antonio59/dependabot/github_actions/github/codeql-action-4

ci: Bump github/codeql-action from 3 to 4
- Fix CodeQL warnings

- animated-card.tsx: Remove duplicate 'initial' prop (useless assignment)
- CommunityVoting.tsx: Remove redundant condition (useless comparison)
  The condition 'currentStep === 5 && ...' was already covered by 'currentStep < 6'

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Merge pull request #17 from antonio59/dependabot/github_actions/actions/checkout-6

ci: Bump actions/checkout from 4 to 6
- Switch fully to bun - remove npm completely

Configuration:
- packageManager: bun@1.3.3
- CI: uses oven-sh/setup-bun@v2
- Netlify: BUN_VERSION=1.3.3, bun install --frozen-lockfile

Native binaries for cross-platform support:
- @rollup/rollup-darwin-arm64 + linux-x64-gnu
- @esbuild/darwin-arm64 + linux-x64 (pinned to 0.25.12)
- @tailwindcss/oxide-darwin-arm64 + linux-x64-gnu
- lightningcss-darwin-arm64 + linux-x64-gnu

trustedDependencies: @parcel/watcher, esbuild, rollup

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Enhance CI/CD pipeline and fix type errors

CI Improvements:
- Switch from bun to npm for consistency with Netlify
- Add type checking job (npm run check)
- Add security audit job (npm audit --audit-level=high)
- Add build artifact upload
- Add concurrency control to cancel stale runs
- Split into parallel jobs: lint-and-typecheck, security, build

New Workflows:
- CodeQL security analysis (weekly + on PRs)

Dependabot Enhancements:
- Add commit message prefixes (deps, ci)
- Add labels for PRs
- Group Radix UI and Convex packages
- Ignore major version updates (manual review)

Bug Fixes:
- Add missing tailwind-merge package
- Fix TypeScript error in ScenarioCarousel (navigator.share check)

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Fix Netlify build - remove platform-specific native binaries

Removed darwin-arm64 specific packages that broke Linux builds:
- @esbuild/darwin-arm64
- @rollup/rollup-darwin-arm64
- @tailwindcss/oxide-darwin-arm64
- lightningcss-darwin-arm64

npm properly installs the correct platform binaries automatically.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Switch to bun for local development

- Set packageManager to bun@1.3.3
- Add explicit native binaries for macOS (darwin-arm64):
  - @esbuild/darwin-arm64
  - @rollup/rollup-darwin-arm64
  - @tailwindcss/oxide-darwin-arm64
  - lightningcss-darwin-arm64
- Add trustedDependencies and esbuild override for version consistency
- Keep npm for Netlify builds (better cross-platform native dep handling)

Local dev: bun install && bun run dev
CI builds: npm install && npm run build

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add share button to scenario slides with metadata

Features:
- Share button on each scenario carousel
- Native Web Share API support (mobile)
- Copy link with visual feedback
- Share to X/Twitter with title and summary
- Share to WhatsApp with formatted message
- Share to Facebook
- Anchor links for each scenario (#moped-snatch, #street-safety, etc.)
- Smooth scroll offset for anchor navigation

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add Tailwind v4 enhancements - text shadows, colored glows, animations

New Features:
- Text shadows on hero headlines (text-shadow-hero, text-shadow-glow, text-shadow-danger)
- Colored drop shadows on CTAs (shadow-glow-red, shadow-glow-blue, etc.)
- Pulsing glow animation on emergency button
- Card lift effect on scenario cards with staggered entrance animations
- 3D tilt effects on hover (tilt-3d class)
- Mask utilities for gradient fades
- Pointer-specific styles (touch vs mouse devices)
- Native v4 animations replacing tailwindcss-animate

Removed:
- tailwindcss-animate package (replaced with native CSS animations)

Performance:
- Faster animations using native CSS
- Better accessibility with prefers-reduced-motion support

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- **deps**: Bump actions/checkout from 4 to 6 (#15)
- Bump lucide-react in the ui group across 1 directory (#16)

Bumps the ui group with 1 update in the / directory: [lucide-react](https://github.com/lucide-icons/lucide/tree/HEAD/packages/lucide-react).


Updates `lucide-react` from 0.553.0 to 0.556.0
- [Release notes](https://github.com/lucide-icons/lucide/releases)
- [Commits](https://github.com/lucide-icons/lucide/commits/0.556.0/packages/lucide-react)

---
updated-dependencies:
- dependency-name: lucide-react
  dependency-version: 0.556.0
  dependency-type: direct:production
  update-type: version-update:semver-minor
  dependency-group: ui
...

Signed-off-by: dependabot[bot] <support@github.com>
Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
- Upgrade to Tailwind CSS v4

Major Changes:
- Upgrade tailwindcss from v3 to v4.1.17
- Remove @astrojs/tailwind integration (use PostCSS directly)
- Add @tailwindcss/postcss and @tailwindcss/cli
- Migrate config from tailwind.config.mjs to CSS @theme directive
- Update global.css with v4 syntax (@import 'tailwindcss', @plugin)
- Switch Netlify builds from bun to npm (better native dep handling)
- Remove darwin-specific packages from package.json

Benefits:
- Faster builds with Rust-based engine
- Smaller CSS output
- Native CSS cascade layers
- Zero vulnerabilities

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Keep @astrojs/tailwind at latest 6.0.2

- The fix was pinning tailwindcss to exact 3.4.17 (no ^)
- @astrojs/tailwind 6.0.2 supports tailwindcss ^3.0.24

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Fix Netlify build - pin Tailwind CSS and integration versions

- Pin tailwindcss to exact version 3.4.17 (prevent v4 resolution)
- Downgrade @astrojs/tailwind to 5.1.4 (compatible with Tailwind v3)
- Fixes PostCSS plugin error on Netlify CI

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Replace snoowrap with native fetch - zero vulnerabilities

- Rewrite reddit-bot.ts to use native fetch API with Reddit OAuth2
- Remove snoowrap and @types/snoowrap dependencies
- Remove no-longer-needed dependency overrides
- Reddit API URLs are now hardcoded constants (not user input)
- bun audit now reports: No vulnerabilities found

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add dependency overrides to fix snoowrap vulnerabilities

- Override form-data to ^4.0.0 (fixes critical vulnerability)
- Override ws to ^8.18.0 (fixes high severity DoS)
- Override tough-cookie to ^4.1.4 (fixes prototype pollution)
- Remaining 'request' moderate SSRF is not exploitable (bot only calls Reddit API)

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Fix Cafe scenario not rendering - remove accented characters

- Rename folder from 'Café' to 'Cafe' (accented é caused URL encoding issues)
- Update scenarios.astro references to use non-accented names

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Improve London visitors section buttons

- Add prominent Visitor Safety Guide button linking to dedicated page
- Add separate Emergency Steps button with red styling
- Better spacing and responsive layout for button group

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Consolidate hero section with prominent video animation

- Remove duplicate 'Blink and it's gone' section
- Make video more prominent with wider aspect ratio (21:9 on desktop)
- Add gradient overlay with CTAs and stats on video
- Limit video to 3 loops then stop to reduce page load

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Combine hero CTA with Blink-and-it's-gone animation above the fold

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Reorder London visitor safety section under blink-and-gone hero

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add marked dependency for news markdown rendering

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Make Netlify bun install fallback-safe if bun missing

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Fix Netlify build by using builtin bun and removing darwin-only resvg dep

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Harden admin/cron routes and refresh content/assets

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Prerender news slug page to satisfy Vite warning

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add AGENTS hierarchy for UI, Convex, Netlify, scripts

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Replace embla carousel with native scroll for scenarios

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add scenarios gallery and promote across site

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Fix esbuild version mismatch for Netlify build
- Add SEO improvements, OG image, and Reddit bot

- Add Schema.org JSON-LD structured data (Organization, WebSite, FAQ, HowTo, Dataset schemas)
- Optimize meta tags and titles for key pages targeting UK phone theft searches
- Fix dynamic canonical URLs and OG tags
- Create OG image (1200x630) for social sharing
- Add Reddit bot script for automated subreddit posting
- Add GitHub Action for weekly automated Reddit posts
- Add geo meta tags for UK targeting

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Update statistics with accurate 2024 data and simplify layout

- Update key stats with verified figures:
  - 78,000 snatch thefts UK (2024)
  - 116,000+ London alone (2024)
  - 150% increase since 2023
  - 0.8% result in charges
- Simplify hotspots to Top 5 London boroughs (cleaner list view)
- Westminster now shows 34,000+ (most accurate figure)
- Update city comparison with year labels
- Remove busy 12-card grid, now simple vertical list
- Sources: Met Police, Home Office, House of Commons Library

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Consolidate statistics page and remove timelapse

- Completely redesigned /statistics page with:
  - Hotspot rankings grid (12 areas with risk levels)
  - City comparison bar charts
  - Time-of-day risk analysis
  - Seasonal patterns section
  - Action CTAs
- Delete timelapse page and all related components:
  - TimelapseMap.tsx
  - TimelapseMapFinal.tsx
  - TimelapseMapRedesigned.tsx
  - UKStatistics.tsx
  - UKStatisticsLive.tsx
- Update homepage: replace timelapse CTA with statistics CTA
- Update navigation: remove Theft Map from header, footer, resources
- Cleaner, faster page without Leaflet map dependencies

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Change affiliate button text to product title

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add Amazon affiliate links to products page

- Add Products to header navigation (before News)
- Add affiliate disclosure in hero section
- Add 'Shop on Amazon' buttons with affiliate links:
  - Phone Lanyards & Wrist Straps
  - Anti-Theft Crossbody Bags
  - Phone Tracking Devices
  - Phone Grips & Holders
  - Privacy Screen Protectors
  - RFID Blocking Wallets & Cases
  - Secure Phone Cases
- Phone Insurance has no affiliate (comparison needed)
- Buttons use category colors and open in new tab
- Added rel='sponsored' for proper SEO

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add product recommendations page

- Create /products page with 8 product categories:
  - Phone Lanyards & Wrist Straps
  - Anti-Theft Crossbody Bags
  - Phone Tracking Devices
  - Phone Grips & Holders
  - Privacy Screen Protectors
  - RFID Blocking Wallets
  - Secure Phone Cases
  - Phone Insurance
- Each category includes benefits and what to look for
- No specific brand recommendations (placeholder for future affiliates)
- Add to Resources page, Footer, and mobile nav

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Fix mobile menu - solid white background and better close button

- Add explicit white background with inline style
- Make close button larger and more visible
- Add scrollable nav area for long menus
- Better hover states for touch

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Update header navigation links

Desktop nav now shows: The Problem, Statistics, Theft Map, News
Removed Home and Banks from desktop nav
Mobile menu still has full navigation

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Restyle resources page with consistent design

- Use HeaderMobile and gradient hero section
- Add quick nav tabs: The Problem, Statistics, Theft Map, News
- Organize into 3 sections: Guides & Tools, Directories, Data & Insights
- Add Security Checkup and Community Experiences cards
- Modern card design with colored headers and hover effects
- Remove old Bank/Home navigation

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Fix broken government announcement link

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Fix video position - shift right to show character

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Shift video position to show character better

- Add object-[30%_center] to video element
- Character now more visible in the frame

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Replace animations with theft method cards on The Problem page

- Remove TheftAnimations.tsx component
- Add 10 theft method cards with icons, descriptions, and prevention tips:
  - Cyclist Snatch, Moped Drive-By, Bump and Grab
  - Public Transport Pickpocket, Café Tabletop Grab
  - Map Distraction, Park Grab-and-Run, Photo Opportunity Theft
  - Bag Pocket Theft, Night Out Theft
- Each card has unique color coding and shield-icon tip
- Static stats and hotspots sections (no client-side JS needed)
- Cleaner, faster-loading page

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add 'The Problem' intro section to homepage with video

- Add phone theft animation video to public/videos/
- Create impactful 'The Problem' section between hero and news
- Features looping video on left, stats and CTA on right
- Dark gradient background with 4 key stats (78K+ stolen, 44% increase, 3 min intervals, 6% recovery)
- Links to full /the-problem page for more details
- Video autoplays muted with loop for seamless animation

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Fix premature text wrapping in hero sections

- Remove max-w-xl constraints from hero paragraph text
- Updated: AnimatedHero, prevention, news, the-problem, about-us, mobile-providers, banks pages
- Text now flows naturally without artificial line breaks

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Remove duplicate privacy/terms pages and update footer links

- Delete privacy-policy.astro and terms-of-service.astro (keeping new versions)
- Update footer to link to /privacy and /terms instead
- Add 'The Problem' link to Resources section in footer

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add about-us, privacy, terms pages and animated theft problem page

- Update about-us.astro with modern gradient hero and value cards
- Create privacy.astro with comprehensive privacy policy
- Create terms.astro with disclaimers and user responsibilities
- Create the-problem.astro explaining the UK phone theft epidemic
- Create TheftAnimations.tsx with Framer Motion animations showing:
  - Bike ride-by theft
  - Table snatch theft
  - Distraction theft with accomplice
  - Moped snatch
- Add animated statistics counters
- Add London theft hotspots section
- Add timeline of theft epidemic growth
- All pages use HeaderMobile and consistent styling

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Restyle prevention, security-checkup, and news article pages

- Add modern gradient hero sections to all pages
- Use HeaderMobile component for consistent navigation
- Update prevention page with colored card headers and cleaner layout
- Update security-checkup with teal/cyan hero and time indicators
- Update news article page with better header layout showing meta info
- Consistent rounded-2xl cards and shadow styling
- Improved mobile responsiveness

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Auto-update last verified date from Convex metadata

- Add siteMetadata table to track verification timestamps
- Add siteMetadata.ts with get/set/updateDirectoryVerified functions
- Update verify-directory cron to store timestamps in Convex
- Update banks and mobile-providers pages to fetch dates from Convex
- Add getDirectoryLastVerified() helper function

Now the 'Last verified' date updates automatically when the cron job runs.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Restyle mobile-providers, banks, emergency, and news pages

- Add modern hero sections with gradient backgrounds
- Add 'Last verified' date badges to mobile-providers and banks
- Convert directory listings to responsive 2-column grid cards
- Use HeaderMobile component for consistent navigation
- Add working category filter on news page
- Improve emergency page with progress indicator
- Better card hover effects and transitions
- Cleaner, more compact card designs
- Improved mobile responsiveness across all pages

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add skeleton loaders, page transitions, replace purple with teal/cyan

- Add skeleton loader components (news cards, stats, resources, tables)
- Add shimmer animation for loading states
- Add page transition component with fade/slide animations
- Replace all purple/pink gradients with teal/cyan color scheme
- Update category badges and borders to use teal instead of purple
- Maintain consistent color palette across all pages and components

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add Framer Motion animations and mobile-responsive UI

- Install framer-motion for animations
- Create mobile hamburger menu with slide-out drawer
- Add animated hero section with floating background shapes
- Add animated news cards with stagger effect
- Add animated stat counters with number animation
- Add animated resource cards with hover effects
- Create reusable animation utilities (motion.tsx)
- Create animated card components library

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add manual news article admin page
- Update notification email to real address
- Trigger redeploy for env vars
- Add password protection to admin pages
- Update CI workflow to use Bun, remove Supabase keep-alive
- Fix Netlify build: install bun before building
- Migrate from Supabase to Convex, add FOI data system

- Replace Supabase with Convex for all data operations
- Switch package manager from npm to bun
- Add FOI request tracking and WhatDoTheyKnow scraping
- Add theft data management with year filtering
- Add admin pages for data management (/admin/data, /admin/foi)
- Add Netlify scheduled functions for automated tasks
- Add email notification system via Resend
- Update statistics page to use live Convex data
- Clean up redundant documentation files

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Revert analytics script to standard endpoint to fix 401 error

- Switched back to /script.js from /stats
- /stats endpoint may require authentication or conflict with dashboard routes
- Update Umami script URL to bypass ad blockers

- Changed script source from /script.js to /stats per user request

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Re-enable Umami analytics with secure HTTPS URL

- Added secure tracking script to main layout
- Updated README with analytics info

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Revert Umami analytics integration due to Mixed Content issues

- Removed HTTP tracking script (blocked by browsers on HTTPS site)
- Updated README to reflect removal

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add hosted Umami analytics script

- Added Umami tracking script to main layout
- Updated README with analytics stack info

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add CI/CD configuration

- Add Dependabot for weekly dependency updates
- Add CI workflow to verify build on push/PR
- Update documentation and archive legacy design docs

- Rewrote README.md to reflect current tech stack and features
- Rewrote DEPLOYMENT.md for Netlify + Supabase architecture
- Created TIMELAPSE_DATA_GUIDE.md
- Marked historical design documents as [ARCHIVED] or [REFERENCE]

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add Supabase keep-alive workflow and fix contact form RLS

- Added .github/workflows/supabase-keep-alive.yml to prevent Supabase pausing
- Improved error handling in contact submission API
- Added SQL migration script for contact form RLS policies

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Refactor timelapse and statistics pages for UK-wide focus

- Add TimelapseMapFinal component for UK-centric map view
- Add UKStatistics component for interactive national stats
- Update pages to use new components and real data
- Fix package.json scripts and dependencies

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Timelapse map layer switching issue
- Upgrade Timelapse for UK-wide coverage
- Timelapse component for production readiness
- Add netlify.toml
- Add admin database seed tool
- Auto-publish scraped news articles
- Switch from Node.js adapter to Netlify adapter
- Add missing dependencies to package.json
- Enhance site with automated tools, improved UI, and localization

- Replaced n8n with internal automated news scraper and directory verification cron jobs
- Added internal analytics system (Supabase SQL setup)
- Improved Community Experiences page with real-time stats updates (Nanostores)
- Redesigned Contact Us page and Header
- Localized content to British English (personalised, defence, etc.)
- Enhanced Security Checkup with share functionality and balanced scoring
- Added Reddit monitoring admin tool
- Cleaned up codebase (removed backups and unused workflow docs)
- Upgraded to SSR (Node adapter) for dynamic features

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Fix broken footer resource links

Changed footer 'Resources' section from broken links to working pages:
- /resources/data-recovery → /resources (All Resources)
- /resources/insurance-claims → /prevention (Device Security)
- /resources/device-replacement → /banks (Bank Contacts)
- /resources/family-safety → /mobile-providers (Network Providers)

All footer links now work properly.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Remove IMEI download tool - privacy-first approach

CHANGES:
- Removed 'Download IMEI template' button - we don't want to suggest storing sensitive data with us
- Replaced with clear instructions on how to find IMEI (*#06#, settings, packaging)
- Added privacy-first messaging: 'We NEVER ask for or store your IMEI number'
- Provided secure storage options users can use themselves:
  * Password managers (1Password, Bitwarden, LastPass)
  * Encrypted notes
  * Email to themselves
  * Physical note in safe place
  * Screenshot stored securely

This reinforces our privacy-first stance and empowers users to manage their own data securely.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Implement interactive security checkup tool

FEATURES:
- 12-question security assessment covering:
  * Device security (screen lock, biometrics, Find My Device)
  * SIM & network (SIM PIN, IMEI number)
  * Apps & banking (2FA, app security)
  * Backup & recovery
  * Security awareness

- Real-time scoring system (0-100%)
- Category breakdown with visual progress bars
- Personalized recommendations based on answers
- Action plan with priority levels (high/medium)
- Beautiful results page with score level (Excellent/Good/Fair/Needs Improvement)
- Progress tracker while answering
- Links to prevention guides, banks, mobile providers
- Responsive React component

Users can now get instant feedback on their security posture and specific steps to improve.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Fix news display: remove duplicate title/excerpt and add image placeholders

FIXES:
1. Removed duplicate title and excerpt from article detail page
   - Title/excerpt were showing twice (once in header, once in markdown)
   - Now only shows meta info at top, content starts directly with article body

2. Added placeholder for news posts without images
   - Gradient background with newspaper icon
   - Consistent look across all news cards on homepage
   - Blue theme matching site design

Articles now have cleaner layout and homepage news cards look uniform.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add typography plugin to tailwind config
- Add Tailwind Typography plugin for proper news formatting
- Improve news article styling - better typography and formatting

STYLING IMPROVEMENTS:
- Increased font size for better readability (1.125rem)
- Added proper list styling with disc bullets and decimal numbers
- Blue colored bullet points that stand out
- Better spacing between elements (1.5rem margins)
- Improved blockquote styling with background
- Bolder strong text (700 weight)
- Better link hover states
- Added code and emphasis styling
- Proper line heights throughout
- Better heading hierarchy

Lists now show proper bullets/numbers and text is properly formatted with spacing.

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add markdown rendering for news posts
- Trigger rebuild to fetch news posts from Supabase
- Add getStaticPaths to news slug route for static builds
- Complete site redesign - cleaner UX and feature visibility

HOMEPAGE REDESIGN:
- Simplified from 5 cluttered sections to 3 focused sections
- Featured News section at top with latest posts + images
- Featured Timelapse with full-width purple gradient banner
- Removed busy 10-item navigation grid
- Created clean 2x2 essential resources grid (Prevention, Emergency, Banks, Networks)
- Added quick stats strip (4 key numbers)
- Moved secondary content to /resources page
- Hero with 2 clear CTAs: Protect or Emergency

STATISTICS PAGE UPGRADE:
- Large gradient hero cards for key metrics (red/orange/blue/purple)
- Enhanced hotspot visualization with numbered rankings + descriptions
- Improved time-of-day analysis with risk labels + context
- Added 'Why these numbers matter' and 'What you can do' sections
- Better visual hierarchy with larger text and progress bars
- Featured timelapse CTA banner for engagement
- Source citations on all data points

IMPROVEMENTS:
✅ News and Timelapse now prominently featured (not buried)
✅ Cleaner, more focused user experience
✅ Better visual design with gradients, shadows, hover effects
✅ Easier navigation and decision-making
✅ Reduced cognitive load - less is more
✅ Mobile-responsive enhancements
✅ Clear visual hierarchy throughout

BACKUPS:
- Old files saved as index-old-backup.astro and statistics-old-backup.astro

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Trigger Netlify redeploy - all pages committed
- Complete all missing pages - site fully functional

PAGES CREATED:
✅ /banks - UK bank directory with emergency contacts & search
✅ /mobile-providers - Mobile network directory with search & filters
✅ /statistics - Theft statistics & hotspots visualization
✅ /about-us - Mission, values, and what we offer
✅ /contact-us - Contact form with quick links
✅ /security-checkup - Interactive checkup (coming soon placeholder)
✅ /community-experiences - Community stories (coming soon)
✅ /report-experience - Submit experience form
✅ /resources - Central hub linking to all resources
✅ /privacy-policy - Privacy policy page
✅ /terms-of-service - Terms of service page
✅ /news/[slug] - Dynamic news post detail page

DATA FILES:
✅ Copied banks.ts (16KB, ~25 UK banks)
✅ Copied mobileProviders.ts (10KB, ~50 providers)
✅ Copied statistics.ts (theft data)

FEATURES:
✅ Search functionality on banks & providers pages
✅ Network filter tabs on mobile providers
✅ Responsive design on all pages
✅ Proper SEO meta tags
✅ Consistent styling with existing pages
✅ Working navigation throughout site

ALL ROUTES NOW WORKING:
✅ All footer links functional
✅ All homepage navigation functional
✅ All header links functional
✅ No more broken routes

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add sample news post SQL for testing
- Add missing pages and new features

PAGES CREATED:
- /prevention - Security guides with IMEI download tool (no storage)
- /emergency - Emergency response checklist
- /news - News feed with Substack-style design (NEW FEATURE)
- /timelapse - Theft hotspots visualization (NEW FEATURE - coming soon)

HOMEPAGE UPDATES:
- Added News and Timelapse to navigation
- Updated featured cards with new features
- Changed IMEI from 'storage' to 'download template'

FEATURES:
- News/blog system ready for content
- Timelapse placeholder with admin data request tool link
- IMEI tool prompts users to save locally (privacy-first)

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Remove platform-specific dependencies for Netlify build
- Fix SQL schema: remove database ALTER command

- Removed ALTER DATABASE command (not allowed in Supabase)
- Supabase handles JWT secrets automatically

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Major update: Remove IMEI storage, add News/Blog and Timelapse features

BREAKING CHANGES:
- Removed IMEI records storage (users save locally instead)
- Removed all IMEI-related functions from Supabase helpers

NEW FEATURES:
- News/Blog system with Substack-like feel
  - Category support (arrest, seizure, law_change, statistics, etc.)
  - Draft/publish workflow for admin approval
  - Source attribution with links
- Theft data timelapse (like govspendbase.uk)
  - Store theft data points with location and date
  - Visualize on interactive map over time
- Met Police data request tracking
  - Admin tool to manage FOI requests
  - Track status and responses

DATABASE CHANGES:
- Added news_posts table with RLS policies
- Added theft_data_points table for timelapse data
- Added met_police_requests table for admin tracking
- Updated indexes and permissions

DOCUMENTATION:
- Added n8n workflow guide for automated news discovery
- Documented AI-powered content generation
- Included setup instructions and examples

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add comments about reserved keyword column names
- Fix SQL reserved keywords in schema

- Escape 'when' and 'where' column names with quotes
- These are SQL reserved keywords and need quoting

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Switch to Supabase backend

- Installed Supabase JS client
- Created complete database schema with RLS policies
- Added Supabase helper functions for all CRUD operations
- Updated environment variables for Supabase
- Removed PocketBase dependencies
- Ready for Netlify deployment

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Switch to PocketBase backend

- Installed PocketBase JavaScript SDK
- Created PocketBase client and helper functions
- Updated API URL configuration for PocketBase
- All CRUD operations now use PocketBase SDK

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>
- Add comprehensive deployment guide
- Initial Astro frontend setup

- Created Astro project with React integration
- Configured Tailwind CSS v3
- Set up shadcn/ui components
- Created homepage with full content
- Added Header and Footer components
- Configured path aliases and environment variables

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>

### Chores

- Update fallow regression baseline [skip ci]
- Migrate to pnpm v11
- Remove Google Analytics, simplify cookie notice
- Remove unused @astrojs/cloudflare devDependency
- Remove Sentry in favour of Cloudflare built-in logging
- Update bun.lock with @tailwindcss/typography
- Fix npm vulnerabilities [skip ci]
- Add git-cliff config for changelog generation
- Add git-cliff config for changelog generation
- Add git-cliff config for changelog generation
- Change news fetch schedule to once daily at 8am UTC
- Switch from bun to npm for build reliability
- Add git hooks for pre-push type checking
- Bump esbuild dev-dependencies and remove unused code

### Documentation

- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Add UI/UX review documentation and misc updates

### Features

- Drop redundant Google News smartphone feed to cut duplicate ingestion
- Dedup near-duplicate news from different outlets
- Migrate from Netlify to Cloudflare Pages
- Redesign news listing page with typography-first image-optional layout
- Final design system refinements and theme toggle
- Shadow elevation, borders, icons, dark mode prep, print styles
- Adopt Google design.md spec and semantic design tokens
- Theft map, journalist outreach templates, admin approval workflow
- **cron**: Automated directory discovery for banks and mobile providers
- UI/UX improvements, 2025 data integration, news deduplication, and community CTAs
- Sync homepage stats with statistics page data
- Redesign statistics dashboard with multi-chart visualizations and backfill 2024 police.uk data
- Seo schema, news scraping, and ux improvements
- Add breadcrumbs and theft trends chart to all pages
- Add site search, theft trends chart, skeleton UI, and UX improvements
- Add analytics tracking for user engagement
- Add SEO improvements, security fix, and admin enhancements
- Timelapse redesign - CRITICAL security fix + enhanced analytics
- Community analytics voting system - anonymous theft insights
- Timelapse UI/UX improvements - Phase 1 accessibility & mobile
- Comprehensive UI/UX improvements across all pages

### Performance

- **news**: Further optimize scraper to avoid Netlify timeouts
- Comprehensive performance, SEO, and code quality improvements

### Refactoring

- Make titlesAreSimilar internal to dedup.ts
- Fallow cleanup, complexity reduction, and CI integration
- Complete semantic token migration and design system docs

### Reverts

- Restore Netlify adapter and scheduled functions

### Security

- /about rename, consistent cards, first-person terms
- Pin vite ^8.2.2 to match Astro 7 requirement
- Enforce the editorial system across every page


