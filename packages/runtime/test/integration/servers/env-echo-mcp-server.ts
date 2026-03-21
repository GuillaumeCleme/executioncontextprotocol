#!/usr/bin/env tsx
/**
 * MCP server that echoes environment variables for integration testing.
 * Used to verify that secrets are properly merged into stdio transport env.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "env-echo-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "env.get",
      description: "Get the value of an environment variable",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "Environment variable name" },
        },
        required: ["name"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "env.get") {
    const varName = args?.name as string;
    const value = process.env[varName];
    if (value === undefined) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: `Variable ${varName} not set` }) }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text" as const, text: JSON.stringify({ name: varName, value }) }],
    };
  }

  return {
    content: [{ type: "text" as const, text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
    isError: true,
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
