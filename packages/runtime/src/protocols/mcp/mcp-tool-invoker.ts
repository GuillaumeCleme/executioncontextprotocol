/**
 * MCP implementation of the {@link ToolInvoker} interface.
 *
 * Uses the official `@modelcontextprotocol/sdk` (v1.x) to connect to
 * MCP servers, discover tools, and invoke them. Supports both stdio
 * and SSE transports.
 *
 * @category Protocols
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type {
  ToolInvoker,
  ToolServerConfig,
  DiscoveredTool,
  ToolResult,
} from "../tool-invoker.js";
import { normalizeMcpToolArguments } from "./mcp-tool-args.js";

/**
 * A connected MCP server with its client and transport.
 */
interface ConnectedServer {
  client: Client;
  transport: StdioClientTransport | SSEClientTransport;
  config: ToolServerConfig;
}

/**
 * Extract text content from an MCP content block array.
 */
function extractContent(
  content: Array<{ type: string; text?: string; [key: string]: unknown }>,
): unknown {
  const textParts = content
    .filter((c) => c.type === "text" && c.text)
    .map((c) => c.text!);

  if (textParts.length === 1) {
    try {
      return JSON.parse(textParts[0]);
    } catch {
      return textParts[0];
    }
  }

  if (textParts.length > 1) {
    return textParts.join("\n");
  }

  return content;
}

/**
 * MCP-backed tool invoker.
 *
 * Manages connections to multiple MCP servers and routes tool
 * calls to the correct one.
 *
 * @category Protocols
 */
export class MCPToolInvoker implements ToolInvoker {
  readonly name = "mcp";

  private servers = new Map<string, ConnectedServer>();

  async connect(config: ToolServerConfig): Promise<void> {
    if (this.servers.has(config.name)) {
      await this.disconnect(config.name);
    }

    const transport = this.createTransport(config);
    const client = new Client(
      { name: "ecp-runtime", version: "0.3.0" },
      { capabilities: {} },
    );

    await client.connect(transport);
    this.servers.set(config.name, { client, transport, config });
  }

  async listTools(serverName: string): Promise<DiscoveredTool[]> {
    const server = this.getServer(serverName);
    const result = await server.client.listTools();

    return result.tools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? "",
      inputSchema: tool.inputSchema as Record<string, unknown>,
    }));
  }

  async callTool(
    serverName: string,
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<ToolResult> {
    const server = this.getServer(serverName);
    const result = await server.client.callTool({
      name: toolName,
      arguments: normalizeMcpToolArguments(args),
    });

    if ("toolResult" in result) {
      return {
        content: result.toolResult,
        isError: false,
      };
    }

    const content = extractContent(
      result.content as Array<{ type: string; text?: string }>,
    );

    return {
      content,
      isError: result.isError ?? false,
    };
  }

  async disconnect(serverName: string): Promise<void> {
    const server = this.servers.get(serverName);
    if (!server) return;

    try {
      await server.client.close();
    } catch {
      // best-effort cleanup
    }
    this.servers.delete(serverName);
  }

  async disconnectAll(): Promise<void> {
    const names = [...this.servers.keys()];
    await Promise.allSettled(names.map((name) => this.disconnect(name)));
  }

  private getServer(serverName: string): ConnectedServer {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(
        `MCP server "${serverName}" is not connected. Call connect() first.`,
      );
    }
    return server;
  }

  private createTransport(
    config: ToolServerConfig,
  ): StdioClientTransport | SSEClientTransport {
    const t = config.transport;
    const type = t.type as string;

    switch (type) {
      case "stdio":
        return new StdioClientTransport({
          command: t.command as string,
          args: (t.args as string[]) ?? [],
          env: t.env as Record<string, string> | undefined,
          cwd: t.cwd as string | undefined,
        });

      case "sse":
        return new SSEClientTransport(new URL(t.url as string));

      default:
        throw new Error(
          `Unsupported MCP transport type "${type}". Supported: "stdio", "sse".`,
        );
    }
  }
}
