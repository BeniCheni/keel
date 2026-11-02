import type { Diagnostic } from "./types.ts";

const TEXT: Record<string, string> = {
  "yaml-syntax": "The terms text is not valid YAML",
  "schema-line": "Line 1 is not the schema marker mln-terms/0.1",
  "duplicate-key": "This key is repeated in the same mapping",
  alias: "An anchor or alias is present in the terms text",
  "unknown-key": "This key is not defined by the terms schema",
  "missing-required": "A required field is missing",
  "wrong-type": "This value is the wrong type",
  "out-of-range": "This value is outside the accepted range",
  "invalid-date": "This value is not a real calendar date",
  "unknown-status": "This status is not a known term status",
  "status-fields": "The fields on this term do not match its status",
  "conflict-candidates": "A conflict lists fewer than two candidates",
  "source-missing": "This source is not listed in sources",
  "source-kind": "This source kind does not match the term status",
  "source-path": "This source path is not a portable relative path",
  "schedule-order": "These observation dates are not strictly increasing",
  "cusip-check-digit": "The CUSIP check digit does not match",
  "duplicate-ticker": "This ticker is repeated in the basket",
};

export function diagnostic(
  fileName: string,
  code: string,
  path: string,
  line: number,
  column: number,
): Diagnostic {
  const text = TEXT[code] ?? "The terms text could not be read";
  return { code, path, line, column, message: `${text} (${fileName}).` };
}
