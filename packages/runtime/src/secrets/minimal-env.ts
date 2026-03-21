/**
 * Minimal environment variables for MCP stdio children (avoid full process.env inheritance).
 *
 * @category Secrets
 */

const SAFE_KEYS = [
  "PATH",
  "PATHEXT",
  "NODE_OPTIONS",
  "SystemRoot",
  "TEMP",
  "TMP",
  "HOME",
  "USERPROFILE",
  "LANG",
  "LC_ALL",
  "APPDATA",
  "LOCALAPPDATA",
  "ProgramFiles",
  "ProgramFiles(x86)",
  "ComSpec",
] as const;

/**
 * Copy a small allow-list from the current process into a fresh env object.
 */
export function buildMinimalStdioEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of SAFE_KEYS) {
    const v = process.env[k];
    if (v !== undefined && v !== "") {
      out[k] = v;
    }
  }
  return out;
}
