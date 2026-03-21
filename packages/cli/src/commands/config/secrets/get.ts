import { Command, Flags } from "@oclif/core";
import { resolve } from "node:path";

import { configScopeFlags } from "../../../lib/config-flags.js";
import { loadConfigForDisplay } from "../../../lib/system-config-cli.js";
import { createDefaultSecretBroker } from "@executioncontrolprotocol/runtime";
import type { SecretRef } from "@executioncontrolprotocol/plugins";

export default class ConfigSecretsGet extends Command {
  static summary = "Read a secret (redacted by default)";

  static flags = {
    ...configScopeFlags,
    provider: Flags.string({
      char: "p",
      description: "Provider id",
      required: true,
    }),
    key: Flags.string({
      char: "k",
      description: "Lookup key (os-keychain: same form as add; normalized to ecp.* in the keyring)",
      required: true,
    }),
    show: Flags.boolean({
      description: "Print full value (writes to stdout — avoid logs)",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ConfigSecretsGet);
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
    const available = await provider.isAvailable();
    if (!available) {
      this.error(`Provider "${flags.provider}" is not available.`, { exit: 1 });
    }

    const ref: SecretRef = {
      id: `ecp://${flags.provider}/${flags.key}`,
      provider: flags.provider!,
      key: flags.key!,
    };
    const result = await provider.load(ref);
    if (!result) {
      this.error(`No secret for key "${flags.key}".`, { exit: 1 });
    }
    if (flags.show) {
      this.warn("Printing full secret to stdout — ensure this is not logged or captured.");
      this.log(result.value);
    } else {
      this.log(result.redactedPreview);
    }
  }
}
