# `frontend/styles/`

Sass source is organized with ITCSS, BEM-style component names, and native CSS
layers. The layer declaration is loaded first by `frontend/entrypoints/base.scss`:

```scss
@layer settings, generic, elements, objects, components, sections, snippets, utilities;
```

| Folder       | Layer        | Purpose                                                  |
| ------------ | ------------ | -------------------------------------------------------- |
| `settings/`  | `settings`   | Sass maps and emitted custom-property tokens.            |
| `tools/`     | —            | Functions and mixins; never emits CSS by itself.         |
| `generic/`   | `generic`    | Reset and document-wide defaults.                        |
| `elements/`  | `elements`   | Bare HTML element styles.                                |
| `objects/`   | `objects`    | Skinless layout primitives with the `o-` prefix.         |
| `component/` | `components` | Optional component styles (SCSS only, empty by default). |
| `section/`   | `sections`   | Optional section styles (SCSS only, empty by default).   |
| `snippet/`   | `snippets`   | Optional snippet styles (SCSS only, empty by default).   |
| `utilities/` | `utilities`  | Single-purpose `u-` overrides.                           |

The `component/`, `section/`, and `snippet/` folders are **SCSS-only** — they
never hold `.liquid` files or other Shopify resources (those live in the
theme root). They exist so real themes can map their own styles; each partial
dropped here generates its entrypoint automatically.

## Naming and generated files

- Folders are singular: `component/`, `section/`, and `snippet/`.
- Entrypoint partials must use lowercase letters and hyphens only after their
  leading underscore: `_rich-text.scss`, never `_rich_text.scss` or `_rich-text-2.scss`.
- These three folders generate `component-*`, `section-*`, and `snippet-*`
  entrypoints automatically. All other folders are included by `base.scss`.
- Generated entrypoints and `vite-tag.liquid` must not be edited manually.

Merchant-controlled colors and fonts are runtime CSS custom properties. See
[settings/README.md](settings/README.md) for the Dawn color-scheme bridge.
