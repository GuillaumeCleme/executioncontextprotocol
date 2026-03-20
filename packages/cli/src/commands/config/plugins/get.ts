import { Command } from "@oclif/core";

import { configScopeFlags } from "../../../lib/config-flags.js";
import { loadConfigForDisplay } from "../../../lib/system-config-cli.js";
import { getSystemPluginPolicy } from "@executioncontrolprotocol/runtime";

export default class ConfigPluginsGet extends Command {
  static summary = "Get plugin allow-lists, defaults, and security";

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { flags } = await this.parse(ConfigPluginsGet);
    const cwd = process.cwd();

    try {
      const { path, exists, config } = loadConfigForDisplay({
        global: flags.global as boolean,
        cwd,
        explicit: flags.config as string | undefined,
      });

      this.log(`# ${path}${exists ? "" : " (no file — empty)"}\n`);
      const ex = getSystemPluginPolicy(config);
      this.log("allowEnable:");
      this.log(ex?.allowEnable?.length ? ex.allowEnable.map((x: string) => `  - ${x}`).join("\n") : "  (not set)");
      this.log("defaultEnable:");
      this.log(ex?.defaultEnable?.length ? ex.defaultEnable.map((x: string) => `  - ${x}`).join("\n") : "  (not set)");
      this.log("security:");
      if (ex?.security) {
        this.log(JSON.stringify(ex.security, null, 2));
      } else {
        this.log("  (not set)");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.error(msg, { exit: 1 });
    }
  }
}
