import { expect, test } from "vitest";
import type { Diagnostic } from "./types.ts";
import { loadTerms } from "./load.ts";
import { termsManifest, textOf, textsIn } from "./fixtures.ts";

const BANNED = /(?:^|[^A-Za-z])(should|buy|sell|hold)(?![A-Za-z])/i;

test("discovered invalid files match the manifest", () => {
  const names = [...textsIn("invalid").keys()].sort();
  expect(names).toEqual(termsManifest.invalid.map((row) => row.file).sort());
});

test("each invalid fixture has its one diagnostic", () => {
  for (const row of termsManifest.invalid) {
    const result = loadTerms(textOf("invalid", row.file), row.file);
    expect(result.ok, row.file).toBe(false);
    if (result.ok) continue;
    expect(result.errors, row.file).toEqual([
      expect.objectContaining({
        code: row.code,
        path: row.path,
        line: row.line,
        column: row.column,
      }),
    ]);
    const error = result.errors[0];
    expect(error?.message.endsWith(`(${row.file}).`), row.file).toBe(true);
  }
});

test("yaml syntax and a bad check digit are reported from edited text", () => {
  const minimal = textOf("valid", "minimal.yaml");
  const broken = minimal.replace("id: note-min\n", "id: [\n");
  const syntax = loadTerms(broken, "minimal.yaml");
  expect(syntax.ok).toBe(false);
  if (!syntax.ok) {
    expect(syntax.errors.length).toBeGreaterThan(0);
    expect(syntax.errors.every((error) => error.code === "yaml-syntax")).toBe(true);
  }

  const anchored = minimal.replace("issuer:\n", "issuer: &bank\n");
  const alias = loadTerms(anchored, "minimal.yaml");
  expect(alias.ok).toBe(false);
  if (!alias.ok) {
    expect(alias.errors.map((error) => error.code)).toEqual(["alias"]);
  }

  const exampleText = textOf("valid", "example-autocall.yaml");
  const example = loadTerms(exampleText, "example-autocall.yaml");
  expect(example.ok).toBe(true);
  if (!example.ok) return;
  const cusip = example.terms.identifiers?.cusip;
  expect(cusip).toBeDefined();
  if (!cusip || cusip.status === "unknown" || cusip.status === "conflict") return;
  const flipped = `${cusip.value.slice(0, 8)}${cusip.value[8] === "0" ? "1" : "0"}`;
  const warned = loadTerms(exampleText.replaceAll(cusip.value, flipped), "example-autocall.yaml");
  expect(warned.ok).toBe(true);
  if (warned.ok) expect(warned.warnings.map((warning) => warning.code)).toEqual(["cusip-check-digit"]);
});

test("diagnostic messages stay inside the copy rules", () => {
  const messages: string[] = [];
  const take = (items: Diagnostic[]): void => {
    for (const item of items) messages.push(item.message);
  };
  for (const row of termsManifest.invalid) {
    const result = loadTerms(textOf("invalid", row.file), row.file);
    if (!result.ok) take(result.errors);
  }
  const minimal = textOf("valid", "minimal.yaml");
  const syntax = loadTerms(minimal.replace("id: note-min\n", "id: [\n"), "minimal.yaml");
  if (!syntax.ok) take(syntax.errors);
  const exampleText = textOf("valid", "example-autocall.yaml");
  const example = loadTerms(exampleText, "example-autocall.yaml");
  if (example.ok) {
    const cusip = example.terms.identifiers?.cusip;
    if (cusip && cusip.status !== "unknown" && cusip.status !== "conflict") {
      const flipped = `${cusip.value.slice(0, 8)}${cusip.value[8] === "0" ? "1" : "0"}`;
      const warned = loadTerms(exampleText.replaceAll(cusip.value, flipped), "example-autocall.yaml");
      if (warned.ok) take(warned.warnings);
    }
  }
  expect(messages.length).toBeGreaterThan(termsManifest.invalid.length);
  for (const message of messages) expect(message).not.toMatch(BANNED);
});

test("a repeated ticker and a zero price are loader errors", () => {
  const minimal = textOf("valid", "minimal.yaml");
  const duplicate = loadTerms(minimal.replace("ticker: BRVO", "ticker: ALFA"), "minimal.yaml");
  expect(duplicate.ok).toBe(false);
  if (!duplicate.ok) {
    expect(duplicate.errors).toEqual([
      expect.objectContaining({ code: "duplicate-ticker", path: "underlyings.members[1].ticker" }),
    ]);
  }
  const zero = loadTerms(minimal.replace('value: "100.25"', 'value: "0"'), "minimal.yaml");
  expect(zero.ok).toBe(false);
  if (!zero.ok) {
    expect(zero.errors).toEqual([
      expect.objectContaining({ code: "out-of-range", path: "underlyings.members[0].initial.value" }),
    ]);
  }
});

test("an alias the parser cannot resolve is a diagnostic, not a throw", () => {
  const minimal = textOf("valid", "minimal.yaml");
  const unresolved = loadTerms(minimal.replace('value: "Example Bank SA"', "value: *nope"), "minimal.yaml");
  expect(unresolved.ok).toBe(false);
  if (!unresolved.ok) {
    expect(unresolved.errors).toEqual([
      expect.objectContaining({ code: "alias", path: "issuer.value", line: 6, column: 10 }),
    ]);
  }

  let chain = minimal.replace("id: note-min\n", "id: note-min\nz0: &a0 [1]\n");
  for (let i = 1; i <= 6; i += 1) {
    chain += `z${i}: &a${i} [${Array.from({ length: 10 }, () => `*a${i - 1}`).join(", ")}]\n`;
  }
  const exhausted = loadTerms(chain, "minimal.yaml");
  expect(exhausted.ok).toBe(false);
  if (!exhausted.ok) {
    expect(exhausted.errors.length).toBe(60);
    expect(exhausted.errors.every((error) => error.code === "alias")).toBe(true);
  }
});
