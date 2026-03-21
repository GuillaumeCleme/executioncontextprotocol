/**
 * @category Secrets
 */

import { readFileSync, existsSync } from "node:fs";

import type {
  SecretProvider,
  SecretProviderCapabilities,
  SecretProviderHealth,
  SecretRef,
  SecretValueResult,
} from "@executioncontrolprotocol/plugins";
import { redactSecret } from "../redaction.js";

function parseDotEnv(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/**
 * Read-only provider: loads from a `.env` file (key = variable name).
 */
export class DotenvSecretProvider implements SecretProvider {
  readonly id = "dotenv";
  readonly displayName = "Dotenv file";

  constructor(private readonly filePath: string) {}

  async isAvailable(): Promise<boolean> {
    return existsSync(this.filePath);
  }

  capabilities(): SecretProviderCapabilities {
    return {
      secureAtRest: false,
      interactiveUnlock: false,
      headlessSupported: true,
      persistent: false,
      supportsList: false,
      supportsDelete: false,
      supportsMetadata: false,
    };
  }

  async healthCheck(): Promise<SecretProviderHealth> {
    const ok = existsSync(this.filePath);
    return {
      ok,
      providerId: this.id,
      message: ok ? undefined : `File not found: ${this.filePath}`,
      details: { path: this.filePath },
    };
  }

  async load(ref: SecretRef): Promise<SecretValueResult | null> {
    if (!existsSync(this.filePath)) return null;
    const raw = readFileSync(this.filePath, "utf-8");
    const vars = parseDotEnv(raw);
    const v = vars[ref.key];
    if (v === undefined || v === "") return null;
    return { value: v, redactedPreview: redactSecret(v) };
  }
}
