import { Args, Command } from "@oclif/core";

import { configScopeFlags } from "../../../../lib/config-flags.js";
import {
  addUnique,
  persistConfig,
  readForMutation,
} from "../../../../lib/system-config-cli.js";

export default class ConfigPluginsAllowAdd extends Command {
  static summary = "Add a plugin ID to plugins.allowEnable";

  static args = {
    id: Args.string({ required: true, description: "Plugin ID (e.g. openai, ollama)" }),
  };

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigPluginsAllowAdd);
    const cwd = process.cwd();
    const { path, config } = readForMutation({
      global: flags.global as boolean,
      cwd,
      explicit: flags.config as string | undefined,
    });

    config.plugins ??= {};
    config.plugins.allowEnable = addUnique(config.plugins.allowEnable, args.id);

    persistConfig(path, config);
    this.log(`Updated allowEnable (${path}): ${config.plugins.allowEnable?.join(", ")}`);
  }
}
