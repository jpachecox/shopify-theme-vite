# `objects/`

ITCSS "objects" layer (OOCSS). Reusable layout patterns with no visual
skin — no color, no typography, no shadows. `o-` prefix distinguishes
these from BEM components.

| File              | Holds                                                                                                                                                                                                                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_container.scss` | `.o-container` — width-constrained wrapper with `--narrow`/`--wide`/`--flush` variants. Falls back to inline defaults if `--page-width` isn't declared (Dawn only provides `--page-width`, not per-variant widths — the narrow/wide fallbacks are this repo's own compile-time values, not Theme Editor-controlled). |
| `_flex.scss`      | `.o-flex` — flexbox utility object with responsive `\@sm`/`\@md`/`\@lg`/`\@xl` breakpoint-suffixed modifiers.                                                                                                                                                                                                        |
| `_grid.scss`      | `.o-grid` — CSS grid object, same breakpoint-suffix pattern as `_flex.scss`.                                                                                                                                                                                                                                         |

## The `\@breakpoint` suffix pattern

Both `_flex.scss` and `_grid.scss` generate classes like
`.o-grid--cols-3\@md` by looping `map.keys($breakpoints)` manually and
appending `\@#{$bp}` inside each `@include mix.respond-to($bp) { ... }`
block. Do **not** use `mix.respond-to-all()` for this — it wraps the same
content in every breakpoint's media query without changing the selector,
so it can't produce distinct per-breakpoint variant classes (this was a
real bug here once; see git history if you want the before/after).
