import { Args, Command } from "@oclif/core";

import { configScopeFlags } from "../../../../lib/config-flags.js";
import {
  persistConfig,
  readForMutation,
  removeId,
} from "../../../../lib/system-config-cli.js";

export default class ConfigPluginsAllowRemove extends Command {
  static summary = "Remove a plugin ID from plugins.allowEnable";

  static args = {
    id: Args.string({ required: true, description: "Plugin ID" }),
  };

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigPluginsAllowRemove);
    const cwd = process.cwd();
    const { path, config } = readForMutation({
      global: flags.global as boolean,
      cwd,
      explicit: flags.config as string | undefined,
    });

    config.plugins ??= {};
    config.plugins.allowEnable = removeId(config.plugins.allowEnable, args.id);
    config.plugins.defaultEnable = removeId(config.plugins.defaultEnable, args.id);

    persistConfig(path, config);
    this.log(`Updated allowEnable / defaultEnable (${path})`);
  }
}
