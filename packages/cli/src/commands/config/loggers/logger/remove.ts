import { Args, Command } from "@oclif/core";

import { configScopeFlags } from "../../../../lib/config-flags.js";
import { persistConfig, readForMutation } from "../../../../lib/system-config-cli.js";

export default class ConfigLoggersLoggerRemove extends Command {
  static summary = "Remove loggers.config.<loggerId>";

  static args = {
    id: Args.string({ required: true, description: "Logger ID" }),
  };

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigLoggersLoggerRemove);
    const cwd = process.cwd();
    const { path, config } = readForMutation({
      global: flags.global as boolean,
      cwd,
      explicit: flags.config as string | undefined,
    });

    config.loggers ??= {};
    config.loggers.config ??= {};
    if (config.loggers.config[args.id] !== undefined) {
      delete config.loggers.config[args.id];
    }

    persistConfig(path, config);
    this.log(`Removed loggers.config.${args.id} (${path})`);
  }
}
