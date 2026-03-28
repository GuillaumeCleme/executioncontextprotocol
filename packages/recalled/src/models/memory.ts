/**
 * Long-term memory record model.
 *
 * Represents a durable memory entry scoped by context, user, or organization.
 * Compatible with the existing ECP MemoryStore contract but extended for
 * the Recalled architecture.
 *
 * @category Models
 */

/** Scope of a memory record. */
export type MemoryScope = "user" | "context" | "org";

/**
 * A single long-term memory record.
 *
 * @category Models
 */
export interface MemoryRecord {
  /** Unique record identifier. */
  id: string;

  /** Memory scope. */
  scope: MemoryScope;

  /** Executor or agent that wrote this memory. */
  executorName: string;

  /** Short summary for retrieval and context injection. */
  summary: string;

  /** Optional structured payload. */
  payload?: Record<string, unknown>;

  /** ISO-8601 creation timestamp. */
  createdAt: string;

  /** ISO-8601 last update timestamp. */
  updatedAt: string;
}

/**
 * Options for reading long-term memories.
 *
 * @category Models
 */
export interface MemoryGetOptions {
  /** Maximum number of records to return. */
  maxItems?: number;

  /** Approximate max tokens for combined summary text. */
  maxTokens?: number;

  /** Filter by executor name. */
  executorName?: string;

  /** Return only summaries (omit payload) to save tokens. */
  summariesOnly?: boolean;
}

/**
 * Options for listing memories (e.g. for cleanup or inspection).
 *
 * @category Models
 */
export interface MemoryListOptions {
  /** Maximum number of records. */
  limit?: number;

  /** Filter by executor name. */
  executorName?: string;

  /** Only records older than this ISO-8601 timestamp. */
  olderThan?: string;
}

/**
 * Options for deleting memories.
 *
 * @category Models
 */
export interface MemoryDeleteOptions {
  /** Delete a single record by id. */
  id?: string;

  /** Delete multiple records by id. */
  ids?: string[];

  /** Delete records older than this timestamp. */
  olderThan?: string;

  /** Filter by executor name. */
  executorName?: string;
}
