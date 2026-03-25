import { describe, expect, it } from "vitest";

import { normalizeMcpToolArguments } from "../src/protocols/mcp/mcp-tool-args.js";

describe("normalizeMcpToolArguments", () => {
  it("unwraps nested path object from some model providers", () => {
    expect(
      normalizeMcpToolArguments({
        path: { path: "examples/foo" },
      }),
    ).toEqual({ path: "examples/foo" });
  });

  it("unwraps type/value path object from some model providers", () => {
    expect(
      normalizeMcpToolArguments({
        path: { type: "string", value: "examples/foo" },
      }),
    ).toEqual({ path: "examples/foo" });
  });

  it("leaves string path unchanged", () => {
    expect(normalizeMcpToolArguments({ path: "examples/foo" })).toEqual({ path: "examples/foo" });
  });
});
