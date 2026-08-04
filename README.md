# Shopify Theme Vite

![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-8.1.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Sass](https://img.shields.io/badge/Sass-1.100-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![Shopify](https://img.shields.io/badge/Shopify-95BF47?style=for-the-badge&logo=shopify&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-grey?style=for-the-badge&logo=javascript&logoColor=white)
![CI](https://img.shields.io/github/actions/workflow/status/jpachecox/shopify-theme-vite/ci.yml?style=for-the-badge&label=CI)
![Tests](https://img.shields.io/github/actions/workflow/status/jpachecox/shopify-theme-vite/ci.yml?style=for-the-badge&label=Tests)
![GitHub repo size](https://img.shields.io/github/repo-size/jpachecox/shopify-theme-vite?style=for-the-badge)

Build tooling for Shopify themes using Vite, Sass, optional React, and a flat
`assets/` output compatible with Shopify's CDN.

## What it provides

- Sass compilation through `sass-embedded` and native CSS cascade layers.
- Flat, unhashed assets with Shopify version query parameters.
- Image, font, and SVG optimization.
- Automatic SCSS entrypoints for component, section, and snippet styles.
- A generated `snippets/vite-tag.liquid` that maps each entrypoint to its asset.
- ESLint, Stylelint, Prettier, TypeScript checks, and asset-name verification.

## Source layout

```text
frontend/
├── entrypoints/       # base.scss/base.jsx plus generated SCSS entrypoints
├── styles/
│   ├── component/     # reusable UI styles
│   ├── section/       # Shopify section styles
│   ├── snippet/       # Shopify snippet styles
│   └── …              # settings, tools, generic, elements, objects, utilities
├── images/
├── fonts/
└── svg/

assets/                # generated files published to Shopify
snippets/vite-tag.liquid # generated at build time
```

## Style entrypoints

Create a Sass partial under `frontend/styles/component/`, `section/`, or
`snippet/`. Partial names must use a leading Sass underscore followed by
lowercase kebab-case using letters only:

```text
_button-group.scss     # valid → component-button-group.scss
_rich-text.scss        # valid → section-rich-text.scss
_button_group.scss     # invalid
_button-group-2.scss   # invalid
```

The generator creates the matching entrypoint in `frontend/entrypoints/`.
Reference it from Liquid with the generated snippet:

```liquid
{% render 'vite-tag', entry: 'component-button.scss' %}
```

Do not edit generated entrypoints or `snippets/vite-tag.liquid` directly.

## Commands

| Command                  | Description                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `yarn dev`               | Runs Vite and Shopify CLI together.                                                     |
| `yarn dev:vite`          | Runs Vite only.                                                                         |
| `yarn build`             | Builds assets and regenerates `vite-tag.liquid`.                                        |
| `yarn build:verify`      | Builds and validates asset names and flat output.                                       |
| `yarn lint`              | Runs Stylelint and ESLint, including Node utilities, scripts, and ESLint configuration. |
| `yarn lint:fix`          | Applies available lint fixes.                                                           |
| `yarn format`            | Formats source, utility, root configuration, and documentation files.                   |
| `yarn check:types`       | Checks frontend and Node/Vite configuration types without emitting files.               |
| `yarn check:entrypoints` | Tests generated-entrypoint naming rules.                                                |
| `yarn check:sass`        | Compiles Sass fixtures to validate function and mixin arguments (27 tests).             |
| `yarn clean`             | Removes dependencies, build artifacts, and caches.                                      |
| `yarn clean:build`       | Removes build artifacts and Vite caches only.                                           |
| `yarn fresh`             | Cleans, installs, builds, and verifies.                                                 |

## CSS architecture

Styles follow ITCSS and use this layer order:

```scss
@layer settings, generic, elements, objects, components, sections, snippets, utilities;
```

The declaration is emitted first by `frontend/entrypoints/base.scss`. See
[frontend/styles/README.md](frontend/styles/README.md) for folder-specific
conventions and the merchant color-token bridge.

## Installation

Use the Yarn version pinned in `package.json`:

```bash
yarn install
yarn build:verify
```

To use `yarn dev`, authenticate Shopify CLI separately with `shopify theme login`.
