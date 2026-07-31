# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in the Shopify Theme Vite repository.

## Project Overview

This is a modern build layer for Shopify themes that enhances the asset pipeline (JS/CSS/images/fonts) for production while maintaining compatibility with Shopify's requirements. The tooling focuses exclusively on enhancing the build process—it does not alter theme design, functionality, or existing code.

## Architecture Overview

### ITCSS Architecture

The project follows ITCSS (Inverted Triangle CSS) methodology with BEM naming and CSS `@layer` for precise cascade control:

```text
settings/        → Design tokens (colors, typography, spacing, etc.) - Sass only
tools/           → Functions & mixins (no direct CSS output)
generic/         → Global resets/baseline styles (low specificity)
elements/        → Bare HTML element styling (foundation for base.css)
objects/         → Layout primitives (.o-container, .o-grid, .o-flex) - no visual skin
components/      → Reusable BEM blocks (buttons, cards, etc.)
sections/        → Section-specific layouts
snippets/        → Component-specific styling
utilities/       → Single-responsibility helpers (highest specificity)
```

Key principles:

- No `!important` anywhere in the system
- CSS `@layer` enforces cascade precedence (defined once in `base.scss`)
- BEM naming within each layer for clarity and safety
- Separation of concerns: Settings contain only tokens; objects/elements build upon them

### Asset Pipeline

- **Source**: `frontend/` directory (not published to Shopify)
- **Output**: `assets/` directory (flat structure, published to Shopify)
- **Styles**: SCSS partials in `frontend/styles/` automatically generate entrypoints in `frontend/entrypoints/`
- **Scripts**: JS/JSX/TS/TSX in `frontend/` with `base.jsx` as main entrypoint
- **Assets**: Images, fonts, SVGs optimized during build

### Key Features

- **Sass preprocessing** via `sass-embedded` (modern API)
- **Optional React (JSX/TSX)** support for components
- **Hot Module Reload** in development (combines `shopify theme dev` + Vite server)
- **Image/font/SVG optimization** via `vite-plugin-image-optimizer` (Sharp + SVGO)
- **Optimized production build**:
  - Minification via Oxc (Vite 8's native engine)
  - 100% flat output in `assets/` (no subfolders, Shopify requirement)
  - Cache-busting via query params (`?v=...`), not filename hashes
- **Automated asset management**: Each `.scss` partial auto-generates its own entrypoint
- **Integrated verification**: `yarn build:verify` validates output against Vite's manifest
- **Zero impact on design/behavior**: Original theme CSS/JS remains untouched

## Development Workflow

### Key Scripts

- `yarn dev` - Starts Vite + Shopify CLI (requires shopify theme login)
- `yarn dev:vite` - Vite only (for testing pipeline without Shopify connection)
- `yarn build` - Creates optimized assets in `/assets/`
- `yarn build:verify` - Builds + validates output meets Shopify requirements
- `yarn lint` - Runs JS/TS and SCSS linters
- `yarn lint:fix` - Automatically fixes linting issues where possible
- `yarn format` - Formats all supported files with Prettier

### File Conventions

- **SCSS Partials**: Create `_name.scss` in appropriate `frontend/styles/` subfolder:
  - `components/` → Reusable blocks (buttons, cards, forms)
  - `sections/` → Page-section specific styles
  - `snippets/` → Small component-specific styles
  - Vite auto-generates entrypoint in `frontend/entrypoints/`
- **Reference in Liquid**: `{% render 'vite-tag', entry: 'component-button.scss' %}`
- **JavaScript/TypeScript**: Place in `frontend/`; React components in `frontend/js/components/`
- **Style Import**: Import styles normally: `import '../styles/components/_button.scss'`
- **Theme Customization**: Edit variables in `frontend/styles/settings/`

### Configuration Files

- `vite.config.js` - Vite/plugins configuration
- `package.json` - Project metadata & scripts
- `tsconfig.json` - TypeScript settings (if using TS)
- `.prettierrc` - Prettier formatting rules
- `eslint.config.js` - ESLint flat config (modern format)
- `.stylelintrc` - Stylelint configuration

## Important Notes

- Everything under `frontend/` is development source; only `assets/` and `snippets/` are published to store
- The project uses Yarn Berry (Yarn 4) via Corepack
- TypeScript adoption is gradual: new components can be `.tsx`/`.ts` while existing `.js`/`.jsx` continue working
- Shopify connection is handled via Shopify CLI (not `shopify.config.toml`)
