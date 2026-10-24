# Releasing

This document describes the real release flow for this repository. It replaces the stale "Release process" section in `DEPLOYMENT.md`.

## Branches and tags

- `develop` — integration branch; all work lands here via PRs (squash-merged).
- `main` — production branch; receives only the release merge commit from `develop`.
- Tags: annotated tags `vX.Y.Z` created on `main` **after** the release merge commit lands.

## 1. Prepare

Before opening the release PR, verify:

- `develop` CI is green (all jobs in `.github/workflows/ci.yml` pass).
- `yarn audit --severity high` exits `0` (no high/critical advisories).
- Security PRs from Dependabot that target `main` have been applied to `develop` and closed on `main` (see **Security patches for main**).
- `CHANGELOG.md` has a dated version section under `## [Unreleased]` with **only items that actually shipped** (compare `git diff origin/main origin/develop`). No placeholders like `#<...>` or `(#<this PR>)`. The "Changelog check" CI step passes.

## 2. Release PR

Open a PR with:

- **Base:** `main` ← **Head:** `develop`
- **Title:** `chore(release): merge develop into main for vX.Y.Z`
- **Template:** `.github/PULL_REQUEST_TEMPLATE.md` (include `Closes #N` if an issue tracks the release)
- **Merge method:** "Create a merge commit" (required; never squash — squash makes `main` diverge from `develop`)
- **Prerequisite:** Repository setting **Settings → General → Pull Requests → Allow merge commits** must be enabled

Wait for all CI checks to pass and the PR to show **"Able to merge"**. The maintainer merges it.

## 3. Tag and Release

**Only after the maintainer merges the release PR:**

```bash
git checkout main && git pull
git log -1  # verify the tip is the release merge commit
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

Create the GitHub release with notes extracted from the CHANGELOG:

```bash
awk '/^## \[X.Y.Z\]/{f=1;next} /^## \[PREV\]/{f=0} f' CHANGELOG.md > notes.md
gh release create vX.Y.Z --title "vX.Y.Z" --notes-file notes.md --latest --verify-tag
```

Replace `X.Y.Z` and `PREV` with the actual version numbers (e.g., `0.7.1` and `0.7.0`).

## 4. After

- **If the release PR was squashed by mistake:** from `develop`, run `git merge -S -s ours origin/main` and push. This records the merge without changing files, preventing future divergence.
- Close any Dependabot security alerts that were resolved in the release.
- Verify CI on `main` is green.
- Confirm the GitHub release notes match the `CHANGELOG.md` section for that version.

## Security patches for main

Dependabot **security** updates always target `main` (GitHub behavior). Do **not** merge them into `main` directly. Instead:

1. Apply the lockfile change to `develop` (cherry-pick or manually edit `yarn.lock`).
2. Close the Dependabot PR on `main`.
3. The fix ships with the next regular release from `develop`.

`Closes #N` only closes an issue when the PR reaches `main`. If the release PR merges to `develop` first, the issue stays open until `develop` reaches `main`.

## Known pitfalls

| Pitfall                                              | Consequence                                            | Prevention                                                   |
| ---------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| Tagging before the release merge lands               | Tag points to wrong commit; release notes mismatch     | Tag **only after** the merge commit is on `main`             |
| Placeholders in CHANGELOG (`#<...>`, `(#<this PR>)`) | CI "Changelog check" fails; release blocked            | Resolve all PR numbers before opening release PR             |
| Squash-merging the release PR                        | `main` diverges from `develop`; future merges conflict | Always use "Create a merge commit"                           |
| Dependabot security PRs merged into `main`           | Lockfile on `main` differs from `develop`; drift       | Apply to `develop`, close on `main`                          |
| CHANGELOG items that did not ship                    | Release notes claim work that isn't in the build       | Compare `git diff origin/main origin/develop` before release |
