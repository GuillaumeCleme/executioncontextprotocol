/**
 * Defaults for built-in extension registrations (`source: "builtin"`).
 *
 * The model provider resolver matches {@link BUILTIN_PLUGIN_VERSION} when
 * the executor uses a string provider name (shorthand for builtin).
 *
 * @category Extensions
 */

/**
 * Version string for built-in `PluginReference` / `registration.version` rows
 * and for string shorthand `model.provider` resolution.
 */
export const BUILTIN_PLUGIN_VERSION = "0.3.0" as const;
