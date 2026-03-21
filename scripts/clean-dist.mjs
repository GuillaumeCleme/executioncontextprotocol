/**
 * Remove TypeScript emit folders and composite build info so no stale commands
 * (e.g. renamed CLI topics) remain under dist/.
 */
import { existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const paths = [
  "packages/spec/dist",
  "packages/spec/tsconfig.tsbuildinfo",
  "packages/plugins/dist",
  "packages/plugins/tsconfig.tsbuildinfo",
  "packages/runtime/dist",
  "packages/runtime/tsconfig.tsbuildinfo",
  "packages/cli/dist",
  "packages/cli/tsconfig.tsbuildinfo",
];

for (const rel of paths) {
  const p = join(root, rel);
  if (!existsSync(p)) continue;
  rmSync(p, { recursive: true, force: true });
}
