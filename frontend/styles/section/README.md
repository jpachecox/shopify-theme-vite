# `section/`

ITCSS "sections" layer. One file per Shopify section, mirroring a
`sections/*.liquid` file 1:1 — an unprefixed lowercase kebab-case filename
(`_rich-text.scss`, matching `sections/rich-text.liquid`).

| File              | Section                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_rich-text.scss` | `.rich-text` — matches `sections/rich-text.liquid` from stock Dawn. Breakpoints intentionally use `mix.respond-to('sm')`/`respond-to('md')` (750px/990px) to match Dawn's actual compiled CSS for this section — double-check against real Dawn output if you ever add a new section, since it's easy to reach for `'md'`/`'lg'` (990px/1200px) by habit and end up one breakpoint off. |

Empty otherwise — sections get added here only as they're actually ported
from Dawn, not pre-scaffolded.
