/**
 * Storage contract for short-term conversation memory.
 *
 * Implementations manage conversation turns and prompt state
 * for a session, optimized for recency and fast access.
 *
 * @category Contracts
 */

import type { ConversationTurn, PromptState } from "../models/conversation.js";

/**
 * Options for querying conversation turns.
 *
 * @category Contracts
 */
export interface ConversationQueryOptions {
  /** Maximum number of turns to return. */
  maxTurns?: number;

  /** Maximum total tokens across returned turns. */
  maxTokens?: number;

  /** Filter by task scope. */
  taskScope?: string;

  /** Filter by tags. */
  tags?: string[];
}

/**
 * Contract for short-term conversation memory persistence.
 *
 * @category Contracts
 */
export interface ConversationStore {
  /** Add a conversation turn. */
  addTurn(turn: ConversationTurn): Promise<void>;

  /** Get recent turns for a session, ordered newest first. */
  getTurns(sessionId: string, options?: ConversationQueryOptions): Promise<ConversationTurn[]>;

  /** Get the current prompt state for a session. */
  getPromptState(sessionId: string): Promise<PromptState | undefined>;

  /** Update the prompt state for a session. */
  setPromptState(state: PromptState): Promise<void>;

  /** Delete all turns for a session. */
  clearSession(sessionId: string): Promise<void>;

  /** Delete turns older than a timestamp within a session. */
  pruneOlderThan(sessionId: string, olderThan: string): Promise<number>;

  /** Close the store. */
  close(): Promise<void>;
}
