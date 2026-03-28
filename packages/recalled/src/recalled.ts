/**
 * Recalled — main entry point and public API facade.
 *
 * Provides a unified interface over long-term and short-term memory,
 * with backend-agnostic storage and budget-aware retrieval.
 *
 * @category Core
 */

import type { LongTermMemoryStore } from "./contracts/memory-store.js";
import type { ConversationStore } from "./contracts/conversation-store.js";
import type {
  MemoryRecord,
  MemoryScope,
  MemoryGetOptions,
  MemoryListOptions,
  MemoryDeleteOptions,
} from "./models/memory.js";
import type { ConversationTurn, PromptState } from "./models/conversation.js";
import type { ConversationQueryOptions } from "./contracts/conversation-store.js";
import type { MemoryMode } from "./models/retrieval.js";

/**
 * Configuration for the Recalled instance.
 *
 * @category Core
 */
export interface RecalledConfig {
  /** Long-term memory store implementation. */
  longTermStore: LongTermMemoryStore;

  /** Short-term conversation store implementation. */
  shortTermStore: ConversationStore;
}

/**
 * Query options for the unified query API.
 *
 * @category Core
 */
export interface RecalledQueryOptions {
  /** Maximum total tokens for the response. */
  budgetTokens?: number;

  /** Memory mode: short-term, long-term, or hybrid. */
  mode?: MemoryMode;

  /** Memory scope for long-term queries. */
  scope?: MemoryScope;

  /** Session id for short-term queries. */
  sessionId?: string;

  /** Executor name filter for long-term queries. */
  executorName?: string;
}

/**
 * Recalled instance providing unified memory operations.
 *
 * @category Core
 */
export class Recalled {
  private readonly longTerm: LongTermMemoryStore;
  private readonly shortTerm: ConversationStore;

  constructor(config: RecalledConfig) {
    this.longTerm = config.longTermStore;
    this.shortTerm = config.shortTermStore;
  }

  /**
   * Query long-term memory.
   */
  async queryLongTerm(
    scope: MemoryScope,
    options?: MemoryGetOptions,
  ): Promise<MemoryRecord[]> {
    return this.longTerm.get(scope, options);
  }

  /**
   * Query short-term conversation memory.
   */
  async queryShortTerm(
    sessionId: string,
    options?: ConversationQueryOptions,
  ): Promise<ConversationTurn[]> {
    return this.shortTerm.getTurns(sessionId, options);
  }

  /**
   * Unified query across memory modes.
   */
  async query(
    text: string,
    options?: RecalledQueryOptions,
  ): Promise<{ longTerm: MemoryRecord[]; shortTerm: ConversationTurn[] }> {
    const mode = options?.mode ?? "hybrid";
    const scope = options?.scope ?? "context";

    let longTermResults: MemoryRecord[] = [];
    let shortTermResults: ConversationTurn[] = [];

    if (mode === "long-term" || mode === "hybrid") {
      longTermResults = await this.longTerm.get(scope, {
        maxItems: options?.budgetTokens ? Math.min(20, Math.ceil(options.budgetTokens / 200)) : 20,
        maxTokens: options?.budgetTokens ? Math.floor(options.budgetTokens * (mode === "hybrid" ? 0.7 : 1.0)) : undefined,
        executorName: options?.executorName,
        summariesOnly: true,
      });
    }

    if ((mode === "short-term" || mode === "hybrid") && options?.sessionId) {
      shortTermResults = await this.shortTerm.getTurns(options.sessionId, {
        maxTokens: options?.budgetTokens ? Math.floor(options.budgetTokens * (mode === "hybrid" ? 0.3 : 1.0)) : undefined,
        maxTurns: 50,
      });
    }

    return { longTerm: longTermResults, shortTerm: shortTermResults };
  }

  /**
   * Store a long-term memory record.
   */
  async storeLongTerm(
    scope: MemoryScope,
    executorName: string,
    summary: string,
    payload?: Record<string, unknown>,
    id?: string,
  ): Promise<MemoryRecord> {
    return this.longTerm.put(scope, executorName, summary, payload, id);
  }

  /**
   * Add a conversation turn to short-term memory.
   */
  async addConversationTurn(turn: ConversationTurn): Promise<void> {
    return this.shortTerm.addTurn(turn);
  }

  /**
   * Get the prompt state for a session.
   */
  async getPromptState(sessionId: string): Promise<PromptState | undefined> {
    return this.shortTerm.getPromptState(sessionId);
  }

  /**
   * Update the prompt state for a session.
   */
  async setPromptState(state: PromptState): Promise<void> {
    return this.shortTerm.setPromptState(state);
  }

  /**
   * List long-term memories for inspection.
   */
  async listLongTerm(
    scope: MemoryScope,
    options?: MemoryListOptions,
  ): Promise<Pick<MemoryRecord, "id" | "summary" | "createdAt">[]> {
    return this.longTerm.list(scope, options);
  }

  /**
   * Delete long-term memories.
   */
  async deleteLongTerm(
    scope: MemoryScope,
    options?: MemoryDeleteOptions,
  ): Promise<{ deleted: number }> {
    return this.longTerm.delete(scope, options);
  }

  /**
   * Clear a short-term session.
   */
  async clearSession(sessionId: string): Promise<void> {
    return this.shortTerm.clearSession(sessionId);
  }

  /**
   * Get the underlying long-term store (for direct access or ECP runtime integration).
   */
  getLongTermStore(): LongTermMemoryStore {
    return this.longTerm;
  }

  /**
   * Get the underlying short-term store.
   */
  getShortTermStore(): ConversationStore {
    return this.shortTerm;
  }

  /**
   * Close both stores.
   */
  async close(): Promise<void> {
    await this.longTerm.close();
    await this.shortTerm.close();
  }
}
