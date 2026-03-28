/**
 * In-memory conversation store for short-term memory.
 *
 * Stores conversation turns and prompt state in memory with no persistence.
 * Suitable for single-session use, tests, and ephemeral workloads.
 *
 * @category Backends
 */

import type { ConversationStore, ConversationQueryOptions } from "../../contracts/conversation-store.js";
import type { ConversationTurn, PromptState } from "../../models/conversation.js";

/**
 * Create an in-memory conversation store.
 *
 * @category Backends
 */
export function createInMemoryConversationStore(): ConversationStore {
  const sessions = new Map<string, ConversationTurn[]>();
  const states = new Map<string, PromptState>();

  return {
    async addTurn(turn: ConversationTurn): Promise<void> {
      const turns = sessions.get(turn.sessionId) ?? [];
      turns.push(turn);
      sessions.set(turn.sessionId, turns);
    },

    async getTurns(sessionId: string, options?: ConversationQueryOptions): Promise<ConversationTurn[]> {
      let turns = sessions.get(sessionId) ?? [];

      if (options?.taskScope) {
        turns = turns.filter((t) => t.taskScope === options.taskScope);
      }

      if (options?.tags?.length) {
        const tagSet = new Set(options.tags);
        turns = turns.filter((t) => t.tags?.some((tag) => tagSet.has(tag)));
      }

      turns = [...turns].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      if (options?.maxTurns) {
        turns = turns.slice(0, options.maxTurns);
      }

      if (options?.maxTokens) {
        const result: ConversationTurn[] = [];
        let totalTokens = 0;
        for (const turn of turns) {
          if (totalTokens + turn.tokenEstimate > options.maxTokens) break;
          result.push(turn);
          totalTokens += turn.tokenEstimate;
        }
        return result;
      }

      return turns;
    },

    async getPromptState(sessionId: string): Promise<PromptState | undefined> {
      return states.get(sessionId);
    },

    async setPromptState(state: PromptState): Promise<void> {
      states.set(state.sessionId, state);
    },

    async clearSession(sessionId: string): Promise<void> {
      sessions.delete(sessionId);
      states.delete(sessionId);
    },

    async pruneOlderThan(sessionId: string, olderThan: string): Promise<number> {
      const turns = sessions.get(sessionId);
      if (!turns) return 0;
      const cutoff = new Date(olderThan).getTime();
      const before = turns.length;
      const remaining = turns.filter((t) => new Date(t.timestamp).getTime() >= cutoff);
      sessions.set(sessionId, remaining);
      return before - remaining.length;
    },

    async close(): Promise<void> {
      sessions.clear();
      states.clear();
    },
  };
}
