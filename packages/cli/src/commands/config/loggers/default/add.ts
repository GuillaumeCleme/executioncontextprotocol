import { Args, Command } from "@oclif/core";

import { configScopeFlags } from "../../../../lib/config-flags.js";
import {
  addUnique,
  persistConfig,
  readForMutation,
} from "../../../../lib/system-config-cli.js";

export default class ConfigLoggersDefaultAdd extends Command {
  static summary = "Add a logger ID to loggers.defaultEnable";

  static args = {
    id: Args.string({ required: true, description: "Logger ID" }),
  };

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigLoggersDefaultAdd);
    const cwd = process.cwd();
    const { path, config } = readForMutation({
      global: flags.global as boolean,
      cwd,
      explicit: flags.config as string | undefined,
    });

    config.loggers ??= {};
    config.loggers.defaultEnable = addUnique(config.loggers.defaultEnable, args.id);
    if (config.loggers.allowEnable && config.loggers.allowEnable.length > 0) {
      config.loggers.allowEnable = addUnique(config.loggers.allowEnable, args.id);
    }

    persistConfig(path, config);
    this.log(`Updated loggers.defaultEnable (${path}): ${config.loggers.defaultEnable?.join(", ")}`);
  }
}
