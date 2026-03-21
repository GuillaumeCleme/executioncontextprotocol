/**
 * OS keychain account naming — dotted `ecp.*` namespace for Credential Manager / Keychain.
 *
 * @category Secrets
 */

import { ECP_KEYRING_ACCOUNT_PREFIX } from "./constants.js";

/**
 * Map a config/CLI secret key to the physical keyring account name.
 *
 * - Legacy path-style `ecp/foo/bar` becomes `ecp.foo.bar`
 * - `/` is normalized to `.`
 * - Ensures a leading {@link ECP_KEYRING_ACCOUNT_PREFIX} (`ecp.`)
 */
export function normalizeOsKeychainAccountKey(key: string): string {
  let k = key.trim().replace(/\\/g, "/");
  if (k.startsWith("ecp/")) {
    k = k.slice(4);
  }
  k = k.replace(/\//g, ".");
  if (!k.startsWith(ECP_KEYRING_ACCOUNT_PREFIX)) {
    k = `${ECP_KEYRING_ACCOUNT_PREFIX}${k}`;
  }
  return k;
}
