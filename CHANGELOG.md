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

### Changed

- `fn.map-get-strict()` error messages now include the available map keys.
- `fn.breakpoint()` reports the actual map name in errors when a custom map is
  passed.
- Validation error messages unified under a consistent
  `Invalid argument: '<name>' must be ...` format.
- `mix.hover-active-pressed()` / `mix.active-pressed()` accept an optional
  `$prefix` (defaults to `'btn'`, preserving the original `.btn--pressed`
  selector) and validate it.
- Mixins reuse `fn.assert-*` helpers for type and non-empty string checks.
- `tools/README.md` documents the validation behavior of accessors and mixins.
- Function and mixin doc comments translated to English.
- README badges (license, Vite, Sass, Shopify, repo size) and `yarn check:sass`
  entry added to the commands table.

### Fixed

- `fn.breakpoint()` no longer fails when called without an explicit map (build
  regression from strict validation).
- Assertion helpers interpolated the parameter name (`#{$name}`) correctly in
  error messages.
- `mix.radius()` error messages now use a consistent `radius():` prefix.
- Removed `@debug` output and duplicate map-key checks in `elevation-shadow`.
