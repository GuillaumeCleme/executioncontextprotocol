/**
 * Service name for OS credential stores (macOS Keychain, Windows Credential Manager, etc.).
 * All ECP keyring entries use this service; account names use `normalizeOsKeychainAccountKey` (dotted `ecp.*`).
 *
 * @category Secrets
 */
export const ECP_KEYRING_SERVICE = "ecp";

/**
 * Required prefix for keyring account names after normalization (dotted namespace).
 *
 * @category Secrets
 */
export const ECP_KEYRING_ACCOUNT_PREFIX = "ecp.";
