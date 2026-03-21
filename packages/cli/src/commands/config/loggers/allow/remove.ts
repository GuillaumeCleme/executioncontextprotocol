import { Args, Command } from "@oclif/core";

import { configScopeFlags } from "../../../../lib/config-flags.js";
import {
  persistConfig,
  readForMutation,
  removeId,
} from "../../../../lib/system-config-cli.js";

export default class ConfigLoggersAllowRemove extends Command {
  static summary = "Remove a logger ID from loggers.allowEnable";

  static args = {
    id: Args.string({ required: true, description: "Logger ID" }),
  };

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigLoggersAllowRemove);
    const cwd = process.cwd();
    const { path, config } = readForMutation({
      global: flags.global as boolean,
      cwd,
      explicit: flags.config as string | undefined,
    });

    config.loggers ??= {};
    config.loggers.allowEnable = removeId(config.loggers.allowEnable, args.id);
    config.loggers.defaultEnable = removeId(config.loggers.defaultEnable, args.id);

    persistConfig(path, config);
    this.log(`Removed "${args.id}" from logger allow/default lists. ${path}`);
  }
}
