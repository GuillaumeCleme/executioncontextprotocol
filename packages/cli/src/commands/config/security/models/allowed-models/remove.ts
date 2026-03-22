import { Args, Command } from "@oclif/core";

import { configScopeFlags } from "../../../../../lib/config-flags.js";
import {
  persistConfig,
  readForMutation,
  removeId,
} from "../../../../../lib/system-config-cli.js";

export default class ConfigSecurityModelsAllowedModelsRemove extends Command {
  static summary = "Remove a model name from models.providers.<provider>.allowedModels";

  static args = {
    provider: Args.string({ required: true, description: "Model provider id" }),
    model: Args.string({ required: true, description: "Model name" }),
  };

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigSecurityModelsAllowedModelsRemove);
    const cwd = process.cwd();
    const { path, config } = readForMutation({
      global: flags.global as boolean,
      cwd,
      explicit: flags.config as string | undefined,
    });

    config.models ??= {};
    config.models.providers ??= {};
    const prov = args.provider;
    config.models.providers[prov] ??= {};
    const block = config.models.providers[prov]!;
    block.allowedModels = removeId(block.allowedModels, args.model);

    persistConfig(path, config);
    this.log(`Updated ${prov}.allowedModels (${path}): ${block.allowedModels?.join(", ") ?? "(empty)"}`);
  }
}
