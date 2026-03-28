/**
 * Storage contract for long-term memory records.
 *
 * This is the backend-agnostic interface that the Recalled controller
 * uses for durable memory. Compatible with the existing ECP MemoryStore
 * contract.
 *
 * @category Contracts
 */

import type {
  MemoryRecord,
  MemoryScope,
  MemoryGetOptions,
  MemoryListOptions,
  MemoryDeleteOptions,
} from "../models/memory.js";

/**
 * Contract for long-term memory persistence.
 *
 * @category Contracts
 */
export interface LongTermMemoryStore {
  /** Get memories for the given scope, ordered by recency. */
  get(scope: MemoryScope, options?: MemoryGetOptions): Promise<MemoryRecord[]>;

  /** Store or update a memory record. */
  put(
    scope: MemoryScope,
    executorName: string,
    summary: string,
    payload?: Record<string, unknown>,
    id?: string,
  ): Promise<MemoryRecord>;

  /** List memory ids and summaries for inspection or cleanup. */
  list(
    scope: MemoryScope,
    options?: MemoryListOptions,
  ): Promise<Pick<MemoryRecord, "id" | "summary" | "createdAt">[]>;

  /** Delete one or more memories. */
  delete(scope: MemoryScope, options?: MemoryDeleteOptions): Promise<{ deleted: number }>;

  /** Close the store and persist data. */
  close(): Promise<void>;
}
