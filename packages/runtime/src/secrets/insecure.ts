/**
 * @category Secrets
 */

const INSECURE = new Set(["env", "dotenv", "cli-session", "memory"]);

export function isInsecureSecretProvider(providerId: string): boolean {
  return INSECURE.has(providerId);
}
