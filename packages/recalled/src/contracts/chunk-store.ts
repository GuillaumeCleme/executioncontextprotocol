/**
 * Storage contract for chunk records.
 *
 * Implementations persist document chunks and their relationships,
 * supporting hierarchical retrieval by document, heading path, or type.
 *
 * @category Contracts
 */

import type { ChunkRecord, ChunkRelation, ChunkType } from "../models/chunk.js";

/**
 * Options for querying chunks.
 *
 * @category Contracts
 */
export interface ChunkQueryOptions {
  /** Filter by document id. */
  docId?: string;

  /** Filter by chunk type. */
  chunkType?: ChunkType;

  /** Filter by parent chunk id. */
  parentChunkId?: string;

  /** Filter by heading path prefix (e.g. "Installation"). */
  headingPathPrefix?: string;

  /** Maximum number of results. */
  limit?: number;
}

/**
 * Contract for chunk persistence.
 *
 * @category Contracts
 */
export interface ChunkStore {
  /** Get a chunk by id. */
  getById(chunkId: string): Promise<ChunkRecord | undefined>;

  /** Get all chunks for a document. */
  getByDocId(docId: string): Promise<ChunkRecord[]>;

  /** Get child chunks of a parent. */
  getChildren(parentChunkId: string): Promise<ChunkRecord[]>;

  /** Query chunks with optional filters. */
  query(options?: ChunkQueryOptions): Promise<ChunkRecord[]>;

  /** Insert or update a chunk. */
  upsert(chunk: ChunkRecord): Promise<void>;

  /** Bulk insert or update chunks. */
  upsertBatch(chunks: ChunkRecord[]): Promise<void>;

  /** Delete all chunks for a document. */
  deleteByDocId(docId: string): Promise<number>;

  /** Delete a single chunk. */
  delete(chunkId: string): Promise<boolean>;

  /** Store a relationship between chunks. */
  addRelation(relation: ChunkRelation): Promise<void>;

  /** Get relations originating from a chunk. */
  getRelations(fromChunkId: string): Promise<ChunkRelation[]>;
}
