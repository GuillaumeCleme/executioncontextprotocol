/**
 * @category Secrets
 */

/**
 * Redact a secret for logs and CLI output (never log raw values).
 */
export function redactSecret(value: string): string {
  if (value.length <= 8) return "****";
  return `${value.slice(0, 2)}****${value.slice(-4)}`;
}
