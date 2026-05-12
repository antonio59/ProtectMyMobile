# AGENTS (scripts)

## Package Identity
- Utility scripts (e.g., OG image conversion).

## Setup & Run
- Convert OG PNG: `node scripts/convert-og-image.mjs`
- Uses `@resvg/resvg-js`; ensure deps installed (`pnpm install`).

## Patterns & Conventions
- Keep scripts ESM (`type: module`).
- Write outputs to `public/` (e.g., `og-image.png`).

## Touch Points
- `scripts/convert-og-image.mjs`

## Pre-PR Checks
- If scripts changed: run the script you modified and verify output in `public/`.
