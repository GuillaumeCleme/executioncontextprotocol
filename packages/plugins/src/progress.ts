/**
 * Execution progress events and logger callback types for ECP plugins.
 *
 * @category Plugins
 */

/**
 * Lifecycle status of an execution run.
 *
 * @category Engine
 */
export type RunStatus =
  | "pending"
  | "loading"
  | "validating"
  | "hydrating-seed"
  | "running-orchestrator"
  | "delegating"
  | "hydrating-focus"
  | "hydrating-deep"
  | "running-specialist"
  | "merging"
  | "completed"
  | "failed";

/**
 * Execution progress event emitted during a run for real-time UI (e.g. CLI spinner).
 *
 * @category Engine
 */
export type ExecutionProgressEvent =
  | { type: "phase"; status: RunStatus }
  | {
      type: "step_start";
      step: number;
      kind: "mount" | "executor" | "model" | "tool" | "delegation";
      executorName?: string;
      description: string;
    }
  | {
      type: "step_complete";
      step: number;
      kind: "mount" | "executor" | "model" | "tool" | "delegation";
      executorName?: string;
      description: string;
      durationMs: number;
      /** Chain-of-thought or reasoning from the model when available. */
      reasoning?: string;
      /** Executor output when kind is "executor" and the executor produced output. */
      output?: unknown;
      /** Token usage for this step (when kind is "executor", from model generation). */
      tokens?: { prompt: number; completion: number; total: number };
      /** Model used (when kind is "executor"). */
      model?: string;
    }
  | {
      type: "executor_reasoning";
      executorName: string;
      /** Increment or full reasoning text (chain of thought). */
      reasoning: string;
    };

/**
 * Callback invoked for each progress event during execution.
 * May return a Promise so the host can flush output before the next event.
 *
 * @category Engine
 */
export type ProgressCallback = (event: ExecutionProgressEvent) => void | Promise<void>;
