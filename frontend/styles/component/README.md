# `component/`

ITCSS "components" layer. Reusable, styled UI pieces — BEM
(`block__element--modifier`), one file per component, unprefixed filename
(`_button.scss`, not `_component-button.scss` — the generator adds the
`component-` prefix automatically). Names use lowercase letters and hyphens
only after the leading underscore.

**SCSS only:** this folder never holds `.liquid` files or any other
Shopify-specific resource. Those live in the theme root (`snippets/`,
`sections/`, or within a `.liquid` schema block).

Currently empty — no components shipped in this repository's styles. This
folder exists so real Shopify projects can map their own component styles:
drop a `_name.scss` partial here and the auto-entrypoints generator emits
the matching `component-name.scss` entrypoint and compiled `component-name.css`
asset automatically.

## Conventions to follow when adding a component

- Always namespace function calls (`fn.spacing('2')`, `fn.radius('sm')`) —
  a bare `spacing('2')` compiles silently as invalid literal CSS instead of
  erroring, if the file doesn't `@use '../tools/functions' as fn;`.
- Color custom-property fallbacks must be comma-separated
  (`var(--color-link, 0, 91, 211)`), matching the triplet format
  `theme.liquid` actually emits — a space-separated fallback silently
  breaks the moment it's ever actually used.
- Every design-token value (radius, spacing, elevation) should come from
  `fn.*()`/`mix.*()`, never a hardcoded literal — `scale-unlimited/declaration-strict-value`
  in `.stylelintrc` enforces this for color/fill/stroke/z-index; apply the
  same discipline to radius/spacing by convention even where the linter
  doesn't check it yet.
