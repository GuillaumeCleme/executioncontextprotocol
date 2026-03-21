import { Command, Flags } from "@oclif/core";

import { stringifySystemConfig } from "@executioncontrolprotocol/runtime";

import { configScopeFlags } from "../../lib/config-flags.js";
import { loadConfigForDisplay } from "../../lib/system-config-cli.js";

export default class ConfigGet extends Command {
  static summary = "Get the resolved system config (YAML or JSON)";

  static flags = {
    ...configScopeFlags,
    format: Flags.string({
      description: "Serialization format",
      options: ["yaml", "json"] as const,
      default: "yaml",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ConfigGet);
    const cwd = process.cwd();

    try {
      const { path, exists, config } = loadConfigForDisplay({
        global: flags.global as boolean,
        cwd,
        explicit: flags.config as string | undefined,
      });

      const fmt = flags.format as "yaml" | "json";
      this.log(`# ${path}${exists ? "" : " (empty — no file yet)"}\n`);
      this.log(stringifySystemConfig(config, fmt));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.error(msg, { exit: 1 });
    }
  }
}
