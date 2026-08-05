# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-08-05

### Removed

- Removed the bundled component and section stylesheets
  (`frontend/styles/component/_*.scss`, `frontend/styles/section/_rich-text.scss`)
  and their generated entrypoints/compiled assets (`component-*.scss`/`.css`,
  `section-rich-text.css`). The `component/`, `section/`, and `snippet/` folders
  stay as SCSS-only mapping targets for real Shopify themes (no `.liquid`
  files inside them).
- Removed the release-please automation (`.github/workflows/release-please.yml`,
  `release-please-config.json`, `.release-please-manifest.json`): releases are
  now created manually (tag + GitHub release) for full control of each version.

### Added

- `secrets-scan` job in `.github/workflows/ci.yml` running
  `gitleaks/gitleaks-action` (v3.0.0, pinned by SHA) — fails the build on any
  detected leak; PR commenting and SARIF artifact upload disabled; scans the
  full history via `fetch-depth: 0` and authenticates with `GITHUB_TOKEN`
  (`pull-requests: read`).
- `mix.visually-hidden()` now also sets `clip-path: inset(50%)` (keeping
  `clip: rect()` as legacy fallback) and `mix.visually-shown()` resets with
  `clip-path: none`.
- `component/`, `section/`, and `snippet/` READMEs rewritten to document the
  folders as SCSS-only mapping targets (empty by default, never hold `.liquid`
  files); `frontend/styles/README.md` table updated to match.
- `.github/workflows/ci.yml`: `workflow_dispatch` trigger for manual re-runs;
  uploads `dist/` as a debug artifact when `build:verify` fails.
- `.github/CODEOWNERS`: `@jpachecox` as owner of the whole repo.
- `.husky/commit-msg` + `commitlint.config.js`: enforces Conventional
  Commits locally via `@commitlint/cli`/`@commitlint/config-conventional`.
- `"engines": { "node": ">=24.16.0" }` in `package.json`, matching `.nvmrc`.
- `CLAUDE.md`: documents Dependabot (not Renovate) as the single
  version-update tool, and notes CI failure notifications are not yet
  configured.
- `.github/workflows/ci.yml`: `actionlint` job validating workflow files;
  Yarn dependency caching and an ESLint/Stylelint cache on `build-and-verify`;
  `permissions: contents: read` and `timeout-minutes` on every job.
- `DEPLOYMENT.md`: documents the `develop`=QA / `main`=production branch
  convention and the rollback procedure (Shopify admin republish,
  `shopify theme pull`/`push`, and `git revert`).
- `yarn check:sass` script: compiles Sass fixtures to validate function and mixin
  arguments (`utils/sass-validation.test.ts`).
- Strict token accessors: `fn.radius()`, `fn.breakpoint()`, `fn.spacing()`,
  `fn.elevation()` now fail the build with `@error` on unknown tokens, listing
  the available keys.
- `fn.shadow-border()` rejects unsupported states.
- Validation helpers in `tools/_functions.scss`: `assert-type`,
  `assert-in-list`, `assert-positive-integer`, `assert-unitless-positive`,
  `assert-non-negative`, `assert-non-empty-string`, `assert-string`.
- Validation tests covering token accessors, public mixins (`radius`,
  `radius-corners`, `elevation`, `elevation-shadow`, `respond-to`,
  `respond-below`, `shadow-border`, `emit-type-scale-tokens`, `button-variant`),
  and restored utilities (`rem`, `strip-unit`, `gray`, `font-stack`).
- README badges: `TypeScript`, `Vitest`, `React`, `CI`, and `Tests`; the
  workflow badges are dynamic and reflect the real status.
- `.github/workflows/ci.yml`: runs `lint`, `check:sass`, `check:types`, and
  `build:verify` on pull requests and pushes to `main`/`develop`.
- `.github/workflows/ci.yml`: `yarn audit` step (fails on moderate+ severity
  advisories) and a `theme-check` job running `Shopify/theme-check-action`.
- `.github/workflows/deploy.yml`: manual (`workflow_dispatch`) deploy
  scaffold for `development`/`production` environments. The actual
  `shopify theme push` step is commented out pending store/theme
  provisioning; see the workflow's header comment for required secrets.
- `.github/dependabot.yml`: weekly grouped version updates for `npm` and
  `github-actions` ecosystems.
- `yarn check:theme` and `yarn audit` scripts.
- `settings/README.md` documents the end-to-end editable-token flow:
  `config/settings_schema.json` → `layout/theme.liquid` `{% style %}` → CSS
  custom properties → Sass `var()` consumption, with a concrete example.
- One-line README references added to `settings/_elevation.scss`
  (merchant-editable `--color-shadow`) and `settings/_tokens.scss`
  (`--color-link` fallback).
- Test coverage for `fn.breakpoint()` with custom maps (valid, unknown key,
  and empty map) and for non-string `elevation-shadow()` levels; error
  assertions decoupled from token-map contents so adding a token no longer
  breaks tests.

### Changed

- **Consolidated all tests onto Vitest.** `check:sass` and
  `check:entrypoints` now run via `vitest run <file>` instead of
  `node --test`; `utils/sass-validation.test.ts` and
  `utils/entrypoints.test.ts` were rewritten from `node:assert` to
  Vitest's `expect(...)` API. `vitest.config.mjs` now defaults the test
  environment to plain `node`, with `jsdom` opted into per file via a
  `// @vitest-environment jsdom` docblock (`environmentMatchGlobs` was
  removed in Vitest 4) — instead of running everything under `jsdom`. No
  `node --test` usage remains anywhere in the project. Documented in
  `CLAUDE.md` under "Testing".
- `.yarnrc.yml`: `npmMinimalAgeGate` raised from `0` to `1` (rejects
  packages published in the last 24h); `approvedGitRepositories` restricted
  from `"**"` to an explicit (currently empty) allowlist.
- `$gray-light` (`settings/_colors.scss`) is now an alias of
  `$gray-values` — the 11-step grayscale scale has a single source of truth
  (moved from `settings/_tokens.scss`) instead of two copied maps.
- `[data-theme='dark']` (`settings/_tokens.scss`) now sets
  `color-scheme: dark` so native controls (scrollbars, inputs, selects)
  follow the theme instead of staying in light mode.
- README: Vite badge updated to the installed version (8.2.0), entrypoint
  reference corrected (`base.mts`, not `base.jsx`), and the `yarn test`
  family descriptions now reflect the full Vitest suite (35 tests) rather
  than React components only.

- `fn.map-get-strict()` error messages now include the available map keys.
- `fn.breakpoint()` reports the actual map name in errors when a custom map is
  passed, and falls back to the global map only for `null` — an explicitly
  passed empty map now errors instead of silently falling back.
- `fn.assert-in-list()` and `fn.assert-positive-integer()` accept an optional
  `$message` override; `font-face()` and `spacing-utility()` now reuse the
  helpers instead of duplicating their validation inline.
- Validation helpers share a consistent `Invalid argument: '<name>' must be ...`
  error format; mixin-level errors keep a `mixin(): '<param>' ...` prefix.
- `mix.hover-active-pressed()` / `mix.active-pressed()` accept an optional
  `$prefix` (defaults to `'btn'`, preserving the original `.btn--pressed`
  selector) and validate it.
- `elevation-shadow()` errors now list the available elevation levels, replacing
  the generic unknown-level message, and collapse the type/missing-key checks
  into a single condition.
- `radius()`, `elevation-shadow()`, and `icon-padding-adjust()` error messages
  now interpolate the offending token value instead of printing the literal
  parameter name.
- `fn.token-get()` delegates map/key validation to `map-get-strict()`, so its
  errors are consistent with the other accessors and list available keys.
- `fn.shadow-border()` reuses `assert-in-list()` (same error message as before).
- `fn.breakpoint()` reports an explicitly passed empty map clearly instead of
  the generic `got list` error from `map-get-strict()`.
- `tools/README.md` documents the validation behavior of accessors and mixins.
- Function and mixin doc comments translated to English.
- README badges restyled with `style=for-the-badge`; `yarn check:sass` entry
  added to the commands table.
- Removed the static `Build: passing` README badge, now redundant with the
  real `CI`/`Tests` status badges.

### Docs

- Added `.github/PULL_REQUEST_TEMPLATE.md`: structured PR template (description,
  changes sections, verification checklist) with `Closes #` linking guidance.
- Added `CLAUDE.md` with PR conventions (template usage, one-line change
  bullets, issue-linking notes).
- Added `.github/ISSUE_TEMPLATE/` with three issue templates: `bug_report.md`
  (labels `bug`), `feature_request.md` (labels `enhancement`), and `task.md`
  (labels `chore`), each with scope, tasks, and acceptance criteria sections.
- `.gitignore`/`.prettierignore` now exclude the whole `.claude/` directory
  instead of only `settings.local.json`/`worktrees/`.

### Fixed

- `component/_link.scss`: removed a self-referencing
  `--link-underline-offset` custom property (guaranteed-invalid; the
  underline offset silently fell back to `auto`). The value now comes from
  the global token in `settings/_tokens.scss`.
- Focus rings (`mix.focus-outline()` and the global `:focus-visible`) now
  use `--focus-ring-color` instead of the undefined `--color-focus` token.
- `fn.rem()` now rejects values with non-px units (`1em`/`2vh`) that were
  silently treated as pixels.
- `respond-below()` now rejects unitless or non-px breakpoints with a clear
  message instead of a confusing arithmetic compile error.
- `CLAUDE.md`: removed a duplicated "PR titles" bullet under PR Conventions.
- `fn.breakpoint()` no longer fails when called without an explicit map (build
  regression from strict validation).
- Assertion helpers interpolated the parameter name (`#{$name}`) correctly in
  error messages.
- `mix.radius()` error messages now use a consistent `radius():` prefix.
- `mix.transition()` now requires a time unit (`s`/`ms`) for `$duration`,
  rejecting unitless zero and other units that produce invalid CSS.
- `mix.transition()` test coverage now exercises every validation branch
  (non-numeric, negative, unitless-zero, and wrong-unit durations, plus
  invalid property/easing).
- `fn.token-get()` validates the optional `$type` argument itself, replacing
  the previous confusing `must be a 123` error with a clear type error.
- `fn.token-get()` no longer silently skips type validation for falsy `$type`
  values (`''`/`false`).
- `mix.elevation-shadow()` rejects an empty `$color` string, which previously
  compiled to invalid `rgba()` CSS.
- `snippets/` is now tracked with a `.gitkeep` placeholder — a fresh clone was
  missing the directory entirely, causing `vite build` to fail with `ENOENT`
  when `vite-plugin-shopify` tried to write `vite-tag.liquid` (surfaced by
  the new CI workflow).
