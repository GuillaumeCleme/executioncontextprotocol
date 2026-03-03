#!/usr/bin/env tsx
/**
 * ECP Context Spec Validator
 *
 * Loads spec.yaml, validates it against the ECP JSON Schema using AJV,
 * and performs additional structural checks (e.g. entrypoint references
 * a real executor, outputSchemaRef points to a declared schema, etc.).
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import _Ajv from "ajv";
import yaml from "js-yaml";

// AJV CJS/ESM interop: the default export may be wrapped in a .default property
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Ajv = (_Ajv as any).default ?? _Ajv;

import type { ECPContext } from "./types/index.js";

const SCHEMA_PATH = resolve(import.meta.dirname, "../dist/ecp-context.schema.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadYaml(filePath: string): unknown {
  const raw = readFileSync(filePath, "utf-8");
  return yaml.load(raw);
}

function fail(message: string): never {
  console.error(`  FAIL: ${message}`);
  process.exit(1);
}

function pass(message: string): void {
  console.log(`  PASS: ${message}`);
}

// ---------------------------------------------------------------------------
// Schema validation via AJV
// ---------------------------------------------------------------------------

function validateSchema(doc: unknown): ECPContext {
  if (!existsSync(SCHEMA_PATH)) {
    fail(
      `Generated schema not found at ${SCHEMA_PATH}. Run "npm run generate:schema" first.`,
    );
  }

  const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf-8"));
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  if (!validate(doc)) {
    console.error("\nSchema validation errors:");
    for (const err of validate.errors ?? []) {
      console.error(`  - ${err.instancePath || "/"}: ${err.message}`);
    }
    fail("spec.yaml does not conform to the ECP Context schema.");
  }

  return doc as ECPContext;
}

// ---------------------------------------------------------------------------
// Structural checks beyond JSON Schema
// ---------------------------------------------------------------------------

function checkStructure(ctx: ECPContext): void {
  const executorNames = new Set(ctx.executors.map((e) => e.name));
  const schemaNames = new Set(Object.keys(ctx.schemas ?? {}));

  // Entrypoint must reference an existing executor
  if (!executorNames.has(ctx.orchestration.entrypoint)) {
    fail(
      `orchestration.entrypoint "${ctx.orchestration.entrypoint}" does not match any executor name.`,
    );
  }
  pass(
    `orchestration.entrypoint "${ctx.orchestration.entrypoint}" references a valid executor.`,
  );

  // orchestration.requires must reference declared schemas
  for (const req of ctx.orchestration.requires ?? []) {
    if (!schemaNames.has(req)) {
      fail(`orchestration.requires "${req}" is not declared in schemas.`);
    }
  }
  if (ctx.orchestration.requires?.length) {
    pass(
      `orchestration.requires [${ctx.orchestration.requires.join(", ")}] all reference declared schemas.`,
    );
  }

  // orchestration.produces must reference a declared schema
  if (ctx.orchestration.produces && !schemaNames.has(ctx.orchestration.produces)) {
    fail(
      `orchestration.produces "${ctx.orchestration.produces}" is not declared in schemas.`,
    );
  }
  if (ctx.orchestration.produces) {
    pass(
      `orchestration.produces "${ctx.orchestration.produces}" references a declared schema.`,
    );
  }

  // Executor outputSchemaRefs must reference declared schemas
  for (const executor of ctx.executors) {
    if (executor.outputSchemaRef) {
      const ref = executor.outputSchemaRef.replace("#/schemas/", "");
      if (!schemaNames.has(ref)) {
        fail(
          `executor "${executor.name}" outputSchemaRef "${executor.outputSchemaRef}" does not match a declared schema.`,
        );
      }
      pass(
        `executor "${executor.name}" outputSchemaRef "${executor.outputSchemaRef}" is valid.`,
      );
    }
  }

  // Executor names must be unique
  if (executorNames.size !== ctx.executors.length) {
    fail("Duplicate executor names detected.");
  }
  pass(`All ${ctx.executors.length} executor names are unique.`);

  // Output fromSchema must reference a declared schema
  for (const output of ctx.outputs ?? []) {
    if (!schemaNames.has(output.fromSchema)) {
      fail(
        `output "${output.name}" fromSchema "${output.fromSchema}" is not declared in schemas.`,
      );
    }
    pass(`output "${output.name}" fromSchema "${output.fromSchema}" is valid.`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const specPath = resolve(process.cwd(), "spec.yaml");

  console.log(`\nValidating: ${specPath}\n`);
  console.log("--- Schema Validation (AJV) ---");

  const doc = loadYaml(specPath);
  const ctx = validateSchema(doc);
  pass("spec.yaml conforms to the ECP Context JSON Schema.\n");

  console.log("--- Structural Checks ---");
  checkStructure(ctx);

  console.log(
    `\n  Context: ${ctx.metadata.name} v${ctx.metadata.version} (${ctx.apiVersion})`,
  );
  console.log(`  Executors: ${ctx.executors.map((e) => e.name).join(", ")}`);
  console.log(`  Schemas: ${Object.keys(ctx.schemas ?? {}).join(", ")}`);
  console.log(`  Strategy: ${ctx.orchestration.strategy}`);
  console.log("\nAll checks passed.\n");
}

main();
