import { execSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const cliRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const runJs = join(cliRoot, "bin", "run.js");

describe("ecp config plugins remove/update flags", () => {
  it("remove --clean deletes managed plugin directory from disk", { timeout: 30_000 }, () => {
    const dir = mkdtempSync(join(tmpdir(), "ecp-plugins-clean-"));
    const installDir = join(dir, ".ecp", "plugins", "demo");
    mkdirSync(installDir, { recursive: true });
    writeFileSync(
      join(dir, "ecp.config.yaml"),
      [
        'version: "0.5"',
        "plugins:",
        "  installs:",
        "    demo:",
        '      source: { type: npm, spec: "@scope/demo-plugin" }',
        "      path: ./.ecp/plugins/demo",
        "      pluginKind: tool",
        "      config: {}",
        "",
      ].join("\n"),
      "utf8",
    );

    const out = execSync(`node "${runJs}" config plugins remove demo --clean`, {
      encoding: "utf-8",
      cwd: dir,
      stdio: ["ignore", "pipe", "pipe"],
    });

    expect(out).toMatch(/Removed plugins\.installs\.demo/);
    expect(out).toMatch(/Deleted plugin files/);
    expect(existsSync(installDir)).toBe(false);
  });

  it("update --upgrade fails when existing source is not npm or git", { timeout: 30_000 }, () => {
    const dir = mkdtempSync(join(tmpdir(), "ecp-plugins-upgrade-local-"));
    writeFileSync(
      join(dir, "ecp.config.yaml"),
      [
        'version: "0.5"',
        "plugins:",
        "  installs:",
        "    demo:",
        "      source: { type: local, path: ./plugins/demo }",
        "      path: ./plugins/demo",
        "      pluginKind: tool",
        "      config: {}",
        "",
      ].join("\n"),
      "utf8",
    );

    expect(() =>
      execSync(`node "${runJs}" config plugins update demo --upgrade`, {
        encoding: "utf-8",
        cwd: dir,
        stdio: ["ignore", "pipe", "pipe"],
      }),
    ).toThrow(/--upgrade only supports existing npm or git installs/);
  });

  it("add --install --shim tool wires local package without ECP manifest", { timeout: 30_000 }, () => {
    const dir = mkdtempSync(join(tmpdir(), "ecp-plugins-shim-"));
    const pkgDir = join(dir, "raw-server");
    mkdirSync(pkgDir, { recursive: true });
    writeFileSync(
      join(pkgDir, "package.json"),
      JSON.stringify({ name: "@demo/raw-server", version: "0.0.1" }, null, 2),
      "utf8",
    );
    writeFileSync(join(pkgDir, "server.js"), "console.log('ok')\n", "utf8");
    writeFileSync(join(dir, "ecp.config.yaml"), 'version: "0.5"\n', "utf8");

    const out = execSync(
      `node "${runJs}" config plugins add demo --install --local "${pkgDir}" --shim tool --transport-type stdio --stdio-command node --stdio-arg server.js --server-name demo-mcp`,
      {
        encoding: "utf-8",
        cwd: dir,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    const cfg = readFileSync(join(dir, "ecp.config.yaml"), "utf8");

    expect(out).toMatch(/Installed plugin "demo"/);
    expect(cfg).toMatch(/demo-mcp:/);
    expect(cfg).toMatch(/command: node/);
    expect(cfg).toMatch(/- server\.js/);
    expect(cfg).toMatch(/pluginKind: tool/);
  });
});
