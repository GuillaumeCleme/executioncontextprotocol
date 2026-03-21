import { Command, Flags } from "@oclif/core";
import { configScopeFlags } from "../../../lib/config-flags.js";
import { OS_PROVIDER_ID } from "../../../lib/secret-provider-ids.js";
import { resolveDotenvPathFromConfig, resolveSecretPolicyFromConfig } from "../../../lib/secrets-config.js";
import { loadConfigForDisplay } from "../../../lib/system-config-cli.js";
import { createDefaultSecretBroker } from "@executioncontrolprotocol/runtime";
import type { SecretRef } from "@executioncontrolprotocol/plugins";

export default class ConfigSecretsRemove extends Command {
  static summary = "Remove a stored secret";

  static flags = {
    ...configScopeFlags,
    provider: Flags.string({
      char: "p",
      description: "Provider id",
      required: true,
    }),
    key: Flags.string({
      char: "k",
      description: `Lookup key (same form as add - ${OS_PROVIDER_ID} normalizes to ecp.*)`,
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ConfigSecretsRemove);
    const cwd = process.cwd();
    const { config } = loadConfigForDisplay({
      global: flags.global as boolean,
      cwd,
      explicit: flags.config as string | undefined,
    });
    const dotenvPath = resolveDotenvPathFromConfig(cwd, config);
    const { registry } = createDefaultSecretBroker({
      policy: resolveSecretPolicyFromConfig(config),
      dotenvPath,
      cwd,
    });

    const provider = registry.get(flags.provider!);
    if (!provider) {
      this.error(`Unknown provider "${flags.provider}".`, { exit: 1 });
    }
    if (!provider.delete) {
      this.error(`Provider "${flags.provider}" does not support remove.`, { exit: 1 });
    }

    const ref: SecretRef = {
      id: `ecp://${flags.provider}/${flags.key}`,
      provider: flags.provider!,
      key: flags.key!,
    };
    await provider.delete(ref);
    this.log(`Removed secret for provider "${flags.provider}" key "${flags.key}".`);
  }
}
