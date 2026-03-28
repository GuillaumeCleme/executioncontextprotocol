import { describe, it, expect } from "vitest";
import { createInMemoryConversationStore } from "../src/backends/memory/in-memory-conversation-store.js";
import type { ConversationTurn, PromptState } from "../src/models/conversation.js";

function makeTurn(overrides: Partial<ConversationTurn> = {}): ConversationTurn {
  return {
    turnId: crypto.randomUUID(),
    sessionId: "session-1",
    role: "user",
    content: "Hello",
    tokenEstimate: 5,
    timestamp: new Date().toISOString(),
    importanceScore: 0.5,
    ...overrides,
  };
}

describe("InMemoryConversationStore", () => {
  it("adds and retrieves turns", async () => {
    const store = createInMemoryConversationStore();
    const turn = makeTurn();
    await store.addTurn(turn);

    const turns = await store.getTurns("session-1");
    expect(turns.length).toBe(1);
    expect(turns[0].content).toBe("Hello");
    await store.close();
  });

  it("returns turns ordered newest first", async () => {
    const store = createInMemoryConversationStore();
    await store.addTurn(makeTurn({ timestamp: "2024-01-01T00:00:00Z", content: "First" }));
    await store.addTurn(makeTurn({ timestamp: "2024-01-01T01:00:00Z", content: "Second" }));

    const turns = await store.getTurns("session-1");
    expect(turns[0].content).toBe("Second");
    expect(turns[1].content).toBe("First");
    await store.close();
  });

  it("respects maxTurns", async () => {
    const store = createInMemoryConversationStore();
    for (let i = 0; i < 5; i++) {
      await store.addTurn(makeTurn({
        timestamp: `2024-01-01T0${i}:00:00Z`,
        content: `Turn ${i}`,
      }));
    }

    const turns = await store.getTurns("session-1", { maxTurns: 2 });
    expect(turns.length).toBe(2);
    await store.close();
  });

  it("respects maxTokens budget", async () => {
    const store = createInMemoryConversationStore();
    await store.addTurn(makeTurn({ timestamp: "2024-01-01T00:00:00Z", tokenEstimate: 100 }));
    await store.addTurn(makeTurn({ timestamp: "2024-01-01T01:00:00Z", tokenEstimate: 100 }));
    await store.addTurn(makeTurn({ timestamp: "2024-01-01T02:00:00Z", tokenEstimate: 100 }));

    const turns = await store.getTurns("session-1", { maxTokens: 200 });
    expect(turns.length).toBe(2);
    await store.close();
  });

  it("filters by taskScope", async () => {
    const store = createInMemoryConversationStore();
    await store.addTurn(makeTurn({ taskScope: "coding" }));
    await store.addTurn(makeTurn({ taskScope: "review" }));

    const turns = await store.getTurns("session-1", { taskScope: "coding" });
    expect(turns.length).toBe(1);
    await store.close();
  });

  it("manages prompt state", async () => {
    const store = createInMemoryConversationStore();

    const state: PromptState = {
      stateId: "state-1",
      sessionId: "session-1",
      activeGoal: "Fix the bug",
      activeEntities: ["user", "server"],
      lastUpdatedAt: new Date().toISOString(),
    };

    await store.setPromptState(state);
    const retrieved = await store.getPromptState("session-1");
    expect(retrieved).toBeDefined();
    expect(retrieved!.activeGoal).toBe("Fix the bug");
    expect(retrieved!.activeEntities).toEqual(["user", "server"]);
    await store.close();
  });

  it("clears a session", async () => {
    const store = createInMemoryConversationStore();
    await store.addTurn(makeTurn());
    await store.setPromptState({
      stateId: "s1",
      sessionId: "session-1",
      lastUpdatedAt: new Date().toISOString(),
    });

    await store.clearSession("session-1");

    const turns = await store.getTurns("session-1");
    expect(turns.length).toBe(0);
    const state = await store.getPromptState("session-1");
    expect(state).toBeUndefined();
    await store.close();
  });

  it("prunes old turns", async () => {
    const store = createInMemoryConversationStore();
    await store.addTurn(makeTurn({ timestamp: "2024-01-01T00:00:00Z" }));
    await store.addTurn(makeTurn({ timestamp: "2024-06-01T00:00:00Z" }));

    const pruned = await store.pruneOlderThan("session-1", "2024-03-01T00:00:00Z");
    expect(pruned).toBe(1);

    const turns = await store.getTurns("session-1");
    expect(turns.length).toBe(1);
    await store.close();
  });
});
