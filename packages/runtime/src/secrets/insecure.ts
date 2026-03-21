/**
 * @category Secrets
 */

import { DOT_PROVIDER_ID, ENV_PROVIDER_ID, SESSION_PROVIDER_ID } from "./provider-ids.js";

const INSECURE = new Set([ENV_PROVIDER_ID, DOT_PROVIDER_ID, SESSION_PROVIDER_ID]);

export function isInsecureSecretProvider(providerId: string): boolean {
  return INSECURE.has(providerId);
}
