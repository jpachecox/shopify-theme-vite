# Deployment

## Environments

| Branch    | Environment  | Shopify theme       |
| --------- | ------------ | ------------------- |
| `develop` | QA / staging | Not yet provisioned |
| `main`    | Production   | Not yet provisioned |

Deploys are triggered manually via the `Deploy` workflow
(`.github/workflows/deploy.yml`, `workflow_dispatch`) — there is no
automatic deploy on push. Choose the `environment` input matching the
target theme.

> **Status:** no Shopify store/theme has been provisioned yet. The
> `deploy.yml` workflow exists as a scaffold with the real
> `shopify theme push` step commented out. Once a store and theme(s)
> exist, uncomment that step and configure the secrets listed in the
> workflow's header comment under `Settings → Environments →
development` / `production`.

## Rollback

If a deploy to `main` (production) needs to be reverted:

1. **Preferred — restore via Shopify admin:**
   Online Store → Themes → find the previous published theme in theme
   library (Shopify keeps prior versions automatically) → **Publish**
   to make it live again. This is the fastest path and doesn't require
   CLI access.

2. **Alternative — pull the previous version locally and re-push:**

   ```bash
   shopify theme pull --theme=<previous-theme-id>
   shopify theme push --theme=<production-theme-id> --allow-live
   ```

   Use this if the previous theme was already deleted from the theme
   library and needs to be reconstructed from a known-good git tag
   instead.

3. **Git-level rollback:** since `main` requires linear history and
   signed commits, reverting the offending commit(s) with `git revert`
   (not `git reset`) and opening a normal PR is the correct way to undo
   the change in the repo itself, separate from the live theme rollback
   above.

## Release process

Releases are created manually for full control of each version:

1. Move the accumulated `[Unreleased]` entries in `CHANGELOG.md` into a
   versioned `## x.y.z (YYYY-MM-DD)` section.
2. Commit and merge the changelog update to `main`.
3. Create a tag on `main`: `git tag v1.0.0 && git push origin v1.0.0`.
4. Create a GitHub release from the tag, using the versioned changelog
   section as the description.
