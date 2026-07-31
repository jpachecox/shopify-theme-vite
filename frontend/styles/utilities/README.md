# `utilities/`

ITCSS "utilities" layer — highest precedence on purpose. Single-purpose,
`u-` prefixed classes that override anything below them by design, without
ever needing `!important` (that's what `@layer utilities` is for).

All utilities in this layer are breakpoint-free to keep the bundle lean. They
consume Sass design-token maps and runtime custom properties where applicable.

| File               | Holds                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `_display.scss`    | `.u-d-*` — core display modes (`none`, `block`, `flex`, `grid`, etc.) and `.u-visually-hidden` accessibility helper.      |
| `_gaps.scss`       | `.u-gap-*`, `.u-gap-x-*`, `.u-gap-y-*` — flex/grid gap utilities generated from `$spacing`.                               |
| `_margins.scss`    | `.u-m*-*` — physical & logical margin utilities generated from `$spacing`.                                                |
| `_opacities.scss`  | `.u-opacity-*` — opacity scale utilities consuming `$opacity` design tokens (`--opacity-*`).                              |
| `_overflow.scss`   | `.u-overflow-*` — global, physical axes (`x`/`y`), and logical (`inline`/`block`) scroll container utilities.             |
| `_paddings.scss`   | `.u-p*-*` — physical & logical padding utilities generated from `$spacing` (includes optical `.u-p-*-reduce-*` variants). |
| `_text.scss`       | `.u-t-*` — logical alignment (`start`/`end`), physical fallbacks, and text truncation (`.u-text-truncate`).               |
| `_typography.scss` | Font sizing, weights, line-heights, tracking, transforms, decorations, text wrapping, and tabular numeric alignments.     |

## Don't add a monolithic `_utilities.scss`

An earlier version of this repo had a single `_utilities.scss` duplicating
everything now split across the files above — it was never actually
imported (dead weight, not a bug, but confusing) and was deleted. Keep new
utilities in the file matching their concern; don't reintroduce a catch-all.
