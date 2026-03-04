# AGENTS.md

## Cursor Cloud specific instructions

This is a **monorepo** for the Execution Control Protocol (ECP), using npm workspaces.

### Repository structure

| Path | Purpose |
|---|---|
| `packages/spec/` | TypeScript types, JSON Schema generation, spec validation |
| `packages/runtime/` | ECP execution engine (providers, protocols, mounts, policies) |
| `packages/cli/` | CLI tool: `ecp run` and `ecp validate` |
| `packages/docs/` | TypeDoc documentation generator |
| `examples/` | Example Context manifests (single-executor, controller-specialist) |
| `spec.yaml` | Canonical ECP Context example |

### NPM scripts (run from repo root)

| Command | What it does |
|---|---|
| `npm run build` | TypeScript type-check all packages (spec → runtime → cli) |
| `npm run generate:schema` | Generate JSON Schema from spec types |
| `npm run lint` | ESLint + markdownlint |
| `npm run validate` | Validate `spec.yaml` via AJV + structural checks |
| `npm run docs` | Build HTML documentation with TypeDoc |
| `npm run check` | Full suite: build + generate:schema + lint + validate |

### Running the CLI

```sh
npx tsx packages/cli/src/index.ts run <context.yaml> --input key=value --debug
npx tsx packages/cli/src/index.ts validate <context.yaml>
```

Requires `OPENAI_API_KEY` for `ecp run`.

### Gotchas

- **Monorepo with npm workspaces.** Always run `npm install` from the repo root.
- **Build order matters:** spec → runtime → cli (composite project references).
- **No Python.** All tooling is NPM-based.
- **AJV CJS/ESM interop:** runtime and spec use `_Ajv.default ?? _Ajv` pattern.
- **Import extensions:** `Node16` module resolution — all local imports end with `.js`.
- **Schema is a build output:** `packages/spec/dist/ecp-context.schema.json` is generated.
- **spec.yaml lives at repo root.** The validator resolves it via `import.meta.dirname`.
