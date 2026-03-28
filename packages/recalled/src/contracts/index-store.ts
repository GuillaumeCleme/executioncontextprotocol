/**
 * Storage contract for search indexes.
 *
 * The index store provides lexical (full-text) search over chunks.
 * Implementations may use SQLite FTS, Elasticsearch, or other backends.
 *
 * @category Contracts
 */

/**
 * A search hit from the index.
 *
 * @category Contracts
 */
export interface IndexSearchHit {
  /** Chunk identifier. */
  chunkId: string;

  /** Relevance score from the index (implementation-defined scale). */
  score: number;

  /** Optional highlighted snippet. */
  snippet?: string;
}

/**
 * Options for index search.
 *
 * @category Contracts
 */
export interface IndexSearchOptions {
  /** Maximum number of results. */
  limit?: number;

  /** Filter by document ids. */
  docIds?: string[];

  /** Boost factor for title/heading matches. */
  headingBoost?: number;
}

/**
 * Contract for lexical search indexing.
 *
 * @category Contracts
 */
export interface IndexStore {
  /** Index a chunk's content and metadata for search. */
  index(chunkId: string, content: string, headingPath: string, anchorTerms: string[]): Promise<void>;

  /** Batch index multiple chunks. */
  indexBatch(entries: Array<{ chunkId: string; content: string; headingPath: string; anchorTerms: string[] }>): Promise<void>;

  /** Search the index with a text query. */
  search(query: string, options?: IndexSearchOptions): Promise<IndexSearchHit[]>;

  /** Remove a chunk from the index. */
  remove(chunkId: string): Promise<void>;

  /** Remove all chunks for a document from the index. */
  removeByDocId(docId: string): Promise<void>;

  /** Close the index. */
  close(): Promise<void>;
}
