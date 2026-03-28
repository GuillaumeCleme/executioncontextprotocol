/**
 * Retrieval result models.
 *
 * These types represent the output of the retrieval pipeline,
 * including scored candidates and assembled context packs.
 *
 * @category Models
 */

/** Memory mode for retrieval. */
export type MemoryMode = "short-term" | "long-term" | "hybrid";

/** Query intent classification. */
export type QueryIntent =
  | "skill-lookup"
  | "episodic-memory"
  | "behavior-policy"
  | "troubleshooting"
  | "factual-reference"
  | "broad-recall"
  | "short-term-context"
  | "long-term-recall";

/** Context budget size category. */
export type BudgetSize = "tiny" | "medium" | "large";

/** Ranking profile for different retrieval personas. */
export type RankingProfile =
  | "skill-profile"
  | "memory-profile"
  | "behavior-profile"
  | "short-term-profile"
  | "hybrid-profile";

/**
 * A scored retrieval candidate.
 *
 * @category Models
 */
export interface RetrievalCandidate {
  /** Source chunk or memory record identifier. */
  sourceId: string;

  /** Type of source. */
  sourceType: "chunk" | "memory" | "conversation";

  /** Combined relevance score (0-1). */
  score: number;

  /** Content text of the candidate. */
  content: string;

  /** Token estimate for this candidate. */
  tokenEstimate: number;

  /** Heading path (for chunk sources). */
  headingPath?: string;

  /** Document title (for chunk sources). */
  documentTitle?: string;

  /** Individual score components for explainability. */
  scoreBreakdown?: ScoreBreakdown;
}

/**
 * Breakdown of scoring signals for a candidate.
 *
 * @category Models
 */
export interface ScoreBreakdown {
  /** Lexical / full-text search score. */
  lexicalScore?: number;

  /** Heading or title match score. */
  headingScore?: number;

  /** Document importance score. */
  documentImportanceScore?: number;

  /** Recency score. */
  recencyScore?: number;

  /** Semantic similarity score. */
  semanticScore?: number;

  /** Link authority score. */
  linkAuthorityScore?: number;

  /** Exact anchor term match bonus. */
  anchorMatchBonus?: number;

  /** Short-term session relevance score. */
  sessionRelevanceScore?: number;
}

/**
 * A budget-shaped context pack assembled from retrieval results.
 *
 * @category Models
 */
export interface ContextPack {
  /** Query that produced this pack. */
  query: string;

  /** Token budget this pack was assembled for. */
  budgetTokens: number;

  /** Actual token estimate of the assembled content. */
  usedTokens: number;

  /** Ordered list of content blocks included in the pack. */
  items: ContextPackItem[];

  /** Memory mode used. */
  memoryMode: MemoryMode;

  /** Provenance metadata for debugging and auditing. */
  provenance: RetrievalProvenance;
}

/**
 * A single item in a context pack.
 *
 * @category Models
 */
export interface ContextPackItem {
  /** Content text. */
  content: string;

  /** Token estimate. */
  tokenEstimate: number;

  /** Source identifier. */
  sourceId: string;

  /** Source type. */
  sourceType: "chunk" | "memory" | "conversation";

  /** Relevance score. */
  score: number;

  /** Optional heading path for provenance. */
  headingPath?: string;

  /** Optional document title for provenance. */
  documentTitle?: string;
}

/**
 * Provenance metadata for retrieval explainability.
 *
 * @category Models
 */
export interface RetrievalProvenance {
  /** Total candidates considered. */
  candidatesConsidered: number;

  /** Candidates included in the final pack. */
  candidatesIncluded: number;

  /** Retrieval channels used. */
  channels: string[];

  /** Ranking profile applied. */
  rankingProfile: RankingProfile;

  /** Time taken for retrieval in milliseconds. */
  retrievalMs: number;
}
