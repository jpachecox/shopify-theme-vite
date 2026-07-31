# `component/`

ITCSS "components" layer. Reusable, styled UI pieces — BEM
(`block__element--modifier`), one file per component, unprefixed filename
(`_button.scss`, not `_component-button.scss` — the generator adds the
`component-` prefix automatically). Names use lowercase letters and hyphens
only after the leading underscore.

| File                 | Component                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `_accordion.scss`    | `.accordion` — `<details>`/`<summary>`-based disclosure.                                                                                               |
| `_button.scss`       | `.button` — base button layout, focus state, disabled state, icon alignment, and full-width modifier.                                                  |
| `_button-group.scss` | Reserved stylesheet entrypoint for grouped-button styles.                                                                                              |
| `_card.scss`         | `.card` — base card block.                                                                                                                             |
| `_link.scss`         | `.link` — inline link with icon support, size (`--sm`/`--md`/`--lg`) and tone (`--destructive`) modifiers. Uses `--_link-*` private custom properties. |

## Conventions worth keeping consistent

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
