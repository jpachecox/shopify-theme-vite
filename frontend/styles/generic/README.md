# `generic/`

ITCSS "generic" layer. First layer allowed to emit real CSS. Global,
un-opinionated, resets browser defaults — no BEM, no classes.

| File                | Holds                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_layer-order.scss` | The single `@layer settings, generic, elements, objects, components, sections, snippets, utilities;` declaration. It is loaded first by `frontend/entrypoints/base.scss`. |
| `_reset.scss`       | Browser reset: box-sizing, margin/padding zeroing, `prefers-reduced-motion`/`prefers-contrast` handling.                                                                  |

## The one `!important` in the whole codebase

`_reset.scss`'s `prefers-reduced-motion` block uses `!important` on purpose,
wrapped in a `stylelint-disable`/`stylelint-enable` pair with an inline
justification: it has to override any animation/transition declared
anywhere else, regardless of specificity or source order, so a user's
reduced-motion preference is never silently ignored. Don't add more
`!important` elsewhere — `@layer` exists specifically so you never need to.

## Type selectors are allowed here

Unlike every other layer, `generic/` (and `elements/`) is allowed to select
bare HTML tags (`*`, `html`, `body`). That's the whole point of these two
layers — see `frontend/styles/README.md`.
