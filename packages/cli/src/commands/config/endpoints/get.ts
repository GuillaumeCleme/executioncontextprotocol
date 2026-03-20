import { Command } from "@oclif/core";

import { configScopeFlags } from "../../../lib/config-flags.js";
import { loadConfigForDisplay } from "../../../lib/system-config-cli.js";

export default class ConfigEndpointsGet extends Command {
  static summary = "Get A2A agent endpoints (agentEndpoints)";

  static flags = { ...configScopeFlags };

  async run(): Promise<void> {
    const { flags } = await this.parse(ConfigEndpointsGet);
    const cwd = process.cwd();

    try {
      const { path, exists, config } = loadConfigForDisplay({
        global: flags.global as boolean,
        cwd,
        explicit: flags.config as string | undefined,
      });

      this.log(`# ${path}${exists ? "" : " (no file — empty)"}\n`);
      const ae = config.agentEndpoints;
      if (!ae || Object.keys(ae).length === 0) {
        this.log("(no agent endpoints configured)");
        return;
      }
      for (const k of Object.keys(ae).sort()) {
        this.log(`${k}: ${ae[k]}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.error(msg, { exit: 1 });
    }
  }
}
