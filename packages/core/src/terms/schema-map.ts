import Ajv from "ajv/dist/2020.js";
import type { ErrorObject } from "ajv";
import schema from "../../../../schemas/mln-terms/0.1.json" with { type: "json" };
import { missingPos, nodePos, type DocIndex } from "./locate.ts";
import { diagnostic } from "./messages.ts";
import type { Diagnostic } from "./types.ts";

const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile(schema);

const DATE_OWNERS = new Set([
  "dates.trade",
  "dates.settlement",
  "dates.maturity",
  "dates.first_call_observation",
]);

function pointerPath(pointer: string): string {
  if (pointer === "" || pointer === "/") return "";
  const parts = pointer
    .split("/")
    .slice(1)
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
  let out = "";
  for (const part of parts) {
    if (/^(0|[1-9][0-9]*)$/.test(part)) out += `[${part}]`;
    else out += out.length === 0 ? part : `.${part}`;
  }
  return out;
}

function joinPath(parent: string, child: string): string {
  if (parent === "") return child;
  return `${parent}.${child}`;
}

function isDateValue(path: string): boolean {
  if (!path.endsWith(".value")) return false;
  const owner = path.slice(0, -".value".length).replace(/\.candidates\[\d+\]$/, "");
  return DATE_OWNERS.has(owner) || /^dates\.observation_schedule\[\d+\]$/.test(owner);
}

function codeFor(path: string, error: ErrorObject): string {
  const keyword = error.keyword;
  const params = error.params as Record<string, unknown>;
  if (keyword === "additionalProperties") return "unknown-key";
  if (keyword === "required") {
    const missing = String(params.missingProperty);
    if (missing === "candidates") return "conflict-candidates";
    if (missing === "source" || missing === "rule" || missing === "note" || missing === "value") return "status-fields";
    return "missing-required";
  }
  if (keyword === "type") return params.type === "null" ? "status-fields" : "wrong-type";
  if (keyword === "enum") return path === "status" || path.endsWith(".status") ? "unknown-status" : "wrong-type";
  if (keyword === "const" || keyword === "pattern") {
    if (path.endsWith(".file")) return "source-path";
    if (isDateValue(path)) return "invalid-date";
    return "wrong-type";
  }
  if (keyword === "not") return "status-fields";
  if (keyword === "minItems") return path.endsWith(".candidates") ? "conflict-candidates" : "out-of-range";
  if (
    keyword === "minimum" ||
    keyword === "maximum" ||
    keyword === "exclusiveMinimum" ||
    keyword === "exclusiveMaximum" ||
    keyword === "minLength" ||
    keyword === "maxLength" ||
    keyword === "minItems" ||
    keyword === "maxItems" ||
    keyword === "minProperties" ||
    keyword === "maxProperties"
  ) {
    return "out-of-range";
  }
  return "wrong-type";
}

function errorPath(error: ErrorObject): string {
  const base = pointerPath(error.instancePath);
  const params = error.params as Record<string, unknown>;
  if (error.keyword === "additionalProperties" && typeof params.additionalProperty === "string") {
    return joinPath(base, params.additionalProperty);
  }
  if (error.keyword === "required" && typeof params.missingProperty === "string") {
    return joinPath(base, params.missingProperty);
  }
  return base;
}

export function schemaDiagnostics(data: unknown, index: DocIndex, fileName: string): Diagnostic[] {
  if (validate(data)) return [];
  const found: Diagnostic[] = [];
  for (const error of validate.errors ?? []) {
    if (error.keyword === "if") continue;
    if (error.instancePath === "/schema" || error.instancePath === "schema") continue;
    const path = errorPath(error);
    const pos =
      error.keyword === "required"
        ? missingPos(path, index)
        : error.keyword === "additionalProperties"
          ? (index.keys.get(path) ?? { line: 1, column: 1 })
          : nodePos(path, index);
    found.push(diagnostic(fileName, codeFor(path, error), path, pos.line, pos.column));
  }
  return found;
}
