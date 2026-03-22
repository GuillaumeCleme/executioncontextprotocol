/**
 * Model provider allowlist helpers for host system config (`models.providers`).
 *
 * @category Engine
 */

import type { ECPSystemConfig, ModelProviderConfig } from "./types.js";

/** Built-in default model when config omits `defaultModel` (matches built-in providers). */
const BUILTIN_DEFAULT_MODEL: Record<string, string> = {
  openai: "gpt-4o",
  ollama: "gemma3:1b",
};

/**
 * Effective allowlist for a provider: explicit `allowedModels`, or `[defaultModel]` when only a default is set.
 *
 * @category Engine
 */
export function getEffectiveAllowedModels(block: ModelProviderConfig | undefined): string[] | undefined {
  if (!block) return undefined;
  if (block.allowedModels && block.allowedModels.length > 0) {
    return block.allowedModels;
  }
  if (block.defaultModel) {
    return [block.defaultModel];
  }
  return undefined;
}

/**
 * Resolved model name for policy checks: CLI override, then config default, then built-in default for the provider.
 *
 * @category Engine
 */
export function resolveEffectiveModelNameForProvider(
  providerId: string,
  selectedModel: string | undefined,
  systemConfig: ECPSystemConfig | undefined,
): string {
  const block = systemConfig?.models?.providers?.[providerId];
  if (selectedModel) return selectedModel;
  if (block?.defaultModel) return block.defaultModel;
  return BUILTIN_DEFAULT_MODEL[providerId] ?? "gpt-4o";
}

/**
 * Returns an error message when the model is not allowed, or undefined when allowed / unrestricted.
 *
 * @category Engine
 */
export function modelNotAllowedMessage(
  providerId: string,
  modelName: string,
  systemConfig: ECPSystemConfig | undefined,
): string | undefined {
  const effective = getEffectiveAllowedModels(systemConfig?.models?.providers?.[providerId]);
  if (!effective?.length) return undefined;
  if (effective.includes(modelName)) return undefined;
  return (
    `Model "${modelName}" is blocked for provider "${providerId}" by system config models.providers.${providerId} allowed list.\n` +
    `Allowed models: ${effective.join(", ")}\n` +
    `Update your config first (ecp.config.yaml / ecp config) and rerun.`
  );
}

/**
 * Throws if the model is not permitted for the provider under merged system config.
 *
 * @category Engine
 */
export function assertModelAllowedForProvider(
  providerId: string,
  modelName: string,
  systemConfig: ECPSystemConfig | undefined,
): void {
  const msg = modelNotAllowedMessage(providerId, modelName, systemConfig);
  if (msg) throw new Error(msg);
}
