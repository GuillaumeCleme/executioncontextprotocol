/**
 * Short-term memory models for conversation and prompt state.
 *
 * Short-term memory is transient working memory: prompt context,
 * conversation history, task state. Optimized for recency and
 * fast access rather than durable document recall.
 *
 * @category Models
 */

/**
 * A single conversation turn in short-term memory.
 *
 * @category Models
 */
export interface ConversationTurn {
  /** Unique turn identifier. */
  turnId: string;

  /** Session identifier grouping related turns. */
  sessionId: string;

  /** Message role. */
  role: "system" | "user" | "assistant" | "tool";

  /** Message content. */
  content: string;

  /** Estimated token count. */
  tokenEstimate: number;

  /** ISO-8601 timestamp. */
  timestamp: string;

  /** Importance score (0-1, higher = more relevant to keep). */
  importanceScore: number;

  /** Task or goal scope this turn belongs to. */
  taskScope?: string;

  /** Ephemeral tags for filtering. */
  tags?: string[];
}

/**
 * Active prompt state for a session.
 *
 * @category Models
 */
export interface PromptState {
  /** Unique state identifier. */
  stateId: string;

  /** Session this state belongs to. */
  sessionId: string;

  /** Current active goal or task. */
  activeGoal?: string;

  /** Active constraints as structured data. */
  activeConstraints?: Record<string, unknown>;

  /** Active entities mentioned in the conversation. */
  activeEntities?: string[];

  /** ISO-8601 last update timestamp. */
  lastUpdatedAt: string;
}
