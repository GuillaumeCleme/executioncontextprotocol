import { Args, Command } from "@oclif/core";

import { configScopeFlags } from "../../../lib/config-flags.js";
import { persistConfig, readForMutation } from "../../../lib/system-config-cli.js";

export default class ConfigEndpointsRemove extends Command {
  static summary = "Remove an agentEndpoints entry";

  static args = {
    name: Args.string({ required: true, description: "Executor / specialist name" }),
  };

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigEndpointsRemove);
    const cwd = process.cwd();
    const { path, config } = readForMutation({
      global: flags.global as boolean,
      cwd,
      explicit: flags.config as string | undefined,
    });

    if (config.agentEndpoints && args.name in config.agentEndpoints) {
      delete config.agentEndpoints[args.name];
    }

    persistConfig(path, config);
    this.log(`Removed agentEndpoints.${args.name} (${path})`);
  }
}
