# `settings/`

ITCSS "settings" layer. It holds design tokens and emits shared custom
properties under `@layer settings`; it does not style application elements.

| File                | Holds                                                                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_breakpoints.scss` | `$breakpoints` map (`sm`/`md`/`lg`/`xl`), consumed by `tools/_mixins.scss`'s `respond-to()` family.                                                                                                |
| `_colors.scss`      | Grayscale scale (`$gray-light`) and alpha constants (`$alpha-link`, etc.) — the only color-related values that genuinely belong in Sass. See "Colors" below for everything else.                   |
| `_elevation.scss`   | `$elevation` box-shadow tokens (`fn.elevation('2')` / `mix.elevation-shadow('2', $color)`), `$elevation-offset`, and `$elevation-opacity` maps.                                                    |
| `_opacity.scss`     | Core `$opacity` scale tokens (0 to 100), consumed by `utilities/_opacities.scss` and component design tokens.                                                                                      |
| `_radius.scss`      | `$radius` border-radius tokens, consumed via `mix.radius()` / `mix.radius-corners()` / `mix.radius-top()` / `mix.radius-bottom()` in `tools/_mixins.scss`.                                         |
| `_spacing.scss`     | `$spacing` scale, consumed via `fn.spacing('key')`.                                                                                                                                                |
| `_tokens.scss`      | Emits shared custom properties in `@layer settings`: alpha, image outline, shadow-border, font-weight scale, and grayscale fallback.                                                               |
| `_typography.scss`  | Modular type scale, `$font-size`/`$line-height`/`$letter-spacing`/`$font-style`/generic `$font-weight` maps. Does **not** hold body/heading font family, style, or scale — see "Typography" below. |

## Colors

There is no `_color-scheme.scss` / `$color-schemes` map in this folder, and
that's intentional, not an oversight.

**Why:** Vite compiles Sass ahead-of-time, once, at build time. A merchant
changing a color in the Theme Editor can't trigger a rebuild — so any color
value baked into compiled Sass would silently go stale the moment the
merchant touches the color picker.

**Where the values actually come from:** `layout/theme.liquid` (stock Dawn,
unmodified) already bridges `settings.color_schemes` into CSS custom
properties, inline in `<head>`, re-rendered on every request. Nothing in
this repo needs to duplicate that.

**Selector convention** (set by Dawn, not by this repo): a **class** per
scheme, `.color-{{ scheme.id }}` (e.g. `.color-scheme-1`) — not a
`[data-*]` attribute. Dawn's own sections/blocks already output this class
via their `color_scheme` setting.

**Custom properties you can assume exist at runtime**, once per
`.color-{{ scheme.id }}` block plus a `:root` default from the first scheme:

```scss
--color-background            --color-button
--color-foreground             --color-button-text
--color-background-contrast    --color-secondary-button
--color-shadow                 --color-secondary-button-text
--gradient-background          --color-link
--color-badge-foreground       --color-badge-background
--color-badge-border           --payment-terms-background-color
```
