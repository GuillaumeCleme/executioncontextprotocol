import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: [
      "packages/*/src/**/*.test.ts",
      "packages/*/test/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**/*.ts"],
      exclude: ["**/*.test.ts", "**/index.ts", "**/types.ts"],
      thresholds: {
        "packages/runtime/src/secrets/**": {
          statements: 70,
          branches: 60,
          functions: 59,
          lines: 70,
        },
      },
    },
  },
});
