# Repository rulesets

## `protect-development.json`

Ruleset for the **`development`** branch:

- **Pull requests** — Changes must go through a PR before merging into `development`.
- **Restrict updates** — Only actors with bypass permission can push directly to `development` (everyone else must land changes via PR merge). Set bypass in the ruleset UI if specific accounts should be allowed to push.

## `protect-main.json`

Ruleset for **`main`**:

- **Deletion** — The branch cannot be deleted.
- **Force push** — Blocked (`non_fast_forward`).
