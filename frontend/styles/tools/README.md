# `tools/`

Pure Sass — functions and mixins only. **Never emits CSS on its own** (no
`@layer` blocks, no bare selectors). Not part of the ITCSS layer order for
that reason; every other folder `@use`s this one, never the other way
around.

| File              | Holds                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_functions.scss` | **Calculations & Accessors:** `fn.rem()`, `fn.strip-unit()`, `fn.map-get-strict()` (fails loud with `@error` on missing keys), `fn.breakpoint()`, `fn.spacing()`, `fn.radius()`, `fn.elevation()`, `fn.gray()` (compile-time fallback only), `fn.shadow-border()`, and `fn.font-stack()`.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `_mixins.scss`    | **Design Systems Helpers:** `mix.emit-type-scale-tokens()`, `mix.button-variant()`, `mix.respond-to()`, `mix.respond-below()`, `mix.respond-to-all()`, `mix.visually-hidden()`, `mix.visually-shown()`, `mix.truncate-lines()`, `mix.focus-outline()`, `mix.aspect-ratio()`, `mix.radius()` / `radius-corners()` / `radius-top()` / `radius-bottom()`, `mix.elevation()` / `elevation-shadow()`, `mix.shadow-border()`, `mix.shadow-transition()`, `mix.icon-padding-adjust()`, `mix.concentric-radius()`, `mix.font-face()`, `mix.input-placeholder()`, `mix.clearfix()`, `mix.transition()`, `mix.hover-active-pressed()`, `mix.active-pressed()`, `mix.retina()`, and `mix.spacing-utility()`. |

## Conventions

- Always use Dart Sass **module** functions (`map.get`, `math.percentage`,
  `meta.type-of`, `math.is-unitless`), never the deprecated globals
  (`map-get`, `percentage`, `type-of`, `unitless`). Stylelint's
  `scss/no-global-function-names` rule enforces this — do not disable it.
- Prefer `@if`/`@else` over the CSS-native `if()` function syntax for
  anything beyond a trivial one-liner; it is less portable across Sass
  versions and harder to read in a diff.
- New mixins should do one thing. If you find yourself reaching for optional
  parameters to drastically alter behavior, split the logic into focused,
  single-purpose mixins (e.g., `radius` vs `radius-corners`).
- Utility modules in this folder are checked by ESLint through `yarn lint`.
