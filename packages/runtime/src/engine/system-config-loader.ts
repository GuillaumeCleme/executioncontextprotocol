/**
 * System config loader — reads ECP system config (ecp.config.yaml) from
 * a given path or default locations.
 *
 * @category Engine
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, extname } from "node:path";
import { homedir } from "node:os";
import yaml from "js-yaml";
import type { ECPSystemConfig } from "./types.js";

const CONFIG_FILENAME = "ecp.config.yaml";

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
  return [
    resolve(cwd, CONFIG_FILENAME),
    resolve(homedir(), ".ecp", "config.yaml"),
    resolve(homedir(), ".ecp", CONFIG_FILENAME),
  ];
}

/**
 * Load ECP system config from a YAML or JSON file.
 *
 * @param filePath - Absolute or relative path to the config file.
 * @returns The parsed config object.
 * @throws If the file cannot be read or parsed.
 *
 * @category Engine
 */
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

  const config = parsed as ECPSystemConfig;
  if (!config || typeof config !== "object") {
    throw new Error(`Failed to parse system config from ${filePath}: not an object`);
  }
  return config;
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
