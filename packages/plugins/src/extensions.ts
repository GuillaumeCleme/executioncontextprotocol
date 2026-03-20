/**
 * Shared extensibility interfaces for ECP runtime registration.
 *
 * @category Extensions
 */

import type { ExtensionSourceType } from "@executioncontrolprotocol/spec";
import type { ModelProvider } from "./model-provider.js";

/**
 * Base metadata for all runtime extension registrations.
 *
 * @category Extensions
 */
export interface ExtensionRegistrationBase {
  /** Stable extension ID (for example `"openai"`). */
  id: string;

  /** Extension version string. */
  version: string;

  /** Source type used to load this extension. */
  sourceType: ExtensionSourceType;

  /** Optional human-readable summary. */
  description?: string;
}

/**
 * Factory contract for model provider extensions.
 *
 * @category Extensions
 */
export interface ModelProviderRegistration extends ExtensionRegistrationBase {
  /** Fixed kind discriminator for model provider plugins. */
  kind: "provider";

  /**
   * Create a model provider instance from extension configuration.
   */
  create(config?: Record<string, unknown>): ModelProvider;
}

/**
 * Factory contract for executor extensions.
 *
 * @category Extensions
 */
export interface ExecutorRegistration extends ExtensionRegistrationBase {
  /** Fixed kind discriminator for executor extensions. */
  kind: "executor";

  /**
   * Create an executor extension instance from extension configuration.
   */
  create(config?: Record<string, unknown>): unknown;
}

/**
 * Factory contract for auxiliary plugins (logger, memory store, …).
 *
 * @category Extensions
 */
export interface PluginRegistration extends ExtensionRegistrationBase {
  /**
   * Auxiliary plugin kind (loggers, memory stores, …).
   */
  kind: "logger" | "memory";

  /**
   * Create a plugin instance from plugin configuration.
   * Shape depends on `kind` (e.g. `ProgressCallback` for loggers, memory factory for memory).
   */
  create(config?: Record<string, unknown>): unknown;
}
