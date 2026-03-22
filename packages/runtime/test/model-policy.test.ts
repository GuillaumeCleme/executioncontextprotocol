import { describe, expect, it } from "vitest";

import {
  getEffectiveAllowedModels,
  modelNotAllowedMessage,
  resolveEffectiveModelNameForProvider,
} from "../src/engine/model-policy.js";
import type { ECPSystemConfig } from "../src/engine/types.js";

describe("getEffectiveAllowedModels", () => {
  it("uses explicit allowedModels when non-empty", () => {
    expect(getEffectiveAllowedModels({ allowedModels: ["a", "b"], defaultModel: "a" })).toEqual(["a", "b"]);
  });

  it("uses [defaultModel] when allowedModels empty but default set", () => {
    expect(getEffectiveAllowedModels({ defaultModel: "gpt-4.1" })).toEqual(["gpt-4.1"]);
  });
});

describe("modelNotAllowedMessage", () => {
  it("returns undefined when model is allowed", () => {
    const cfg: ECPSystemConfig = {
      models: { providers: { openai: { defaultModel: "gpt-4o-mini", allowedModels: ["gpt-4o-mini"] } } },
    };
    expect(modelNotAllowedMessage("openai", "gpt-4o-mini", cfg)).toBeUndefined();
  });

  it("returns message when model not in effective allowlist", () => {
    const cfg: ECPSystemConfig = {
      models: { providers: { openai: { defaultModel: "gpt-4o-mini", allowedModels: ["gpt-4o-mini"] } } },
    };
    const msg = modelNotAllowedMessage("openai", "gpt-5", cfg);
    expect(msg).toMatch(/blocked/);
    expect(msg).toMatch(/gpt-5/);
  });
});

describe("resolveEffectiveModelNameForProvider", () => {
  it("uses selected model when set", () => {
    expect(resolveEffectiveModelNameForProvider("openai", "x", {})).toBe("x");
  });

  it("uses config default when present", () => {
    const cfg: ECPSystemConfig = {
      models: { providers: { openai: { defaultModel: "gpt-4o-mini" } } },
    };
    expect(resolveEffectiveModelNameForProvider("openai", undefined, cfg)).toBe("gpt-4o-mini");
  });

  it("uses built-in default when no config", () => {
    expect(resolveEffectiveModelNameForProvider("openai", undefined, {})).toBe("gpt-4o");
    expect(resolveEffectiveModelNameForProvider("ollama", undefined, {})).toBe("gemma3:1b");
  });
});
