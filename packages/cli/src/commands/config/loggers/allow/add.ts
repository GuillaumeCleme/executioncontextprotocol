import { Args, Command } from "@oclif/core";

import { configScopeFlags } from "../../../../lib/config-flags.js";
import {
  addUnique,
  persistConfig,
  readForMutation,
} from "../../../../lib/system-config-cli.js";

export default class ConfigLoggersAllowAdd extends Command {
  static summary = "Add a logger ID to loggers.allowEnable";

  static args = {
    id: Args.string({ required: true, description: "Logger ID" }),
  };

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigLoggersAllowAdd);
    const cwd = process.cwd();
    const { path, config } = readForMutation({
      global: flags.global as boolean,
      cwd,
      explicit: flags.config as string | undefined,
    });

    config.loggers ??= {};
    config.loggers.allowEnable = addUnique(config.loggers.allowEnable, args.id);

    persistConfig(path, config);
    this.log(`Updated loggers.allowEnable (${path}): ${config.loggers.allowEnable?.join(", ")}`);
  }
}
