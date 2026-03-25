# Ollama + MCP filesystem (file listing)

This example runs a single agent on **Ollama** that calls the official
[`@modelcontextprotocol/server-filesystem`](https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem)
MCP server and returns a **JSON file listing** for a configured folder.

## Prerequisites

- **Ollama** running locally (`http://localhost:11434`) with **`llama3.2:3b`** (tool-capable; `gemma3:1b` does not support tools in Ollama).
- **Node.js** + **npm** on `PATH` (the MCP server is launched via `npx`).

## Layout

- `context.yaml` — Context manifest; required input `rootPath` must match the MCP allowed root.
- `ecp.config.example.yaml` — System config; by default allows `sample-docs/` under this example (relative to repo root).
- `sample-docs/` — Committed sample files (`hello.txt`, `notes/…`) so the top-level listing is non-empty.

Run commands from the **repository root** so the default relative `rootPath` matches `ecp.config.example.yaml`.

## Validate

```bash
ecp validate examples/ollama-filesystem-documents/context.yaml \
  --config examples/ollama-filesystem-documents/ecp.config.example.yaml \
  --input rootPath=examples/ollama-filesystem-documents/sample-docs
```

Optional name filter:

```bash
ecp validate examples/ollama-filesystem-documents/context.yaml \
  --config examples/ollama-filesystem-documents/ecp.config.example.yaml \
  --input rootPath=examples/ollama-filesystem-documents/sample-docs \
  --input query=hello
```

## Run

```bash
ecp run examples/ollama-filesystem-documents/context.yaml \
  --config examples/ollama-filesystem-documents/ecp.config.example.yaml \
  --input rootPath=examples/ollama-filesystem-documents/sample-docs \
  --provider ollama
```

## Pointing at your Documents folder

1. In `ecp.config.example.yaml` (or a copy), set the last `args` value under `tools.servers.filesystem` to your Documents path (absolute recommended), e.g. `C:/Users/you/Documents`.
2. Pass the **same** path as `--input rootPath=…` when you run `ecp`.
