# Repository rulesets

## `protect-development.json`

Ruleset for the **`development`** branch:

- **Pull requests** — Changes must go through a PR before merging into `development`.
- **Required status checks** — The CI jobs listed in the file must succeed first (names must match the checks shown on a pull request).

## `protect-main.json`

Ruleset for **`main`**:

- **Deletion** — The branch cannot be deleted.
- **Force push** — Blocked (`non_fast_forward`).
