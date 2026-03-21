/**
 * @category Secrets
 */

import type {
  RegisteredSecretProvider,
  SecretProvider,
  SecretProviderRegistry,
} from "@executioncontrolprotocol/plugins";

/**
 * In-memory registry of secret providers.
 */
export class DefaultSecretProviderRegistry implements SecretProviderRegistry {
  private readonly entries = new Map<string, RegisteredSecretProvider>();

  register(provider: SecretProvider, source: "builtin" | "plugin" = "builtin"): void {
    this.entries.set(provider.id, { provider, source });
  }

  get(providerId: string): SecretProvider | undefined {
    return this.entries.get(providerId)?.provider;
  }

  list(): RegisteredSecretProvider[] {
    return [...this.entries.values()];
  }
}
