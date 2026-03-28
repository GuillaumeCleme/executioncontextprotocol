/**
 * Storage contract for vector embeddings (optional semantic layer).
 *
 * Embeddings are an optional secondary retrieval signal.
 * This contract allows plugging in different vector stores.
 *
 * @category Contracts
 */

/**
 * A stored embedding record.
 *
 * @category Contracts
 */
export interface EmbeddingRecord {
  /** Record identifier (chunk id or memory id). */
  recordId: string;

  /** Source type that was embedded. */
  sourceType: "chunk" | "memory" | "conversation";

  /** Model used to generate the embedding. */
  embeddingModel: string;

  /** Version of the embedding model. */
  embeddingVersion: string;

  /** The embedding vector. */
  vector: number[];
}

/**
 * A semantic search result.
 *
 * @category Contracts
 */
export interface SemanticSearchHit {
  /** Record identifier. */
  recordId: string;

  /** Cosine similarity score (0-1). */
  similarity: number;
}

/**
 * Options for semantic search.
 *
 * @category Contracts
 */
export interface SemanticSearchOptions {
  /** Maximum number of results. */
  limit?: number;

  /** Minimum similarity threshold. */
  minSimilarity?: number;

  /** Filter by source type. */
  sourceType?: "chunk" | "memory" | "conversation";
}

/**
 * Contract for embedding storage and similarity search.
 *
 * @category Contracts
 */
export interface EmbeddingStore {
  /** Store an embedding for a record. */
  store(record: EmbeddingRecord): Promise<void>;

  /** Batch store embeddings. */
  storeBatch(records: EmbeddingRecord[]): Promise<void>;

  /** Search by vector similarity. */
  search(vector: number[], options?: SemanticSearchOptions): Promise<SemanticSearchHit[]>;

  /** Get the embedding for a record. */
  get(recordId: string): Promise<EmbeddingRecord | undefined>;

  /** Remove an embedding. */
  remove(recordId: string): Promise<void>;

  /** Close the store. */
  close(): Promise<void>;
}
