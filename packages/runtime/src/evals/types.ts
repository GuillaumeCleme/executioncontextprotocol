/**
 * Types for the ECP evaluation framework.
 *
 * Eval cases define expected behavior and rubric-based scoring
 * criteria for agent outputs. Used for regression testing and
 * quality assurance of LLM-driven execution.
 *
 * @category Evals
 */

/**
 * A single criterion in a scoring rubric.
 *
 * @category Evals
 */
export interface RubricCriterion {
  /** Human-readable name for this criterion. */
  name: string;

  /** Description of what this criterion checks. */
  description: string;

  /** Weight of this criterion (0-1). All weights should sum to 1. */
  weight: number;

  /** The type of check to perform. */
  check:
    | { type: "schema-valid" }
    | { type: "field-exists"; path: string }
    | { type: "field-matches"; path: string; pattern: string }
    | { type: "array-min-length"; path: string; min: number }
    | { type: "no-forbidden-tools"; forbidden: string[] }
    | { type: "tool-count-within"; max: number }
    | { type: "custom"; fn: string };
}

/**
 * Expected outcome definition for an eval case.
 *
 * @category Evals
 */
export interface EvalExpected {
  /** Rubric criteria the output must satisfy. */
  rubric: RubricCriterion[];

  /** Minimum overall score (0-1) to pass. */
  minScore: number;

  /** Hard gates that must pass regardless of score. */
  hardGates?: string[];
}

/**
 * An eval case definition.
 *
 * @category Evals
 */
export interface EvalCase {
  /** Unique case ID. */
  id: string;

  /** Human-readable description. */
  description: string;

  /** Path to the Context manifest for this case. */
  contextPath: string;

  /** Inputs to supply to the Context. */
  inputs: Record<string, string | number | boolean>;

  /** Expected outcome and scoring rubric. */
  expected: EvalExpected;
}

/**
 * The result of evaluating a single rubric criterion.
 *
 * @category Evals
 */
export interface CriterionResult {
  /** The criterion that was evaluated. */
  criterion: RubricCriterion;

  /** Whether the criterion passed. */
  passed: boolean;

  /** The score for this criterion (0 or weight). */
  score: number;

  /** Human-readable explanation. */
  message: string;
}

/**
 * The result of running an eval case.
 *
 * @category Evals
 */
export interface EvalResult {
  /** The case that was evaluated. */
  caseId: string;

  /** Whether the eval passed (score >= minScore and all hard gates pass). */
  passed: boolean;

  /** Overall score (0-1). */
  score: number;

  /** Per-criterion results. */
  criteria: CriterionResult[];

  /** The execution result from the engine. */
  executionDurationMs: number;

  /** Error if the run itself failed. */
  error?: string;
}

/**
 * Summary of an eval suite run.
 *
 * @category Evals
 */
export interface EvalSuiteResult {
  /** Total cases run. */
  totalCases: number;

  /** Cases that passed. */
  passedCases: number;

  /** Overall pass rate (0-1). */
  passRate: number;

  /** Per-case results. */
  results: EvalResult[];

  /** Total wall-clock time. */
  totalDurationMs: number;
}
