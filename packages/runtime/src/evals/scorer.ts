/**
 * Rubric-based scorer for eval outputs.
 *
 * Evaluates engine outputs against a rubric of weighted criteria.
 * Supports field presence, pattern matching, array length checks,
 * tool usage validation, and schema conformance.
 *
 * @category Evals
 */

import type { ExecutionResult } from "../engine/types.js";
import type { RubricCriterion, CriterionResult, EvalExpected, EvalResult } from "./types.js";

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function evaluateCriterion(
  criterion: RubricCriterion,
  output: Record<string, unknown> | undefined,
  executionResult: ExecutionResult,
): CriterionResult {
  const { check } = criterion;

  switch (check.type) {
    case "schema-valid": {
      const passed = executionResult.success && output !== undefined;
      return {
        criterion,
        passed,
        score: passed ? criterion.weight : 0,
        message: passed ? "Output is schema-valid" : "Output missing or execution failed",
      };
    }

    case "field-exists": {
      const value = output ? getNestedValue(output, check.path) : undefined;
      const passed = value !== undefined && value !== null;
      return {
        criterion,
        passed,
        score: passed ? criterion.weight : 0,
        message: passed ? `Field "${check.path}" exists` : `Field "${check.path}" is missing`,
      };
    }

    case "field-matches": {
      const value = output ? getNestedValue(output, check.path) : undefined;
      const regex = new RegExp(check.pattern, "i");
      const passed = typeof value === "string" && regex.test(value);
      return {
        criterion,
        passed,
        score: passed ? criterion.weight : 0,
        message: passed
          ? `Field "${check.path}" matches pattern`
          : `Field "${check.path}" does not match /${check.pattern}/`,
      };
    }

    case "array-min-length": {
      const value = output ? getNestedValue(output, check.path) : undefined;
      const arr = Array.isArray(value) ? value : [];
      const passed = arr.length >= check.min;
      return {
        criterion,
        passed,
        score: passed ? criterion.weight : 0,
        message: passed
          ? `Array "${check.path}" has ${arr.length} items (>= ${check.min})`
          : `Array "${check.path}" has ${arr.length} items (need >= ${check.min})`,
      };
    }

    case "no-forbidden-tools": {
      const usedTools = executionResult.log
        .filter((e) => e.message.includes("Tool ") && !e.message.includes("denied"))
        .map((e) => e.message);
      const violations = check.forbidden.filter((tool) =>
        usedTools.some((msg) => msg.includes(tool)),
      );
      const passed = violations.length === 0;
      return {
        criterion,
        passed,
        score: passed ? criterion.weight : 0,
        message: passed
          ? "No forbidden tools used"
          : `Forbidden tools used: ${violations.join(", ")}`,
      };
    }

    case "tool-count-within": {
      const count = executionResult.totalBudgetUsage.toolCalls;
      const passed = count <= check.max;
      return {
        criterion,
        passed,
        score: passed ? criterion.weight : 0,
        message: passed
          ? `Tool calls (${count}) within limit (${check.max})`
          : `Tool calls (${count}) exceeded limit (${check.max})`,
      };
    }

    case "custom": {
      return {
        criterion,
        passed: false,
        score: 0,
        message: `Custom check "${check.fn}" not implemented in scorer`,
      };
    }
  }
}

/**
 * Score an execution result against an eval rubric.
 *
 * @param caseId - The eval case ID.
 * @param expected - The expected outcome with rubric.
 * @param executionResult - The engine's execution result.
 * @returns The eval result with per-criterion scores.
 *
 * @category Evals
 */
export function scoreExecution(
  caseId: string,
  expected: EvalExpected,
  executionResult: ExecutionResult,
): EvalResult {
  const output = executionResult.output;
  const criteria = expected.rubric.map((criterion) =>
    evaluateCriterion(criterion, output, executionResult),
  );

  const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);

  const hardGatesPassed = (expected.hardGates ?? []).every((gateName) => {
    const criterion = criteria.find((c) => c.criterion.name === gateName);
    return criterion?.passed ?? false;
  });

  const passed = totalScore >= expected.minScore && hardGatesPassed;

  return {
    caseId,
    passed,
    score: totalScore,
    criteria,
    executionDurationMs: executionResult.durationMs,
  };
}
