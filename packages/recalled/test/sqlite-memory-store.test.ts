import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSqliteMemoryStore } from "../src/backends/sqlite/sqlite-memory-store.js";

describe("createSqliteMemoryStore (recalled)", () => {
  let dataDir: string;

  beforeEach(() => {
    dataDir = mkdtempSync(join(tmpdir(), "recalled-test-"));
  });

  afterEach(() => {
    rmSync(dataDir, { recursive: true, force: true });
  });

  it("creates a store and performs CRUD operations", async () => {
    const store = await createSqliteMemoryStore({ dataDir, namespace: "crud" });

    const rec = await store.put("context", "exec1", "User prefers dark mode", { theme: "dark" });
    expect(rec.id).toBeDefined();
    expect(rec.scope).toBe("context");
    expect(rec.summary).toBe("User prefers dark mode");

    const list = await store.get("context", { executorName: "exec1", maxItems: 10, summariesOnly: false });
    expect(list.length).toBe(1);
    expect(list[0].payload).toEqual({ theme: "dark" });

    const { deleted } = await store.delete("context", { id: rec.id });
    expect(deleted).toBe(1);

    const empty = await store.get("context", { executorName: "exec1", maxItems: 10 });
    expect(empty.length).toBe(0);

    await store.close();
  });

  it("respects maxItems", async () => {
    const store = await createSqliteMemoryStore({ dataDir, namespace: "max" });
    for (let i = 0; i < 5; i++) {
      await store.put("context", "e1", `Item ${i}`);
    }

    const list = await store.get("context", { executorName: "e1", maxItems: 2 });
    expect(list.length).toBe(2);
    await store.close();
  });

  it("persists across open/close", async () => {
    const config = { dataDir, namespace: "persist" };
    const store1 = await createSqliteMemoryStore(config);
    await store1.put("context", "e1", "Survives close");
    await store1.close();

    const store2 = await createSqliteMemoryStore(config);
    const list = await store2.get("context", { executorName: "e1", maxItems: 10 });
    expect(list.length).toBe(1);
    expect(list[0].summary).toBe("Survives close");
    await store2.close();
  });

  it("lists records", async () => {
    const store = await createSqliteMemoryStore({ dataDir, namespace: "list" });
    await store.put("context", "e1", "First");
    await store.put("context", "e1", "Second");

    const items = await store.list("context", { executorName: "e1", limit: 10 });
    expect(items.length).toBe(2);
    expect(items.every((x) => x.id && x.summary && x.createdAt)).toBe(true);
    await store.close();
  });

  it("deletes by olderThan", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      vi.setSystemTime(new Date("2024-06-01T12:00:00.000Z"));
      const store = await createSqliteMemoryStore({ dataDir, namespace: "older" });
      await store.put("context", "e1", "Old");
      vi.setSystemTime(new Date("2024-06-01T12:00:00.010Z"));
      const r2 = await store.put("context", "e1", "New");

      const result = await store.delete("context", { olderThan: r2.createdAt });
      expect(result.deleted).toBeGreaterThanOrEqual(1);
      await store.close();
    } finally {
      vi.useRealTimers();
    }
  });
});
