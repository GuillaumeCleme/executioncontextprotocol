/**
 * Runtime extension registry for model providers, executors, and plugins.
 *
 * @category Extensions
 */

import type {
  ExecutorRegistration,
  ModelProviderRegistration,
  PluginRegistration,
} from "./types.js";
import type { ModelProvider, ProgressCallback } from "@executioncontrolprotocol/plugins";

/**
 * In-memory registry of runtime extension factories.
 *
 * @category Extensions
 */
export class ExtensionRegistry {
  private readonly modelProviders = new Map<string, ModelProviderRegistration>();
  private readonly executors = new Map<string, ExecutorRegistration>();
  private readonly plugins = new Map<string, PluginRegistration>();
  private locked = false;

  /**
   * Prevent further registration changes.
   */
  lock(): void {
    this.locked = true;
  }

  /**
   * Register a model provider extension.
   */
  registerModelProvider(registration: ModelProviderRegistration): void {
    this.assertUnlocked();
    this.assertNotRegistered(registration.id, "provider");
    this.modelProviders.set(registration.id, registration);
  }

  /**
   * Register an executor extension.
   */
  registerExecutor(registration: ExecutorRegistration): void {
    this.assertUnlocked();
    this.assertNotRegistered(registration.id, "executor");
    this.executors.set(registration.id, registration);
  }

  /**
   * Register a plugin extension (logger, memory, or future `PluginKind` values).
   */
  registerPlugin(registration: PluginRegistration): void {
    this.assertUnlocked();
    this.assertNotRegistered(registration.id, "plugin");
    this.plugins.set(registration.id, registration);
  }

  /**
   * Resolve and instantiate a model provider by ID.
   */
  createModelProvider(
    id: string,
    config?: Record<string, unknown>,
  ): ModelProvider {
    const registration = this.modelProviders.get(id);
    if (!registration) {
      throw new Error(`Model provider extension "${id}" is not registered.`);
    }
    return registration.create(config);
  }

  /**
   * Get a model provider registration by ID.
   */
  getModelProviderRegistration(id: string): ModelProviderRegistration | undefined {
    return this.modelProviders.get(id);
  }

  /**
   * List registered model provider extensions.
   */
  listModelProviders(): ModelProviderRegistration[] {
    return [...this.modelProviders.values()];
  }

  /**
   * List registered executor extensions.
   */
  listExecutors(): ExecutorRegistration[] {
    return [...this.executors.values()];
  }

  /**
   * Get a plugin registration by ID (any {@link PluginKind}).
   */
  getPluginRegistration(id: string): PluginRegistration | undefined {
    return this.plugins.get(id);
  }

  /**
   * List registered plugin extensions.
   */
  listPlugins(): PluginRegistration[] {
    return [...this.plugins.values()];
  }

  /**
   * List plugins of a given kind (`logger` or `memory`).
   */
  listPluginsByKind(kind: "logger" | "memory"): PluginRegistration[] {
    return this.listPlugins().filter((p) => p.kind === kind);
  }

  /**
   * Create a logger plugin callback by plugin ID (`kind` must be `"logger"`).
   */
  createLogger(
    id: string,
    config?: Record<string, unknown>,
  ): ProgressCallback {
    const registration = this.plugins.get(id);
    if (!registration || registration.kind !== "logger") {
      throw new Error(`Logger plugin "${id}" is not registered.`);
    }
    return registration.create(config) as ProgressCallback;
  }

  /**
   * Get a logger plugin registration by ID, if present.
   */
  getLoggerRegistration(id: string): PluginRegistration | undefined {
    const p = this.plugins.get(id);
    if (p?.kind === "logger") return p;
    return undefined;
  }

  /**
   * List registered logger plugins (`kind === "logger"`).
   */
  listLoggers(): PluginRegistration[] {
    return this.listPluginsByKind("logger");
  }

  private assertUnlocked(): void {
    if (this.locked) {
      throw new Error("Extension registry is locked and cannot be modified.");
    }
  }

  private assertNotRegistered(
    id: string,
    kind: "provider" | "executor" | "plugin",
  ): void {
    const exists =
      this.modelProviders.has(id) ||
      this.executors.has(id) ||
      this.plugins.has(id);
    if (exists) {
      throw new Error(`Extension "${id}" is already registered; duplicate ${kind} registration denied.`);
    }
  }
}
