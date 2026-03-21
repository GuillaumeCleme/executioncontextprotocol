import { describe, expect, it, vi, beforeEach } from "vitest";

import { OS_PROVIDER_ID } from "../../../src/secrets/provider-ids.js";
import { OsKeychainSecretProvider } from "../../../src/secrets/providers/os-keychain-secret-provider.js";
import { ECP_KEYRING_SERVICE } from "../../../src/secrets/constants.js";
import type { SecretRef, SecretStoreInput } from "@executioncontrolprotocol/plugins";

const { mockKeyringStore } = vi.hoisted(() => ({
  mockKeyringStore: new Map<string, string>(),
}));

vi.mock("@napi-rs/keyring", () => {
  return {
    Entry: class MockEntry {
      constructor(
        private service: string,
        private account: string,
      ) {}
      setPassword(password: string): void {
        mockKeyringStore.set(`${this.service}:${this.account}`, password);
      }
      getPassword(): string | null {
        return mockKeyringStore.get(`${this.service}:${this.account}`) ?? null;
      }
      deletePassword(): void {
        mockKeyringStore.delete(`${this.service}:${this.account}`);
      }
    },
    findCredentials: (service: string) => {
      const creds: Array<{ account: string }> = [];
      for (const key of mockKeyringStore.keys()) {
        const [svc, account] = key.split(":");
        if (svc === service) {
          creds.push({ account });
        }
      }
      return creds;
    },
  };
});

describe("OsKeychainSecretProvider", () => {
  let provider: OsKeychainSecretProvider;

  beforeEach(() => {
    mockKeyringStore.clear();
    provider = new OsKeychainSecretProvider();
  });

  it("has correct id and display name", () => {
    expect(provider.id).toBe(OS_PROVIDER_ID);
    expect(provider.displayName).toBe("OS keychain / credential manager");
  });

  it("is available when keyring module works", async () => {
    expect(await provider.isAvailable()).toBe(true);
  });

  it("has correct capabilities", () => {
    const caps = provider.capabilities();
    expect(caps.secureAtRest).toBe(true);
    expect(caps.interactiveUnlock).toBe(true);
    expect(caps.headlessSupported).toBe(true);
    expect(caps.persistent).toBe(true);
    expect(caps.supportsList).toBe(true);
    expect(caps.supportsDelete).toBe(true);
  });

  it("returns healthy status when available", async () => {
    const health = await provider.healthCheck();
    expect(health.ok).toBe(true);
    expect(health.providerId).toBe(OS_PROVIDER_ID);
  });

  it("stores and loads secrets using normalized ecp.* account keys", async () => {
    const input: SecretStoreInput = {
      ref: {
        id: `ecp://${OS_PROVIDER_ID}/test-key`,
        provider: OS_PROVIDER_ID,
        key: "test-key",
      },
      value: "secret-value",
    };
    await provider.store(input);

    const ref: SecretRef = {
      id: `ecp://${OS_PROVIDER_ID}/test-key`,
      provider: OS_PROVIDER_ID,
      key: "test-key",
    };
    const result = await provider.load(ref);
    expect(result).not.toBeNull();
    expect(result!.value).toBe("secret-value");
    expect(result!.redactedPreview).not.toContain("secret-value");
    expect(mockKeyringStore.has(`${ECP_KEYRING_SERVICE}:ecp.test-key`)).toBe(true);
  });

  it("returns null for missing secret", async () => {
    const ref: SecretRef = {
      id: `ecp://${OS_PROVIDER_ID}/missing`,
      provider: OS_PROVIDER_ID,
      key: "missing",
    };
    const result = await provider.load(ref);
    expect(result).toBeNull();
  });

  it("deletes secrets", async () => {
    const input: SecretStoreInput = {
      ref: {
        id: `ecp://${OS_PROVIDER_ID}/delete-test`,
        provider: OS_PROVIDER_ID,
        key: "delete-test",
      },
      value: "to-delete",
    };
    await provider.store(input);
    expect(await provider.load(input.ref)).not.toBeNull();

    await provider.delete(input.ref);
    expect(await provider.load(input.ref)).toBeNull();
  });

  it("lists stored secrets with physical keyring account names", async () => {
    const input1: SecretStoreInput = {
      ref: {
        id: `ecp://${OS_PROVIDER_ID}/list-key1`,
        provider: OS_PROVIDER_ID,
        key: "list-key1",
      },
      value: "value1",
    };
    const input2: SecretStoreInput = {
      ref: {
        id: `ecp://${OS_PROVIDER_ID}/list-key2`,
        provider: OS_PROVIDER_ID,
        key: "list-key2",
      },
      value: "value2",
    };
    await provider.store(input1);
    await provider.store(input2);

    const list = await provider.list();
    expect(list.length).toBe(2);
    const keys = list.map((r) => r.key);
    expect(keys).toContain("ecp.list-key1");
    expect(keys).toContain("ecp.list-key2");
    expect(list.every((r) => r.provider === OS_PROVIDER_ID)).toBe(true);
    expect(list.every((r) => r.id.startsWith(`ecp://${OS_PROVIDER_ID}/`))).toBe(true);
  });

  it("uses ECP_KEYRING_SERVICE for storage", async () => {
    const input: SecretStoreInput = {
      ref: {
        id: `ecp://${OS_PROVIDER_ID}/service-test`,
        provider: OS_PROVIDER_ID,
        key: "service-test",
      },
      value: "test",
    };
    await provider.store(input);

    const { findCredentials } = await import("@napi-rs/keyring");
    const creds = findCredentials(ECP_KEYRING_SERVICE);
    expect(creds.some((c) => c.account === "ecp.service-test")).toBe(true);
  });

  it("redacts secret value in preview", async () => {
    const input: SecretStoreInput = {
      ref: {
        id: `ecp://${OS_PROVIDER_ID}/redact-test`,
        provider: OS_PROVIDER_ID,
        key: "redact-test",
      },
      value: "very-long-secret-value-that-should-be-redacted",
    };
    await provider.store(input);

    const result = await provider.load(input.ref);
    expect(result).not.toBeNull();
    expect(result!.redactedPreview).not.toContain("very-long-secret-value");
    expect(result!.redactedPreview.length).toBeLessThan(result!.value.length);
  });
});
