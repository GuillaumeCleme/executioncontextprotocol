/**
 * Recalled — markdown-first, standalone memory plugin.
 *
 * Provides dual short-term and long-term memory with backend-agnostic
 * storage contracts, hierarchical document chunking, and budget-aware retrieval.
 */

export { Recalled } from "./recalled.js";
export type { RecalledConfig, RecalledQueryOptions } from "./recalled.js";

export * from "./models/index.js";
export * from "./contracts/index.js";

export { createSqliteMemoryStore } from "./backends/sqlite/index.js";
export type { SqliteMemoryStoreConfig } from "./backends/sqlite/index.js";

export { createInMemoryConversationStore } from "./backends/memory/index.js";
