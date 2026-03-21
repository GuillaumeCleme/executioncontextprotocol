import { describe, expect, it } from "vitest";

import { normalizeOsKeychainAccountKey } from "../../src/secrets/os-keychain-account-key.js";

describe("normalizeOsKeychainAccountKey", () => {
  it("prefixes bare keys with ecp.", () => {
    expect(normalizeOsKeychainAccountKey("server.fetch.token")).toBe("ecp.server.fetch.token");
  });

  it("maps slashes to dots and adds ecp.", () => {
    expect(normalizeOsKeychainAccountKey("server/fetch/token")).toBe("ecp.server.fetch.token");
  });

  it("strips leading ecp/ path segment before normalizing", () => {
    expect(normalizeOsKeychainAccountKey("ecp/server/fetch.token")).toBe("ecp.server.fetch.token");
  });

  it("leaves already-dotted ecp.* keys unchanged", () => {
    expect(normalizeOsKeychainAccountKey("ecp.server.fetch.token")).toBe("ecp.server.fetch.token");
  });

  it("normalizes backslashes", () => {
    expect(normalizeOsKeychainAccountKey("a\\b\\c")).toBe("ecp.a.b.c");
  });

  it("trims whitespace", () => {
    expect(normalizeOsKeychainAccountKey("  my.key  ")).toBe("ecp.my.key");
  });
});
