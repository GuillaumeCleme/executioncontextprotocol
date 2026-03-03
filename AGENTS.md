# AGENTS.md

## Cursor Cloud specific instructions

This is a **specification-only repository** (Execution Control Protocol / ECP), bootstrapped as a TypeScript project. There are no runnable application services — the development workflow is editing Markdown docs, YAML specs, and TypeScript validation code.

### Repository structure

| Path | Purpose |
|---|---|
| `README.md` | High-level ECP overview |
| `SPEC.md` | Detailed protocol specification |
| `spec.yaml` | Example ECP Context manifest (`ecp/v0.3-draft`) |
| `src/types/ecp.ts` | TypeScript type definitions for the ECP spec |
| `src/schema/ecp-context.schema.ts` | JSON Schema (AJV) for runtime validation |
| `src/validate.ts` | Validation script — schema + structural checks |
| `.cursor/rules/` | Cursor rule files (MDC format) |

### NPM scripts (single source of truth)

| Command | What it does |
|---|---|
| `npm run build` | TypeScript type-check (`tsc --noEmit`) |
| `npm run lint` | ESLint + markdownlint |
| `npm run lint:ts` | ESLint only |
| `npm run lint:md` | Markdown lint only |
| `npm run validate` | Parse `spec.yaml` and validate via AJV + structural checks |
| `npm run check` | Full suite: build + lint + validate |

### Gotchas

- **No Python.** All tooling is NPM-based. Do not introduce `pip`, `yamllint` (Python), or any non-Node dependencies.
- **AJV CJS/ESM interop:** `src/validate.ts` uses a `_Ajv.default ?? _Ajv` pattern because AJV's default export behaves differently under ESM. Do not simplify this import.
- **Import extensions:** `tsconfig.json` uses `Node16` module resolution — all local imports must end with `.js` (even for `.ts` source files).
- **Markdown lint config:** `.markdownlint.yaml` relaxes rules to match the existing doc style (long lines, multiple H1s, bare URLs, flexible list indentation).
