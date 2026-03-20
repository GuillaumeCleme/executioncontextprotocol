/**
 * ECP plugin contracts and specification re-exports for plugin authors.
 *
 * Depends only on `@executioncontrolprotocol/spec` — no runtime engine dependencies.
 */

export * from "@executioncontrolprotocol/spec";

export * from "./model-provider.js";
export * from "./memory.js";
export * from "./progress.js";
export * from "./extensions.js";
export * from "./memory-plugin.js";
