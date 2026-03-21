/**
 * @category Secrets
 */

import type {
  SecretProvider,
  SecretProviderCapabilities,
  SecretProviderHealth,
  SecretRef,
  SecretStoreInput,
  SecretValueResult,
} from "@executioncontrolprotocol/plugins";
import { redactSecret } from "../redaction.js";

const store = new Map<string, string>();

/**
 * In-memory provider for unit tests (not secure).
 */
export class MemorySecretProvider implements SecretProvider {
  readonly id = "memory";
  readonly displayName = "Memory (tests only)";

  async isAvailable(): Promise<boolean> {
    return true;
  }

  capabilities(): SecretProviderCapabilities {
    return {
      secureAtRest: false,
      interactiveUnlock: false,
      headlessSupported: true,
      persistent: false,
      supportsList: true,
      supportsDelete: true,
      supportsMetadata: false,
    };
  }

  async healthCheck(): Promise<SecretProviderHealth> {
    return { ok: true, providerId: this.id };
  }

  async store(input: SecretStoreInput): Promise<void> {
    store.set(input.ref.key, input.value);
  }

  async load(ref: SecretRef): Promise<SecretValueResult | null> {
    const v = store.get(ref.key);
    if (v === undefined) return null;
    return { value: v, redactedPreview: redactSecret(v) };
  }

  async delete(ref: SecretRef): Promise<void> {
    store.delete(ref.key);
  }

  async list(): Promise<SecretRef[]> {
    return [...store.keys()].map((key) => ({
      id: `ecp://memory/${key}`,
      provider: this.id,
      key,
    }));
  }
}

/** Clear all entries (for test isolation). */
export function clearMemorySecretStore(): void {
  store.clear();
}
