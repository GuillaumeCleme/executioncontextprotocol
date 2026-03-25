/**
 * Normalizes tool `arguments` objects before they are sent to MCP servers.
 *
 * Some model providers occasionally emit nested objects for string fields, for example:
 * - `{ path: { path: "C:\\\\foo" } }`
 * - `{ path: { type: "string", value: "C:\\\\foo" } }`
 *
 * @category Protocols
 */
function coerceStringLike(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const o = value as Record<string, unknown>;
    if (typeof o.path === "string") {
      return o.path;
    }
    if (typeof o.value === "string") {
      return o.value;
    }
  }
  return undefined;
}

/**
 * Returns a shallow copy of `args` with common string fields coerced when models emit wrappers.
 *
 * @category Protocols
 */
export function normalizeMcpToolArguments(args: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...args };

  const pathCoerced = coerceStringLike(out.path);
  if (pathCoerced !== undefined) {
    out.path = pathCoerced;
  }

  return out;
}
