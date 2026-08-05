# `snippet/`

ITCSS "snippets" layer. One SCSS file per Shopify snippet that needs its own
scoped styling, matching a `snippets/*.liquid` file 1:1. Filenames use a
leading underscore plus lowercase letters and hyphens only.

**SCSS only:** this folder never holds `.liquid` files or any other
Shopify-specific resource. The snippet's `.liquid` lives in `snippets/` at
the theme root; only the optional stylesheet partial goes here.

Currently empty — no snippet has needed dedicated styles yet. Add a file
here only when a snippet's markup can't reasonably reuse an existing
`component/`/`object/` class.
