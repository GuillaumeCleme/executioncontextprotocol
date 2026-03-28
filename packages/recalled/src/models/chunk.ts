/**
 * Chunk model for hierarchical document sections.
 *
 * Documents are split into a tree of chunks preserving heading structure,
 * parent-child relationships, and semantic metadata.
 *
 * @category Models
 */

/** Classification of a chunk's structural role. */
export type ChunkType =
  | "doc-summary"
  | "section"
  | "subsection"
  | "leaf"
  | "procedure"
  | "code"
  | "table"
  | "policy"
  | "reference";

/**
 * A single chunk record within a document.
 *
 * @category Models
 */
export interface ChunkRecord {
  /** Unique chunk identifier. */
  chunkId: string;

  /** Parent document identifier. */
  docId: string;

  /** Parent chunk identifier (null for top-level sections). */
  parentChunkId?: string;

  /** Full heading path (e.g. "Getting Started > Installation > npm"). */
  headingPath: string;

  /** Heading level (0 for document root, 1-6 for headings). */
  headingLevel: number;

  /** Structural role of this chunk. */
  chunkType: ChunkType;

  /** Start offset in the source document (bytes). */
  startOffset: number;

  /** End offset in the source document (bytes). */
  endOffset: number;

  /** Estimated token count. */
  tokenEstimate: number;

  /** Importance score (0-1, higher = more important). */
  importanceScore: number;

  /** Recency score (0-1, higher = more recent). */
  recencyScore: number;

  /** Raw content of this chunk. */
  content: string;

  /** Normalized content (lowercase, stripped formatting) for lexical search. */
  normalizedContent: string;

  /** Anchor terms extracted from the chunk (headings, bold, code tokens). */
  anchorTerms: string[];

  /** Outbound links found in this chunk. */
  outboundLinks: string[];
}

/**
 * Relationship between two chunks.
 *
 * @category Models
 */
export type ChunkRelationType =
  | "contains"
  | "references"
  | "duplicates"
  | "derived-from";

/**
 * A directional relationship between chunks.
 *
 * @category Models
 */
export interface ChunkRelation {
  /** Source chunk. */
  fromChunkId: string;

  /** Target chunk. */
  toChunkId: string;

  /** Relationship type. */
  relationType: ChunkRelationType;
}
