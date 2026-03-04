/**
 * A2A implementation of the {@link AgentTransport} interface.
 *
 * Uses the official `@a2a-js/sdk` to communicate with remote
 * A2A-compliant agents. Each specialist executor maps to a remote
 * agent endpoint.
 *
 * @category Protocols
 */

import {
  ClientFactory,
  type Client,
} from "@a2a-js/sdk/client";
import type {
  AgentTransport,
  AgentRef,
  AgentCapabilities,
  DelegatedTask,
  DelegationResult,
} from "../agent-transport.js";

/**
 * Options for the A2A agent transport.
 *
 * @category Protocols
 */
export interface A2ATransportConfig {
  /** Timeout in ms for sendMessage calls. Defaults to 60_000. */
  timeoutMs?: number;
}

interface ConnectedAgent {
  client: Client;
  ref: AgentRef;
}

/**
 * A2A-backed agent transport for delegating tasks to specialist executors.
 *
 * @category Protocols
 */
export class A2AAgentTransport implements AgentTransport {
  readonly name = "a2a";

  private agents = new Map<string, ConnectedAgent>();
  private factory = new ClientFactory();
  private timeoutMs: number;

  constructor(config: A2ATransportConfig = {}) {
    this.timeoutMs = config.timeoutMs ?? 60_000;
  }

  async capabilities(agent: AgentRef): Promise<AgentCapabilities> {
    const connected = await this.ensureConnected(agent);
    const transport = connected.client.transport;

    try {
      const card = await transport.getExtendedAgentCard();
      return {
        name: card.name ?? agent.name,
        skills: (card.skills ?? []).map((s) => s.name ?? s.id ?? "unknown"),
        supportsStreaming: card.capabilities?.streaming ?? false,
      };
    } catch {
      return {
        name: agent.name,
        skills: [],
        supportsStreaming: false,
      };
    }
  }

  async delegate(
    agent: AgentRef,
    task: DelegatedTask,
  ): Promise<DelegationResult> {
    const connected = await this.ensureConnected(agent);
    const transport = connected.client.transport;

    const messageContent = JSON.stringify({
      executorName: task.executorName,
      task: task.task,
      context: task.context,
      hints: task.hints,
    });

    try {
      const result = await transport.sendMessage({
        message: {
          kind: "message",
          role: "user",
          parts: [{ kind: "text", text: messageContent }],
          messageId: task.id,
        },
        configuration: {
          blocking: true,
        },
      });

      if ("status" in result && result.status) {
        const taskResult = result;

        if (taskResult.status.state === "completed") {
          const output = this.extractOutput(taskResult);
          return {
            taskId: task.id,
            executorName: task.executorName,
            output,
            success: true,
          };
        }

        if (taskResult.status.state === "failed") {
          return {
            taskId: task.id,
            executorName: task.executorName,
            output: {},
            success: false,
            error: this.extractStatusMessage(taskResult.status) ?? "Task failed",
          };
        }

        return await this.pollForCompletion(
          transport,
          taskResult.id ?? task.id,
          task,
        );
      }

      if ("parts" in result) {
        const output = this.extractPartsOutput(result.parts ?? []);
        return {
          taskId: task.id,
          executorName: task.executorName,
          output,
          success: true,
        };
      }

      return {
        taskId: task.id,
        executorName: task.executorName,
        output: {},
        success: false,
        error: "Unexpected response format from A2A agent",
      };
    } catch (err) {
      return {
        taskId: task.id,
        executorName: task.executorName,
        output: {},
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async close(): Promise<void> {
    this.agents.clear();
  }

  private async ensureConnected(agent: AgentRef): Promise<ConnectedAgent> {
    const existing = this.agents.get(agent.name);
    if (existing) return existing;

    const client = await this.factory.createFromUrl(agent.endpoint);
    const connected: ConnectedAgent = { client, ref: agent };
    this.agents.set(agent.name, connected);
    return connected;
  }

  private async pollForCompletion(
    transport: ConnectedAgent["client"]["transport"],
    taskId: string,
    task: DelegatedTask,
  ): Promise<DelegationResult> {
    const deadline = Date.now() + this.timeoutMs;
    const pollInterval = 1000;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, pollInterval));

      const taskState = await transport.getTask({ id: taskId });

      if ("status" in taskState && taskState.status) {
        if (taskState.status.state === "completed") {
          return {
            taskId: task.id,
            executorName: task.executorName,
            output: this.extractOutput(taskState),
            success: true,
          };
        }
        if (taskState.status.state === "failed") {
          return {
            taskId: task.id,
            executorName: task.executorName,
            output: {},
            success: false,
            error: this.extractStatusMessage(taskState.status) ?? "Task failed",
          };
        }
      }
    }

    return {
      taskId: task.id,
      executorName: task.executorName,
      output: {},
      success: false,
      error: `Task timed out after ${this.timeoutMs}ms`,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractStatusMessage(status: any): string | undefined {
    if (!status?.message) return undefined;
    const msg = status.message;
    if (typeof msg === "string") return msg;
    if (msg.parts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return msg.parts.filter((p: any) => p.kind === "text").map((p: any) => p.text).join(" ");
    }
    return String(msg);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractOutput(taskResult: any): Record<string, unknown> {
    const artifacts = taskResult.artifacts ?? [];
    if (artifacts.length > 0) {
      const parts = artifacts.flatMap(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any) => a.parts ?? [],
      );
      return this.extractPartsOutput(parts);
    }

    const history = taskResult.history ?? [];
    if (history.length > 0) {
      const lastMsg = history[history.length - 1];
      if (lastMsg?.parts) {
        return this.extractPartsOutput(lastMsg.parts);
      }
    }

    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractPartsOutput(parts: any[]): Record<string, unknown> {
    const textParts = parts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((p: any) => p.kind === "text" && p.text)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => p.text as string);

    if (textParts.length === 0) return {};

    const combined = textParts.join("\n");
    try {
      const parsed = JSON.parse(combined);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed as Record<string, unknown>;
      }
      return { result: parsed };
    } catch {
      return { result: combined };
    }
  }
}
