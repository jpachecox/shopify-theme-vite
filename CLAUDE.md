# CLAUDE.md

Guidance for Claude Code sessions working in this repository.

## PR Conventions

- Every PR must use `.github/PULL_REQUEST_TEMPLATE.md` — do not write PR descriptions from scratch.
- Keep each bullet under "Changes" to 1 line. Don't duplicate commit-level detail (exact error messages, code examples, commit list) in the PR body — that lives in the commits and `CHANGELOG.md`.
- Always link the related issue with `Closes #<number>` under Description. This only auto-closes the issue on merge to the default branch (`main`); if the flow merges to `develop` first, the issue won't close until `develop` reaches `main`.
- Delete unused "Changes" subsections (Fixes/Feature/Refactor/Tests/Docs) rather than leaving them empty.
- PR titles: short, describe what the PR does, not how (e.g. "Harden Sass mixin argument validation", not "Fixed some bugs in mixins").
- PR titles: short, describe what the PR does, not how (e.g. "Harden Sass mixin argument validation", not "Fixed some bugs in mixins").
