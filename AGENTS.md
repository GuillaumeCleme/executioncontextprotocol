# AGENTS.md

## Cursor Cloud specific instructions

This is a **monorepo** for the Execution Control Protocol (ECP) specification, using npm workspaces.

### Repository structure

| Path | Purpose |
|---|---|
| `packages/spec/` | TypeScript types, JSON Schema generation, and spec validation |
| `packages/docs/` | TypeDoc documentation generator (outputs to `packages/docs/dist/`) |
| `spec.yaml` | Example ECP Context manifest (`ecp/v0.3-draft`) |
| `README.md` | High-level ECP overview |
| `SPEC.md` | Detailed protocol specification |
| `.cursor/rules/` | Cursor rule files (MDC format) |

### NPM scripts (run from repo root)

| Command | What it does |
|---|---|
| `npm run build` | TypeScript type-check all workspaces |
| `npm run generate:schema` | Generate `packages/spec/dist/ecp-context.schema.json` from types |
| `npm run lint` | ESLint + markdownlint |
| `npm run validate` | Parse `spec.yaml` and validate via AJV + structural checks |
| `npm run docs` | Build HTML documentation with TypeDoc |
| `npm run check` | Full suite: build + generate:schema + lint + validate |

### Gotchas

- **Monorepo with npm workspaces.** Always run `npm install` from the repo root. Do not run `npm install` inside individual packages.
- **No Python.** All tooling is NPM-based.
- **AJV CJS/ESM interop:** `packages/spec/src/validate.ts` uses a `_Ajv.default ?? _Ajv` pattern. Do not simplify this import.
- **Import extensions:** `tsconfig.base.json` uses `Node16` module resolution — all local imports must end with `.js`.
- **Schema is a build output:** `packages/spec/dist/ecp-context.schema.json` is generated from types. Never hand-edit it.
- **spec.yaml lives at repo root**, not inside any package. The validator resolves it via `import.meta.dirname`.
- **Docs deploy:** The `docs.yml` workflow builds TypeDoc output and deploys to GitHub Pages. The published URL will be `https://<owner>.github.io/<repo>/`.
