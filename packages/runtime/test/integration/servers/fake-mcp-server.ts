#!/usr/bin/env tsx
/**
 * Fake MCP server for integration testing.
 *
 * Implements a minimal MCP server over stdio that exposes deterministic
 * tools. Run as a child process via StdioClientTransport.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "fake-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

const FAKE_ISSUES = [
  { id: "ISS-1", title: "Fix login bug", status: "open", updatedAt: "2025-01-01" },
  { id: "ISS-2", title: "Add dark mode", status: "open", updatedAt: "2025-01-02" },
  { id: "ISS-3", title: "Refactor API", status: "in-progress", updatedAt: "2025-01-03" },
];

const FAKE_ISSUE_DETAILS: Record<string, unknown> = {
  "ISS-1": { id: "ISS-1", title: "Fix login bug", description: "Login form breaks on mobile", priority: "high", assignee: "alice" },
  "ISS-2": { id: "ISS-2", title: "Add dark mode", description: "Users want dark theme", priority: "medium", assignee: "bob" },
  "ISS-3": { id: "ISS-3", title: "Refactor API", description: "REST to GraphQL migration", priority: "low", assignee: "carol" },
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "issues.search",
      description: "Search for issues in the project tracker",
      inputSchema: {
        type: "object" as const,
        properties: {
          project: { type: "string" },
          limit: { type: "number" },
        },
      },
    },
    {
      name: "issues.get",
      description: "Get details of a specific issue",
      inputSchema: {
        type: "object" as const,
        properties: {
          issueId: { type: "string" },
        },
        required: ["issueId"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "issues.search": {
      const limit = (args?.limit as number) ?? 10;
      const results = FAKE_ISSUES.slice(0, limit);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(results) }],
      };
    }

    case "issues.get": {
      const issueId = args?.issueId as string;
      const detail = FAKE_ISSUE_DETAILS[issueId];
      if (!detail) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: "Not found" }) }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify(detail) }],
      };
    }

    default:
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
        isError: true,
      };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
