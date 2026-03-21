/**
 * Canonical short ids for built-in secret providers (CLI `--provider`, config `source.provider`, registry).
 *
 * @category Secrets
 */

/** OS credential manager / keychain (Windows Credential Manager, macOS Keychain, …). */
export const OS_PROVIDER_ID = "os";

/** Current process environment (`process.env`). */
export const ENV_PROVIDER_ID = "env";

/** `.env` file (path from config or cwd). */
export const DOT_PROVIDER_ID = "dot";

/** Ephemeral secrets for the current CLI process only. */
export const SESSION_PROVIDER_ID = "session";
