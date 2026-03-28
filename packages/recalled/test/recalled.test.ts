import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Recalled } from "../src/recalled.js";
import { createSqliteMemoryStore } from "../src/backends/sqlite/sqlite-memory-store.js";
import { createInMemoryConversationStore } from "../src/backends/memory/in-memory-conversation-store.js";

describe("Recalled", () => {
  let dataDir: string;
  let recalled: Recalled;

  beforeEach(async () => {
    dataDir = mkdtempSync(join(tmpdir(), "recalled-facade-"));
    const longTermStore = await createSqliteMemoryStore({ dataDir, namespace: "test" });
    const shortTermStore = createInMemoryConversationStore();
    recalled = new Recalled({ longTermStore, shortTermStore });
  });

  afterEach(async () => {
    await recalled.close();
    rmSync(dataDir, { recursive: true, force: true });
  });

  it("stores and queries long-term memory", async () => {
    await recalled.storeLongTerm("context", "agent", "User prefers TypeScript");

    const results = await recalled.queryLongTerm("context", { executorName: "agent", maxItems: 10 });
    expect(results.length).toBe(1);
    expect(results[0].summary).toBe("User prefers TypeScript");
  });

  it("adds and queries short-term conversation", async () => {
    await recalled.addConversationTurn({
      turnId: "t1",
      sessionId: "s1",
      role: "user",
      content: "What is ECP?",
      tokenEstimate: 10,
      timestamp: new Date().toISOString(),
      importanceScore: 0.8,
    });

    const turns = await recalled.queryShortTerm("s1");
    expect(turns.length).toBe(1);
    expect(turns[0].content).toBe("What is ECP?");
  });

  it("supports hybrid query across both memory types", async () => {
    await recalled.storeLongTerm("context", "agent", "ECP is an execution protocol");
    await recalled.addConversationTurn({
      turnId: "t1",
      sessionId: "s1",
      role: "user",
      content: "Tell me about ECP",
      tokenEstimate: 10,
      timestamp: new Date().toISOString(),
      importanceScore: 0.9,
    });

    const result = await recalled.query("ECP", {
      mode: "hybrid",
      scope: "context",
      sessionId: "s1",
      executorName: "agent",
    });

    expect(result.longTerm.length).toBe(1);
    expect(result.shortTerm.length).toBe(1);
  });

  it("supports long-term only query", async () => {
    await recalled.storeLongTerm("context", "agent", "Important fact");

    const result = await recalled.query("fact", {
      mode: "long-term",
      scope: "context",
      executorName: "agent",
    });

    expect(result.longTerm.length).toBe(1);
    expect(result.shortTerm.length).toBe(0);
  });

  it("manages prompt state", async () => {
    await recalled.setPromptState({
      stateId: "ps1",
      sessionId: "s1",
      activeGoal: "Debug issue",
      lastUpdatedAt: new Date().toISOString(),
    });

    const state = await recalled.getPromptState("s1");
    expect(state).toBeDefined();
    expect(state!.activeGoal).toBe("Debug issue");
  });

  it("lists and deletes long-term memories", async () => {
    await recalled.storeLongTerm("context", "agent", "Memory one");
    await recalled.storeLongTerm("context", "agent", "Memory two");

    const items = await recalled.listLongTerm("context", { executorName: "agent" });
    expect(items.length).toBe(2);

    const { deleted } = await recalled.deleteLongTerm("context", { id: items[0].id });
    expect(deleted).toBe(1);

    const remaining = await recalled.listLongTerm("context", { executorName: "agent" });
    expect(remaining.length).toBe(1);
  });

  it("clears short-term session", async () => {
    await recalled.addConversationTurn({
      turnId: "t1",
      sessionId: "s1",
      role: "user",
      content: "Hello",
      tokenEstimate: 5,
      timestamp: new Date().toISOString(),
      importanceScore: 0.5,
    });

    await recalled.clearSession("s1");

    const turns = await recalled.queryShortTerm("s1");
    expect(turns.length).toBe(0);
  });

  it("exposes underlying stores", () => {
    expect(recalled.getLongTermStore()).toBeDefined();
    expect(recalled.getShortTermStore()).toBeDefined();
  });
});
