/**
 * Memory plugin factory contract (returned from `PluginRegistration.create` when `kind` is `"memory"`).
 *
 * @category Plugins
 */

import type { MemoryStore } from "./memory.js";

/**
 * Factory returned by the memory plugin's create(). The host calls open()
 * once to obtain the store (async when the implementation loads resources).
 *
 * @category Plugins
 */
export interface MemoryPluginInstance {
  /** Open the store (load DB from disk if present). */
  open(): Promise<MemoryStore>;
}
