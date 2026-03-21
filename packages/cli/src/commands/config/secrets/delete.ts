import { Command, Flags } from "@oclif/core";
import { resolve } from "node:path";

import { configScopeFlags } from "../../../lib/config-flags.js";
import { loadConfigForDisplay } from "../../../lib/system-config-cli.js";
import { createDefaultSecretBroker } from "@executioncontrolprotocol/runtime";
import type { SecretRef } from "@executioncontrolprotocol/plugins";

export default class ConfigSecretsDelete extends Command {
  static summary = "Delete a stored secret";

  static flags = {
    ...configScopeFlags,
    provider: Flags.string({
      char: "p",
      description: "Provider id",
      required: true,
    }),
    key: Flags.string({
      char: "k",
      description: "Lookup key",
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ConfigSecretsDelete);
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

    const provider = registry.get(flags.provider!);
    if (!provider) {
      this.error(`Unknown provider "${flags.provider}".`, { exit: 1 });
    }
    if (!provider.delete) {
      this.error(`Provider "${flags.provider}" does not support delete.`, { exit: 1 });
    }

    const ref: SecretRef = {
      id: `ecp://${flags.provider}/${flags.key}`,
      provider: flags.provider!,
      key: flags.key!,
    };
    await provider.delete(ref);
    this.log(`Deleted secret for provider "${flags.provider}" key "${flags.key}".`);
  }
}
