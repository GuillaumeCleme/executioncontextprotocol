/**
 * Ephemeral in-process store for the `session` secret provider.
 *
 * @category Secrets
 */

const sessionSecrets = new Map<string, string>();

export function putCliSessionSecret(key: string, value: string): void {
  sessionSecrets.set(key, value);
}

export function getCliSessionSecret(key: string): string | undefined {
  return sessionSecrets.get(key);
}

export function deleteCliSessionSecret(key: string): void {
  sessionSecrets.delete(key);
}

export function clearCliSessionSecrets(): void {
  sessionSecrets.clear();
}

export function listCliSessionKeys(): string[] {
  return [...sessionSecrets.keys()];
}
