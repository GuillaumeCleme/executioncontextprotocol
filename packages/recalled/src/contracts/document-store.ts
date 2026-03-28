/**
 * Storage contract for document records.
 *
 * Implementations persist ingested documents and support lookup
 * by id, path, source, and change detection via checksum.
 *
 * @category Contracts
 */

import type { DocumentRecord, DocumentType } from "../models/document.js";

/**
 * Options for querying documents.
 *
 * @category Contracts
 */
export interface DocumentQueryOptions {
  /** Filter by source identifier. */
  sourceId?: string;

  /** Filter by document type. */
  docType?: DocumentType;

  /** Maximum number of results. */
  limit?: number;

  /** Offset for pagination. */
  offset?: number;
}

/**
 * Contract for document persistence.
 *
 * @category Contracts
 */
export interface DocumentStore {
  /** Get a document by id. */
  getById(docId: string): Promise<DocumentRecord | undefined>;

  /** Get a document by path within a source. */
  getByPath(sourceId: string, path: string): Promise<DocumentRecord | undefined>;

  /** Query documents with optional filters. */
  query(options?: DocumentQueryOptions): Promise<DocumentRecord[]>;

  /** Insert or update a document. */
  upsert(doc: DocumentRecord): Promise<void>;

  /** Delete a document and return whether it existed. */
  delete(docId: string): Promise<boolean>;

  /** Check if a document has changed by comparing checksums. */
  hasChanged(docId: string, checksum: string): Promise<boolean>;

  /** Count documents matching optional filters. */
  count(options?: DocumentQueryOptions): Promise<number>;
}
