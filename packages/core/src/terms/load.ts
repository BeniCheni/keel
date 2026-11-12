import { LineCounter, parseDocument } from "yaml";
import { collectDateFlags, referentialDiagnostics } from "./checks.ts";
import { indexDocument, positionAt } from "./locate.ts";
import { diagnostic } from "./messages.ts";
import { projectTerms } from "./project.ts";
import { schemaDiagnostics } from "./schema-map.ts";
import type { Diagnostic, LoadResult, Terms } from "./types.ts";

const INTEGER_OWNERS = new Set([
  "call.level",
  "call.non_call_months",
  "premium.rate_per_year",
  "barrier.level",
  "economics.issue_price",
  "economics.estimated_value",
  "economics.fees",
]);

const PLAIN_INTEGER = /^(?:0|-?[1-9][0-9]*)$/;
const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);
const SCHEMA_IDS = ["mln-terms/0.1", "mln-terms/0.2"] as const;

function isIntegerValuePath(path: string): boolean {
  if (!path.endsWith(".value")) return false;
  const owner = path.slice(0, -".value".length).replace(/\.candidates\[\d+\]$/, "");
  return INTEGER_OWNERS.has(owner);
}

function integerCode(raw: string): "wrong-type" | "out-of-range" | null {
  if (!PLAIN_INTEGER.test(raw)) return "wrong-type";
  const digits = raw.startsWith("-") ? raw.slice(1) : raw;
  if (BigInt(digits) > MAX_SAFE) return "out-of-range";
  return null;
}

/** The marker named by line 1, or null when that line is not exactly one of the two schema lines. */
function schemaOnLine(text: string): Terms["schema"] | null {
  const end = text.indexOf("\n");
  const line = end === -1 ? text : text.slice(0, end);
  const stripped = line.endsWith("\r") ? line.slice(0, -1) : line;
  for (const id of SCHEMA_IDS) {
    if (stripped === `schema: ${id}`) return id;
  }
  return null;
}

/** The parsed schema value when it is exactly a marker. A continuation line makes the value longer, so it is not a marker. */
function schemaInData(data: unknown): Terms["schema"] | null {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return null;
  const value = (data as Record<string, unknown>).schema;
  for (const id of SCHEMA_IDS) {
    if (value === id) return id;
  }
  return null;
}

function dedupe(errors: Diagnostic[]): Diagnostic[] {
  const sorted = [...errors].sort(
    (left, right) =>
      left.line - right.line || left.column - right.column || (left.path < right.path ? -1 : left.path > right.path ? 1 : 0),
  );
  const seen = new Set<string>();
  const out: Diagnostic[] = [];
  for (const error of sorted) {
    const key = `${error.code}\0${error.path}\0${error.line}\0${error.column}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(error);
  }
  return out;
}

export function loadTerms(text: string, fileName: string): LoadResult {
  const counter = new LineCounter();
  const doc = parseDocument(text, { version: "1.2", keepSourceTokens: true, lineCounter: counter });
  const syntax = doc.errors.filter((error) => error.code !== "DUPLICATE_KEY");
  if (syntax.length > 0 || doc.contents === null) {
    const errors =
      syntax.length === 0
        ? [diagnostic(fileName, "yaml-syntax", "", 1, 1)]
        : syntax.map((error) => {
            const offset = error.pos[0] ?? 0;
            const pos = positionAt(counter, offset);
            return diagnostic(fileName, "yaml-syntax", "", pos.line, pos.column);
          });
    return { ok: false, errors: dedupe(errors) };
  }
  const index = indexDocument(doc, text, counter);
  const errors: Diagnostic[] = [];
  const lineSchema = schemaOnLine(text);
  if (lineSchema === null) errors.push(diagnostic(fileName, "schema-line", "schema", 1, 1));
  for (const site of index.tags) {
    errors.push(diagnostic(fileName, "yaml-syntax", site.path, site.pos.line, site.pos.column));
  }
  for (const site of index.duplicates) {
    errors.push(diagnostic(fileName, "duplicate-key", site.path, site.pos.line, site.pos.column));
  }
  const aliasSites = index.aliases.length > 0 ? index.aliases : index.anchors;
  for (const site of aliasSites) errors.push(diagnostic(fileName, "alias", site.path, site.pos.line, site.pos.column));
  const integerFaultPaths = new Set<string>();
  for (const [path, scalar] of index.scalars) {
    if (!isIntegerValuePath(path)) continue;
    // A null token is the schema's to judge: legal under unknown, status-fields under any other status.
    if (scalar.value === null) continue;
    const code = integerCode(scalar.raw);
    if (code === null) continue;
    integerFaultPaths.add(path);
    errors.push(diagnostic(fileName, code, path, scalar.pos.line, scalar.pos.column));
  }
  let data: unknown;
  try {
    data = doc.toJS();
  } catch {
    // yaml throws here on an alias it cannot resolve and on an alias chain past its count limit.
    // The alias sites are already diagnostics; a throw with none recorded still names the fault.
    if (!errors.some((error) => error.code === "alias")) errors.push(diagnostic(fileName, "alias", "", 1, 1));
    return { ok: false, errors: dedupe(errors) };
  }
  const dataSchema = schemaInData(data);
  if (dataSchema === null || (lineSchema !== null && dataSchema !== lineSchema)) {
    errors.push(diagnostic(fileName, "schema-line", "schema", 1, 1));
  }
  // Line 1 picks the schema. When line 1 is not a marker the file is already schema-line, and the parsed value picks it,
  // so a 0.2 file is not also judged against 0.1. When neither names a marker, 0.1 judges it.
  const schemaErrors = schemaDiagnostics(data, index, fileName, lineSchema ?? dataSchema ?? "mln-terms/0.1");
  // The source-token fault takes precedence over the parsed number's type or range at the same path.
  errors.push(...schemaErrors.filter((error) => !integerFaultPaths.has(error.path)));
  if (schemaErrors.length === 0) {
    const terms = projectTerms(data);
    const extra = referentialDiagnostics(terms, index, fileName);
    errors.push(...extra.errors);
    if (errors.length === 0) {
      return { ok: true, terms, warnings: dedupe(extra.warnings), dateFlags: collectDateFlags(terms) };
    }
  }
  return { ok: false, errors: dedupe(errors) };
}
