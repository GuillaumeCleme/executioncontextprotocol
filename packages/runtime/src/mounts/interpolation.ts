/**
 * Template interpolation for mount arguments.
 *
 * Resolves `${inputs.foo}` and `${item}` expressions in mount arg values.
 *
 * @category Mounts
 */

import type { InterpolationContext } from "./types.js";

/**
 * Interpolate template expressions in a single string value.
 *
 * Supported expressions:
 * - `${inputs.<name>}` — resolved from Context inputs
 * - `${item}` — resolved from the current iteration item (focus/deep mounts)
 *
 * @param template - The string potentially containing `${...}` expressions.
 * @param ctx - The interpolation context.
 * @returns The interpolated string.
 *
 * @category Mounts
 */
export function interpolateString(
  template: string,
  ctx: InterpolationContext,
): string {
  return template.replace(/\$\{([^}]+)\}/g, (_match, expr: string) => {
    const trimmed = expr.trim();

    if (trimmed === "item") {
      return ctx.item ?? "";
    }

    if (trimmed.startsWith("inputs.")) {
      const inputName = trimmed.slice("inputs.".length);
      const value = ctx.inputs[inputName];
      return value !== undefined ? String(value) : "";
    }

    return "";
  });
}

/**
 * Deep-interpolate all string values in a mount arguments object.
 *
 * @param args - The raw args from the mount definition.
 * @param ctx - The interpolation context.
 * @returns A new object with all string values interpolated.
 *
 * @category Mounts
 */
export function interpolateArgs(
  args: Record<string, unknown>,
  ctx: InterpolationContext,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args)) {
    if (typeof value === "string") {
      result[key] = interpolateString(value, ctx);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key] = interpolateArgs(value as Record<string, unknown>, ctx);
    } else {
      result[key] = value;
    }
  }

  return result;
}
