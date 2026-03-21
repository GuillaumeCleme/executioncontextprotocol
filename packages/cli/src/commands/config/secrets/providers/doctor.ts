import { Command } from "@oclif/core";
import { resolve } from "node:path";

import { configScopeFlags } from "../../../../lib/config-flags.js";
import { loadConfigForDisplay } from "../../../../lib/system-config-cli.js";
import { createDefaultSecretBroker } from "@executioncontrolprotocol/runtime";

export default class ConfigSecretsProvidersDoctor extends Command {
  static summary = "Run health checks for each secret provider";

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { flags } = await this.parse(ConfigSecretsProvidersDoctor);
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

    let failed = false;
    for (const { provider } of registry.list()) {
      const h = await provider.healthCheck();
      const line = `${provider.id}: ${h.ok ? "ok" : "FAIL"}${h.message ? ` — ${h.message}` : ""}`;
      if (h.ok) {
        this.log(line);
      } else {
        this.warn(line);
        failed = true;
      }
    }
    if (failed) {
      this.exit(1);
    }
  }
}
