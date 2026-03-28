/**
 * Document model for long-term memory.
 *
 * Represents a source document (markdown file, skill package, etc.)
 * that has been ingested into the memory system.
 *
 * @category Models
 */

/** Classification of a document's primary purpose. */
export type DocumentType =
  | "skill"
  | "memory-note"
  | "behavior-policy"
  | "runbook"
  | "reference"
  | "package-doc";

/**
 * A single ingested document record.
 *
 * @category Models
 */
export interface DocumentRecord {
  /** Unique document identifier. */
  docId: string;

  /** Source identifier (vault name, package name, repo URL). */
  sourceId: string;

  /** Relative path within the source. */
  path: string;

  /** Optional URI for remote or linked sources. */
  uri?: string;

  /** Document title (from H1 or frontmatter). */
  title: string;

  /** Parsed frontmatter as JSON. */
  frontmatter?: Record<string, unknown>;

  /** Document type classification. */
  docType: DocumentType;

  /** Content hash for change detection. */
  checksum: string;

  /** ISO-8601 timestamp of last update. */
  updatedAt: string;

  /** ISO-8601 timestamp of creation. */
  createdAt: string;

  /** Total word count of the document. */
  wordCount: number;

  /** Serialized heading tree structure. */
  headingTree?: HeadingNode[];
}

/**
 * A node in the document heading tree.
 *
 * @category Models
 */
export interface HeadingNode {
  /** Heading level (1-6). */
  level: number;

  /** Heading text. */
  text: string;

  /** Child headings. */
  children: HeadingNode[];
}
