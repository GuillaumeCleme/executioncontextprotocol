/**
 * OS-native credential storage via `@napi-rs/keyring` (macOS, Windows, Linux where supported).
 *
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
import { ECP_KEYRING_SERVICE } from "../constants.js";
import { normalizeOsKeychainAccountKey } from "../os-keychain-account-key.js";
import { OS_PROVIDER_ID } from "../provider-ids.js";
import { redactSecret } from "../redaction.js";

export class OsKeychainSecretProvider implements SecretProvider {
  readonly id = OS_PROVIDER_ID;
  readonly displayName = "OS keychain / credential manager";

  async isAvailable(): Promise<boolean> {
    try {
      const { Entry } = await import("@napi-rs/keyring");
      const entry = new Entry(ECP_KEYRING_SERVICE, "__ecp_availability_probe__");
      try {
        entry.getPassword();
      } catch {
        // NoEntry is expected
      }
      return true;
    } catch {
      return false;
    }
  }

  capabilities(): SecretProviderCapabilities {
    return {
      secureAtRest: true,
      interactiveUnlock: true,
      headlessSupported: true,
      persistent: true,
      supportsList: true,
      supportsDelete: true,
      supportsMetadata: false,
    };
  }

  async healthCheck(): Promise<SecretProviderHealth> {
    const ok = await this.isAvailable();
    return {
      ok,
      providerId: this.id,
      message: ok ? undefined : "Keyring native module unavailable on this platform",
    };
  }

  async store(input: SecretStoreInput): Promise<void> {
    const { Entry } = await import("@napi-rs/keyring");
    const account = normalizeOsKeychainAccountKey(input.ref.key);
    const entry = new Entry(ECP_KEYRING_SERVICE, account);
    entry.setPassword(input.value);
  }

  async load(ref: SecretRef): Promise<SecretValueResult | null> {
    try {
      const { Entry } = await import("@napi-rs/keyring");
      const account = normalizeOsKeychainAccountKey(ref.key);
      const entry = new Entry(ECP_KEYRING_SERVICE, account);
      const password = entry.getPassword();
      if (password == null || password === "") return null;
      return { value: password, redactedPreview: redactSecret(password) };
    } catch {
      return null;
    }
  }

  async delete(ref: SecretRef): Promise<void> {
    const { Entry } = await import("@napi-rs/keyring");
    const account = normalizeOsKeychainAccountKey(ref.key);
    const entry = new Entry(ECP_KEYRING_SERVICE, account);
    try {
      entry.deletePassword();
    } catch {
      // ignore missing
    }
  }

  async list(): Promise<SecretRef[]> {
    try {
      const { findCredentials } = await import("@napi-rs/keyring");
      const creds = findCredentials(ECP_KEYRING_SERVICE);
      return creds.map((c) => ({
        id: `ecp://${this.id}/${c.account}`,
        provider: this.id,
        key: c.account,
      }));
    } catch {
      return [];
    }
  }
}
