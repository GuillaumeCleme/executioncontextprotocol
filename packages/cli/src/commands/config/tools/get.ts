import { Command } from "@oclif/core";

import { configScopeFlags } from "../../../lib/config-flags.js";
import { loadConfigForDisplay } from "../../../lib/system-config-cli.js";

export default class ConfigToolsGet extends Command {
  static summary = "Get MCP tool server names (toolServers)";

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { flags } = await this.parse(ConfigToolsGet);
    const cwd = process.cwd();

    try {
      const { path, exists, config } = loadConfigForDisplay({
        global: flags.global as boolean,
        cwd,
        explicit: flags.config as string | undefined,
      });

      this.log(`# ${path}${exists ? "" : " (no file — empty)"}\n`);
      const names = config.toolServers ? Object.keys(config.toolServers) : [];
      if (names.length === 0) {
        this.log("(no tool servers configured)");
        return;
      }
      for (const n of names.sort()) {
        this.log(`- ${n}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.error(msg, { exit: 1 });
    }
  }
}
