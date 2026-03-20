# GitHub Actions workflows

| File | Purpose |
| ---- | ------- |
| **`ci.yml`** | Entry point: runs on pushes to `main` / `development` and on PRs targeting those branches. Calls `ci-pipeline.yml`. |
| **`ci-pipeline.yml`** | Reusable pipeline: build, lint, validate, unit / integration / e2e tests. **npm publish** runs only on **push to `main`** (not on PRs or `development`). |
| **`development.yml`** | On `development` (push + PR): checks workspace versions are above published npm versions before merge to `main`. |
| **`evals.yml`** | Manual / scheduled evaluation runs (optional; separate from CI). |

To run the full quality gate locally: `npm run build`, `npm run lint`, `npm run validate`, `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`.
