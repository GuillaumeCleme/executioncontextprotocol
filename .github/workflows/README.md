# GitHub Actions workflows

| File | Purpose |
| ---- | ------- |
| **`ci.yml`** | Workflow `ci`: runs on pushes to `main` / `development` and on PRs targeting those branches. Calls `ci-pipeline.yml`. |
| **`ci-pipeline.yml`** | Reusable workflow `ci`: jobs `build`, `unit`, `integration`, `e2e`; **publish** on **push to `main`** only. |
| **`development.yml`** | Workflow `devversion`: on `development` (push + PR), checks workspace versions are above published npm (job `version`). |
| **`evals.yml`** | Daily / manual **eval** runs: installs Ollama, pulls `gemma3:1b` (or dispatch input), runs `examples/single-executor` and `examples/controller-specialist` with `--provider ollama`. |

To run the full quality gate locally: `npm run build`, `npm run lint`, `npm run validate`, `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`.

**E2E on GitHub Actions:** The `e2e` job caches **model blobs** only — `OLLAMA_MODELS` points at `.ollama-models/` under the workspace; `ollama pull` is skipped when that cache hits. The **Ollama CLI is not cached**: restoring paths under `/usr/local` requires root on hosted runners, so `actions/cache` often fails restore after downloading a multi‑GB archive, then runs `install.sh` anyway (slower than always installing). Bump the `…-v1` suffix in `ci-pipeline.yml` when changing the pinned model.
