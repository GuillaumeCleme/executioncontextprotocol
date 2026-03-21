import { Command } from "@oclif/core";
import { resolve } from "node:path";

import { configScopeFlags } from "../../../../lib/config-flags.js";
import { loadConfigForDisplay } from "../../../../lib/system-config-cli.js";
import { createDefaultSecretBroker } from "@executioncontrolprotocol/runtime";

export default class ConfigSecretsProvidersList extends Command {
  static summary = "List registered secret providers and availability";

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { flags } = await this.parse(ConfigSecretsProvidersList);
    const cwd = process.cwd();
    const { config } = loadConfigForDisplay({
      global: flags.global as boolean,
      cwd,
      explicit: flags.config as string | undefined,
    });
    const dotenvRel = config.secrets?.providers?.dotenv?.path;
    const dotenvPath = dotenvRel ? resolve(cwd, dotenvRel) : resolve(cwd, ".env");
    const { registry } = createDefaultSecretBroker({
      policy: config.secrets?.policy ?? "warn",
      dotenvPath,
      cwd,
    });

    for (const { provider, source } of registry.list()) {
      const ok = await provider.isAvailable();
      const caps = provider.capabilities();
      this.log(
        `${provider.id} (${source})  available=${ok}  secureAtRest=${caps.secureAtRest}  ` +
          `list=${caps.supportsList}  delete=${caps.supportsDelete}`,
      );
    }
  }
}
