# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
- README badges: `JavaScript`, `Build` (`build-passing`), `CI`, and `Tests`;
  the `CI`/`Tests` badges are dynamic and will show their status once
  `.github/workflows/ci.yml` exists.
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

### Fixed

- `fn.breakpoint()` no longer fails when called without an explicit map (build
  regression from strict validation).
- Assertion helpers interpolated the parameter name (`#{$name}`) correctly in
  error messages.
- `mix.radius()` error messages now use a consistent `radius():` prefix.
- `mix.transition()` now requires a time unit (`s`/`ms`) for `$duration`,
  rejecting unitless zero and other units that produce invalid CSS.
- `fn.token-get()` validates the optional `$type` argument itself, replacing
  the previous confusing `must be a 123` error with a clear type error.
- `fn.token-get()` no longer silently skips type validation for falsy `$type`
  values (`''`/`false`).
- `mix.elevation-shadow()` rejects an empty `$color` string, which previously
  compiled to invalid `rgba()` CSS.
