## Summary

<!-- Briefly describe what changed and why. -->

## Testing

- [ ] `pnpm run check`
- [ ] `pnpm run build`
- [ ] `pnpm run design:lint` (if `DESIGN.md` or design tokens changed)
- [ ] `pnpm run lint:css` (if CSS files changed)

## Release checklist

- [ ] User-facing change? Bump `version` in `package.json` (new feature: minor; fix only: patch).
- [ ] Added a `## [x.y.z] - YYYY-MM-DD` section under `## Release notes` in `cliff.toml` (do not hand-edit `CHANGELOG.md`; git-cliff regenerates it on push to `main`).
- [ ] Updated `README.md` / docs if what users see has changed.
- [ ] Not user-facing (CI, tests, refactor only), so no version bump needed.
