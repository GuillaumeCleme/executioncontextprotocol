# Single Executor Example

A minimal ECP Context with one executor and no tool calls. Demonstrates the simplest end-to-end flow.

## What it does

Given a `topic` input, the `summarizer` executor calls the LLM once and produces a structured `Summary` output with a `headline` and `body`.

## Run it

```bash
# From the repo root
ecp run examples/single-executor/context.yaml \
  --input topic="Execution Control Protocol" \
  --debug
```

## Requirements

- `OPENAI_API_KEY` environment variable set
