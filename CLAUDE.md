# CLAUDE.md

Guidance for Claude Code sessions working in this repository.

## PR Conventions

- Every PR must use `.github/PULL_REQUEST_TEMPLATE.md` — do not write PR descriptions from scratch.
- Keep each bullet under "Changes" to 1 line. Don't duplicate commit-level detail (exact error messages, code examples, commit list) in the PR body — that lives in the commits and `CHANGELOG.md`.
- Always link the related issue with `Closes #<number>` under Description. This only auto-closes the issue on merge to the default branch (`main`); if the flow merges to `develop` first, the issue won't close until `develop` reaches `main`.
- Delete unused "Changes" subsections (Fixes/Feature/Refactor/Tests/Docs) rather than leaving them empty.
- PR titles: short, describe what the PR does, not how (e.g. "Harden Sass mixin argument validation", not "Fixed some bugs in mixins").

## Testing

All tests run on **Vitest** (`vitest.config.mjs`) — there is a single test
runner, no `node --test` anywhere in the project anymore.

- `yarn test` / `yarn test:watch` / `yarn test:coverage`: full suite.
- `yarn check:sass` / `yarn check:entrypoints`: targeted `vitest run` on a
  single file, kept as named scripts so CI shows them as distinct,
  separately-failing steps instead of one big "test" step.
- Test environment is per-glob (`environmentMatchGlobs` in
  `vitest.config.mjs`): `frontend/**` runs under `jsdom` (for React/DOM
  tests), `utils/**` and `scripts/**` run under plain `node` (build
  tooling and Sass-compilation checks have no DOM).
- Assertions use Vitest's `expect(...)` API (`toBe`, `toEqual`, `toMatch`,
  `toThrow`, `toBeNull`, `toBeTruthy`) — not `node:assert`.

## Dependency & CI tooling decisions

- **Version updates:** Dependabot (`.github/dependabot.yml`) is the single
  tool for dependency updates — Renovate is not used. Reconsider only if
  auto-merge or custom grouping/labeling needs outgrow what Dependabot
  offers.
- **CI failure notifications:** not yet configured. No Slack/Discord
  webhook exists. Revisit once the team grows beyond a single maintainer
  or once `deploy.yml` goes live (failed deploys are the point where
  notifications matter most).
