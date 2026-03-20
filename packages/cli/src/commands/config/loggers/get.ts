import { Command } from "@oclif/core";

import { configScopeFlags } from "../../../lib/config-flags.js";
import { loadConfigForDisplay } from "../../../lib/system-config-cli.js";

export default class ConfigLoggersGet extends Command {
  static summary = "Get logger allow-lists, defaults, and config keys";

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { flags } = await this.parse(ConfigLoggersGet);
    const cwd = process.cwd();

    try {
      const { path, exists, config } = loadConfigForDisplay({
        global: flags.global as boolean,
        cwd,
        explicit: flags.config as string | undefined,
      });

      this.log(`# ${path}${exists ? "" : " (no file — empty)"}\n`);
      const loggers = config.loggers;
      this.log("allowEnable:");
      this.log(loggers?.allowEnable?.length ? loggers.allowEnable.map((x: string) => `  - ${x}`).join("\n") : "  (not set)");
      this.log("defaultEnable:");
      this.log(loggers?.defaultEnable?.length ? loggers.defaultEnable.map((x: string) => `  - ${x}`).join("\n") : "  (not set)");
      this.log("config keys:");
      this.log(loggers?.config ? Object.keys(loggers.config).map((k) => `  - ${k}`).join("\n") : "  (not set)");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.error(msg, { exit: 1 });
    }
  }
}
