# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Vitest unit testing: `vitest`, `@vitest/coverage-v8`, `jsdom`, and Testing
  Library devDependencies, `vitest.config.mjs` (jsdom, `@` alias, v8 coverage
  for `frontend/`), and `frontend/test/setup.ts` (jest-dom matchers, automatic
  cleanup after each test).
- `yarn test`, `yarn test:watch`, and `yarn test:coverage` scripts, plus the
  first component test: `frontend/components/counter` (100% covered).
- `frontend/vite-env.d.ts`: Vite client types and a `*.scss` module declaration
  for typed Sass imports.
- `@types/node` devDependency, matching `"engines"` and `.nvmrc`.
- `tsconfig.json`: `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `exactOptionalPropertyTypes`, `noUnusedLocals`/`noUnusedParameters`,
  `verbatimModuleSyntax`, ES2022 target/lib, and `@/*` path alias resolving to
  `frontend/*`.
- `tsconfig.node.json`: `checkJs: true` with strict flags, so JS config files
  and scripts are type-checked too.
- `.github/workflows/ci.yml`: `workflow_dispatch` trigger for manual re-runs;
  uploads `dist/` as a debug artifact when `build:verify` fails.
- `.github/CODEOWNERS`: `@jpachecox` as owner of the whole repo.
- `.husky/commit-msg` + `commitlint.config.js`: enforces Conventional
  Commits locally via `@commitlint/cli`/`@commitlint/config-conventional`.
- `"engines": { "node": ">=24.16.0" }` in `package.json`, matching `.nvmrc`.
- `check:sass`/`check:entrypoints` now run with
  `--experimental-test-coverage`, printing a coverage summary.
- `CLAUDE.md`: documents Dependabot (not Renovate) as the single
  version-update tool, and notes CI failure notifications are not yet
  configured.
- `.github/workflows/ci.yml`: `actionlint` job validating workflow files;
  Yarn dependency caching and an ESLint/Stylelint cache on `build-and-verify`;
  `permissions: contents: read` and `timeout-minutes` on every job.
- `.github/workflows/release-please.yml`, `release-please-config.json`,
  `.release-please-manifest.json`: automated version bump, `CHANGELOG.md`
  update, and GitHub release/tag from conventional commits merged to `main`.
- `DEPLOYMENT.md`: documents the `develop`=QA / `main`=production branch
  convention and the rollback procedure (Shopify admin republish,
  `shopify theme pull`/`push`, and `git revert`).
- `yarn check:sass` script: compiles Sass fixtures to validate function and mixin
  arguments (`utils/sass-validation.test.mjs`).
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
- README badges: `JavaScript`, `CI`, and `Tests`; both are dynamic and
  reflect the real workflow status.
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

- `eslint.config.js` split into JS and TS scopes: TypeScript files now run
  type-aware rules (`recommended-type-checked`) against the two tsconfig
  projects; `.js`/`.mjs` files use the espree parser with core recommended
  rules (they were previously excluded by the TS-parser glob).
- Lint-driven cleanup in `utils/sass-validation.test.mjs`: unused `node:test`
  callback params and `css` destructures removed; import order fixed.
- `utils/entrypoints.mjs` migrated to TypeScript (`utils/entrypoints.ts`) with a
  branded `EntrypointName` type; same public API and behavior.
- `vite.config.js`: added the `@` → `frontend/` alias; removed
  `api: 'modern-compiler'` (removed in Vite 8) and the `removeViewBox` SVGO
  entry (`active: false` is ignored by SVGO v4, so the plugin was silently
  active).
- 57 `checkJs` type errors fixed via JSDoc across `eslint.config.js`,
  `utils/tools.mjs`, `utils/*.test.mjs`, and `scripts/verify-assets.mjs`.
- `.github/workflows/ci.yml`: added a "Component tests (Vitest)" step; README
  commands table gained the `test`/`test:watch`/`test:coverage` rows.
- `.yarnrc.yml`: `npmMinimalAgeGate` raised from `0` to `1` (rejects
  packages published in the last 24h); `approvedGitRepositories` restricted
  from `"**"` to an explicit (currently empty) allowlist.

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

- Type-checking was a no-op for JavaScript files (`checkJs` was off in
  `tsconfig.node.json`), so configs, utils, and tests were never type-checked.
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
