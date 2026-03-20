/**
 * System config loader — reads ECP system config (ecp.config.yaml) from
 * a given path or default locations.
 *
 * @category Engine
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, extname, dirname } from "node:path";
import { homedir } from "node:os";
import yaml from "js-yaml";
import type { ECPSystemConfig } from "./types.js";

const CONFIG_FILENAME = "ecp.config.yaml";
const CONFIG_JSON_FILENAME = "ecp.config.json";

/**
 * Default paths to look for system config, in order of precedence.
 * First existing file wins.
 *
 * @param cwd - Current working directory (e.g. process.cwd()).
 * @returns List of absolute paths to try.
 *
 * @category Engine
 */
export function getDefaultConfigPaths(cwd: string): string[] {
  const home = homedir();
  return [
    resolve(cwd, CONFIG_FILENAME),
    resolve(cwd, CONFIG_JSON_FILENAME),
    resolve(home, ".ecp", "config.yaml"),
    resolve(home, ".ecp", "config.json"),
    resolve(home, ".ecp", CONFIG_FILENAME),
  ];
}

/**
 * Resolved plugin policy block from system config.
 *
 * @category Engine
 */
export function getSystemPluginPolicy(
  config: ECPSystemConfig | undefined,
): ECPSystemConfig["plugins"] | undefined {
  return config?.plugins;
}

function parseSystemConfigFromParsed(parsed: unknown, sourceLabel: string): ECPSystemConfig {
  const config = parsed as ECPSystemConfig;
  if (!config || typeof config !== "object") {
    throw new Error(`Failed to parse system config from ${sourceLabel}: not an object`);
  }
  return config;
}

/**
 * Parse system config from a YAML or JSON string (used by CLI defaults and tests).
 *
 * @category Engine
 */
export function parseSystemConfigString(raw: string, format: "yaml" | "json"): ECPSystemConfig {
  let parsed: unknown;
  if (format === "json") {
    parsed = JSON.parse(raw);
  } else {
    parsed = yaml.load(raw);
  }
  return parseSystemConfigFromParsed(parsed, "string");
}

export function loadSystemConfig(filePath: string): ECPSystemConfig {
  const raw = readFileSync(filePath, "utf-8");
  const ext = extname(filePath).toLowerCase();

  let parsed: unknown;
  if (ext === ".yaml" || ext === ".yml") {
    parsed = yaml.load(raw);
  } else if (ext === ".json") {
    parsed = JSON.parse(raw);
  } else {
    parsed = yaml.load(raw);
  }

  return parseSystemConfigFromParsed(parsed, filePath);
}

/**
 * Serialize config for display (no file I/O).
 *
 * @category Engine
 */
export function stringifySystemConfig(config: ECPSystemConfig, format: "yaml" | "json"): string {
  if (format === "json") {
    return `${JSON.stringify(config, null, 2)}\n`;
  }
  let body = yaml.dump(config, { lineWidth: 120, noRefs: true });
  if (!body.endsWith("\n")) body += "\n";
  return body;
}

export function saveSystemConfig(filePath: string, config: ECPSystemConfig): void {
  mkdirSync(dirname(filePath), { recursive: true });
  const ext = extname(filePath).toLowerCase();
  const format: "yaml" | "json" = ext === ".json" ? "json" : "yaml";
  writeFileSync(filePath, stringifySystemConfig(config, format), "utf-8");
}

/**
 * Load system config from an explicit path, or from the first default
 * location that exists.
 *
 * @param explicitPath - If set, load from this path only.
 * @param cwd - Current working directory for default path resolution.
 * @returns The loaded config, or undefined if no config file was found.
 *
 * @category Engine
 */
export function resolveSystemConfig(
  explicitPath: string | undefined,
  cwd: string,
): ECPSystemConfig | undefined {
  if (explicitPath) {
    if (!existsSync(explicitPath)) {
      throw new Error(`System config not found: ${explicitPath}`);
    }
    return loadSystemConfig(explicitPath);
  }
  for (const p of getDefaultConfigPaths(cwd)) {
    if (existsSync(p)) {
      return loadSystemConfig(p);
    }
  }
  return undefined;
}
