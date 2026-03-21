/**
 * @category Secrets
 */

import type {
  SecretProvider,
  SecretProviderCapabilities,
  SecretProviderHealth,
  SecretRef,
  SecretValueResult,
} from "@executioncontrolprotocol/plugins";
import { ENV_PROVIDER_ID } from "../provider-ids.js";
import { redactSecret } from "../redaction.js";

/**
 * Read-only provider: loads from `process.env[ref.key]`.
 */
export class EnvSecretProvider implements SecretProvider {
  readonly id = ENV_PROVIDER_ID;
  readonly displayName = "Process environment";

  async isAvailable(): Promise<boolean> {
    return true;
  }

  capabilities(): SecretProviderCapabilities {
    return {
      secureAtRest: false,
      interactiveUnlock: false,
      headlessSupported: true,
      persistent: false,
      supportsList: false,
      supportsDelete: false,
      supportsMetadata: false,
    };
  }

  async healthCheck(): Promise<SecretProviderHealth> {
    return { ok: true, providerId: this.id };
  }

  async load(ref: SecretRef): Promise<SecretValueResult | null> {
    const v = process.env[ref.key];
    if (v === undefined || v === "") return null;
    return { value: v, redactedPreview: redactSecret(v) };
  }
}
