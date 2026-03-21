/**
 * Merge secret bindings into MCP stdio transport env.
 *
 * @category Secrets
 */

import type { SecretBroker, ToolServerCredentialBinding } from "@executioncontrolprotocol/plugins";
import { buildMinimalStdioEnv } from "./minimal-env.js";

export interface ToolServerDefinitionLike {
  transport: Record<string, unknown>;
  credentials?: { bindings?: ToolServerCredentialBinding[] };
}

/**
 * If the server uses stdio and has credential bindings, resolve them and merge env.
 */
export async function resolveStdioEnvForToolServer(
  broker: SecretBroker,
  server: ToolServerDefinitionLike,
): Promise<{ transport: Record<string, unknown>; warnings: string[] }> {
  const transport = { ...server.transport };
  const warnings: string[] = [];

  if ((transport.type as string) !== "stdio") {
    return { transport, warnings };
  }

  const bindings = server.credentials?.bindings;
  if (!bindings?.length) {
    return { transport, warnings };
  }

  const minimal = buildMinimalStdioEnv();
  const existing = (transport.env as Record<string, string> | undefined) ?? {};
  const { env: secretEnv, warnings: w } = await broker.resolveBindingsToEnv(bindings);
  warnings.push(...w);

  transport.env = {
    ...minimal,
    ...existing,
    ...secretEnv,
  };

  return { transport, warnings };
}
