import { describe, expect, it, beforeEach } from "vitest";

import { DefaultSecretBroker } from "../../src/secrets/broker.js";
import { DefaultSecretProviderRegistry } from "../../src/secrets/registry.js";
import { registerBuiltinSecretProviders } from "../../src/secrets/builtin.js";
import { clearMemorySecretStore } from "../../src/secrets/providers/memory-secret-provider.js";
import type { SecretRef, ToolServerCredentialBinding } from "@executioncontrolprotocol/plugins";

describe("DefaultSecretBroker", () => {
  beforeEach(() => {
    clearMemorySecretStore();
  });

  it("resolves memory provider secrets", async () => {
    const registry = new DefaultSecretProviderRegistry();
    registerBuiltinSecretProviders(registry);
    const broker = new DefaultSecretBroker(registry, "permissive");
    const mem = registry.get("memory")!;
    await mem.store!({
      ref: { id: "ecp://memory/k", provider: "memory", key: "k" },
      value: "top-secret-value",
    });
    const ref: SecretRef = { id: "ecp://memory/k", provider: "memory", key: "k" };
    const r = await broker.resolve(ref);
    expect(r.value).toBe("top-secret-value");
    expect(r.redactedPreview).not.toContain("top-secret");
  });

  it("resolveBindingsToEnv maps binding names", async () => {
    const registry = new DefaultSecretProviderRegistry();
    registerBuiltinSecretProviders(registry);
    const broker = new DefaultSecretBroker(registry, "permissive");
    const mem = registry.get("memory")!;
    await mem.store!({
      ref: { id: "ecp://memory/tok", provider: "memory", key: "tok" },
      value: "abc123",
    });
    const bindings: ToolServerCredentialBinding[] = [
      {
        name: "TOKEN",
        source: { provider: "memory", key: "tok" },
        required: true,
        delivery: "env",
      },
    ];
    const { env, warnings } = await broker.resolveBindingsToEnv(bindings);
    expect(env.TOKEN).toBe("abc123");
    expect(warnings.length).toBe(0);
  });

  it("strict policy rejects insecure provider without allowInsecure", async () => {
    const registry = new DefaultSecretProviderRegistry();
    registerBuiltinSecretProviders(registry);
    const broker = new DefaultSecretBroker(registry, "strict");
    const binding: ToolServerCredentialBinding = {
      name: "X",
      source: { provider: "memory", key: "x" },
      required: false,
    };
    await expect(broker.resolveBinding(binding)).rejects.toThrow(/strict/);
  });
});
