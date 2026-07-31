# `elements/`

ITCSS "elements" layer. Styles bare HTML elements before any BEM class
takes over — the last layer allowed to select tags directly.

| File         | Holds                                                                                                                                                                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_base.scss` | `body`, `h1`–`h6` base typography. Reads `var(--font-body-family)` / `var(--font-heading-family)` etc. directly (with a plain `sans-serif` fallback) — never a compile-time Sass font variable, since those don't exist anymore (see `settings/README.md`). |

## Don't add a `_theme-tokens.scss` back here

An earlier version of this repo had `elements/_theme-tokens.scss` emitting
its own, out-of-sync copy of color custom properties, which silently
overrode the correct values from `settings/_tokens.scss`. It was deleted for
exactly that reason — token emission lives in the `settings` layer and
`theme.liquid` only. If you're tempted to add per-token overrides here,
put them in the token's actual source of truth instead.
