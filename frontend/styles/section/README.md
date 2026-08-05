# `section/`

ITCSS "sections" layer. One SCSS file per Shopify section, matching a
`sections/*.liquid` file 1:1 by name — an unprefixed lowercase kebab-case
filename (`_rich-text.scss`, matching `sections/rich-text.liquid`).

**SCSS only:** this folder never holds `.liquid` files or any other
Shopify-specific resource. The section's `.liquid` lives in `sections/` at
the theme root; only the optional stylesheet partial goes here.

Currently empty — no sections shipped in this repository's styles. This
folder exists so real Shopify projects can map their own section styles:
drop a `_name.scss` partial here and the auto-entrypoints generator emits
the matching `section-name.scss` entrypoint and compiled `section-name.css`
asset automatically.

## Convention to follow when adding a section

- Match Dawn's actual breakpoints when porting a stock section. Dawn's
  `rich-text` uses `mix.respond-to('sm')`/`respond-to('md')` (750px/990px),
  not `'md'`/`'lg'` (990px/1200px) — double-check against real Dawn output,
  since it's easy to reach for the larger breakpoints by habit and end up
  one breakpoint off.
