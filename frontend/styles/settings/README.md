# `settings/`

ITCSS "settings" layer. It holds design tokens and emits shared custom
properties under `@layer settings`; it does not style application elements.

| File                | Holds                                                                                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_breakpoints.scss` | `$breakpoints` map (`sm`/`md`/`lg`/`xl`), consumed by `tools/_mixins.scss`'s `respond-to()` family.                                                                                                         |
| `_colors.scss`      | Grayscale scale (`$gray-values`, aliased as `$gray-light`) and alpha constants (`$alpha-link`, etc.) — the only color-related values that genuinely belong in Sass. See "Colors" below for everything else. |
| `_elevation.scss`   | `$elevation` box-shadow tokens (`fn.elevation('2')` / `mix.elevation-shadow('2', $color)`), `$elevation-offset`, and `$elevation-opacity` maps.                                                             |
| `_opacity.scss`     | Core `$opacity` scale tokens (0 to 100), consumed by `utilities/_opacities.scss`.                                                                                                                           |
| `_radius.scss`      | `$radius` border-radius tokens, consumed via `mix.radius()` / `mix.radius-corners()` / `mix.radius-top()` / `mix.radius-bottom()` in `tools/_mixins.scss`.                                                  |
| `_spacing.scss`     | `$spacing` scale, consumed via `fn.spacing('key')`.                                                                                                                                                         |
| `_tokens.scss`      | Emits shared custom properties in `@layer settings`: alpha, image outline, shadow-border, font-weight scale, and grayscale fallback.                                                                        |
| `_typography.scss`  | Modular type scale, `$font-size`/`$line-height`/`$letter-spacing`/`$font-style`/generic `$font-weight` maps. Does **not** hold body/heading font family, style, or scale — see "Typography" below.          |

## Editable token flow

Merchant-editable values are never hard-coded or re-derived in Sass. They
flow through three stages, re-rendered on every request so Theme Editor
changes apply without a Sass rebuild:

1. `config/settings_schema.json` — defines the merchant-facing settings
   (e.g. the `color_schemes` picker and its scheme settings).
2. `layout/theme.liquid` — the stock Dawn `{% style %}` block bridges
   `settings.color_schemes` into CSS custom properties, once per
   `.color-{{ scheme.id }}` block plus a `:root` default from the first scheme.
3. Sass — consumes those custom properties via `var()`, never defines them.

Concrete example (real consumption sites in this repo):

```scss
// settings_schema.json -> layout/theme.liquid {% style %}, per scheme
.color-scheme-1 {
  --color-background: {{ scheme.settings.background }};
  --color-shadow: {{ scheme.settings.shadow }};
}

// Sass consumption — settings/_elevation.scss
'1': (0 1px 2px -1px rgba(var(--color-shadow, 0 0 0), 0.1), ...);

// Sass consumption — settings/_tokens.scss
--focus-ring-color: var(--color-link, oklch(50% 0.2 250deg));
```

The `var()` fallbacks (`0 0 0`, `oklch(50% 0.2 250deg)`) are compile-time
defaults used only when the runtime bridge is missing; they are not values
the merchant edits.

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
