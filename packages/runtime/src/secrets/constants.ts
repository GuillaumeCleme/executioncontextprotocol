/**
 * Service name for OS credential stores (macOS Keychain, Windows Credential Manager, etc.).
 * All ECP keyring entries use this service; the {@link SecretRef.key} is the account/username.
 *
 * @category Secrets
 */
export const ECP_KEYRING_SERVICE = "ecp";
