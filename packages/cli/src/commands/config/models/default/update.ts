import { Args, Command } from "@oclif/core";

import { configScopeFlags } from "../../../../lib/config-flags.js";
import {
  isModelProviderId,
  persistConfig,
  readForMutation,
} from "../../../../lib/system-config-cli.js";

export default class ConfigModelsDefaultUpdate extends Command {
  static summary = "Update modelProviders.<provider>.defaultModel";

  static args = {
    provider: Args.string({
      required: true,
      description: "Model provider",
      options: ["openai", "ollama"],
    }),
    model: Args.string({ required: true, description: "Model name" }),
  };

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigModelsDefaultUpdate);
    if (!isModelProviderId(args.provider)) {
      this.error(`Invalid provider: ${args.provider}`, { exit: 1 });
    }
    const cwd = process.cwd();
    const { path, config } = readForMutation({
      global: flags.global as boolean,
      cwd,
      explicit: flags.config as string | undefined,
    });

    config.modelProviders ??= {};
    const prov = args.provider;
    config.modelProviders[prov] ??= {};
    config.modelProviders[prov]!.defaultModel = args.model;

    persistConfig(path, config);
    this.log(`Updated ${prov}.defaultModel = ${args.model} (${path})`);
  }
}
