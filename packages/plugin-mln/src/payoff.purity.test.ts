import { expect, test } from "vitest";
import { finalPayout, evaluateNote, noteMetrics, payoutSchedule } from "./index.ts";
import { calendar, readGolden } from "./test-support/access.test.ts";

interface ListedDirent {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
}

declare global {
  interface ImportMeta {
    glob(pattern: string, options: { query: "?raw"; import: "default"; eager: true }): Record<string, string>;
  }
}

// @ts-expect-error TS2591
import { mkdirSync, mkdtempSync, readdirSync as readDirectory, rmSync, writeFileSync } from "node:fs";
// @ts-expect-error TS2591
import { tmpdir } from "node:os";
// @ts-expect-error TS2591
import { join } from "node:path";

const readdirSync = readDirectory as (path: string, options: { withFileTypes: true }) => ListedDirent[];

declare const performance: { now: () => number };
declare const crypto: { getRandomValues: (value: unknown) => unknown; randomUUID: () => string };
declare const console: Record<string, (...args: unknown[]) => unknown>;

const PURE_NAMES = [
  "Array",
  "BigInt",
  "Boolean",
  "Error",
  "Infinity",
  "JSON",
  "Map",
  "Math",
  "NaN",
  "Number",
  "Object",
  "RangeError",
  "Set",
  "String",
  "TypeError",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "undefined",
] as const;

const sources = import.meta.glob("./**/*.ts", { query: "?raw", import: "default", eager: true });

function ambientNames(): string[] {
  const pure = new Set<string>(PURE_NAMES);
  return Object.getOwnPropertyNames(globalThis).filter((name) => !pure.has(name));
}

function wholeWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![A-Za-z0-9_$])${escaped}(?![A-Za-z0-9_$])`).test(text);
}

const LINE_END = /[\n\r\u2028\u2029]/;

function skipGap(text: string, index: number): number {
  let cursor = index;
  while (cursor < text.length) {
    const ch = text[cursor] ?? "";
    if (/\s/.test(ch)) {
      cursor += 1;
      continue;
    }
    if (ch === "/" && text[cursor + 1] === "/") {
      cursor += 2;
      while (cursor < text.length && !LINE_END.test(text[cursor] ?? "")) cursor += 1;
      continue;
    }
    if (ch === "/" && text[cursor + 1] === "*") {
      cursor += 2;
      while (cursor < text.length && !(text[cursor] === "*" && text[cursor + 1] === "/")) cursor += 1;
      if (cursor < text.length) cursor += 2;
      continue;
    }
    break;
  }
  return cursor;
}

function importPunctuation(text: string): boolean {
  for (const match of text.matchAll(/(?<![A-Za-z0-9_$])import/g)) {
    const at = match.index;
    if (at === undefined) continue;
    const next = text[skipGap(text, at + "import".length)];
    if (next === "(" || next === ".") return true;
  }
  return false;
}

function specifiers(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(/(?<![A-Za-z0-9_$])(?:from|import)(?![A-Za-z0-9_$])/g)) {
    const at = match.index;
    if (at === undefined) continue;
    const open = skipGap(text, at + match[0].length);
    const quote = text[open];
    if (quote !== '"' && quote !== "'") continue;
    const close = text.indexOf(quote, open + 1);
    found.push(close === -1 ? text.slice(open + 1) : text.slice(open + 1, close));
  }
  return found;
}

function resolveSpecifier(file: string, spec: string): string | null {
  if (spec === "@keel/core") return "@keel/core";
  if (!spec.startsWith("./") && !spec.startsWith("../")) return null;
  const parts = file.split("/").slice(0, -1);
  for (const part of spec.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (parts.length === 0) return null;
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  if (parts[0] !== ".") return null;
  const resolved = parts.join("/");
  if (!resolved.endsWith(".ts")) return null;
  return resolved;
}

function mathMisuse(text: string): boolean {
  return /(?<![A-Za-z0-9_$])Math(?![A-Za-z0-9_$])(?!\.(?:floor|ceil|min|max|abs|trunc)(?![A-Za-z0-9_$]))/.test(text);
}

function purityHits(text: string, file = "./engine.ts", known?: Set<string>): string[] {
  const hits: string[] = [];
  for (const spec of specifiers(text)) {
    const resolved = resolveSpecifier(file, spec);
    if (resolved === null) hits.push(`specifier:${spec}`);
    else if (resolved.endsWith(".test.ts")) hits.push("specifier-test");
    else if (!file.includes("/test-support/") && resolved.includes("/test-support/")) hits.push("specifier-support");
    else if (known !== undefined && resolved !== "@keel/core" && !known.has(resolved)) hits.push(`specifier-missing:${resolved}`);
  }
  if (importPunctuation(text)) hits.push("import-punctuation");
  if (/\\[ux]/.test(text)) hits.push("escape");
  for (const word of ["constructor", "require", "__dirname", "__filename"]) {
    if (wholeWord(text, word)) hits.push(`word:${word}`);
  }
  if (/locale/i.test(text)) hits.push("locale");
  if (/stack/i.test(text)) hits.push("stack");
  if (mathMisuse(text)) hits.push("math");
  for (const name of ambientNames()) {
    if (wholeWord(text, name)) hits.push(`ambient:${name}`);
  }
  return hits;
}

const NEGATIVES: Array<{ snippet: string; rule: string; label?: string; file?: string; known?: string[] }> = [
  { snippet: "import { readFileSync } from 'node:fs'", rule: "specifier:node:fs" },
  { snippet: 'import { readFileSync } from "node:fs"', rule: "specifier:node:fs" },
  { snippet: "import fs from 'fs'", rule: "specifier:fs" },
  { snippet: 'export * from "ajv"', rule: "specifier:ajv" },
  { snippet: "Date.UTC(2026, 0, 1)", rule: "ambient:Date" },
  { snippet: "new Date()", rule: "ambient:Date" },
  { snippet: "Date.now()", rule: "ambient:Date" },
  { snippet: "Intl.Collator()", rule: "ambient:Intl" },
  { snippet: "a.localeCompare(b)", rule: "locale" },
  { snippet: "performance.now()", rule: "ambient:performance" },
  { snippet: "process.env", rule: "ambient:process" },
  { snippet: "globalThis.x", rule: "ambient:globalThis" },
  { snippet: 'console.log("x")', rule: "ambient:console" },
  { snippet: 'fetch("x")', rule: "ambient:fetch" },
  { snippet: 'eval("1")', rule: "ambient:eval" },
  { snippet: 'new Function("return 1")', rule: "ambient:Function" },
  { snippet: "x.constructor", rule: "word:constructor" },
  { snippet: 'Reflect.get(a, "b")', rule: "ambient:Reflect" },
  { snippet: 'require("fs")', rule: "word:require" },
  { snippet: 'require("./x.ts")', rule: "word:require" },
  { snippet: "require(name)", rule: "word:require" },
  { snippet: 'import("fs")', rule: "import-punctuation" },
  { snippet: 'import("./x.ts")', rule: "import-punctuation" },
  { snippet: "Math.random()", rule: "math" },
  { snippet: 'Math["random"]()', rule: "math" },
  { snippet: "const m = Math", rule: "math" },
  { snippet: "crypto.getRandomValues(new Uint32Array(1))", rule: "ambient:crypto" },
  { snippet: '"i".toLocaleUpperCase()', rule: "locale" },
  { snippet: "x.toLocaleString()", rule: "locale" },
  { snippet: "setTimeout(f, 0)", rule: "ambient:setTimeout" },
  { snippet: "navigator.language", rule: "ambient:navigator" },
  { snippet: 'new WebSocket("x")', rule: "ambient:WebSocket" },
  { snippet: "RegExp.$1", rule: "ambient:RegExp" },
  { snippet: 'new Error("x").stack', rule: "stack" },
  { snippet: "Error.captureStackTrace(x)", rule: "stack" },
  { snippet: "import.meta.url", rule: "import-punctuation" },
  { snippet: "__dirname", rule: "word:__dirname" },
  { snippet: "__filename", rule: "word:__filename" },
  { snippet: "import /* module source */ .meta.url", rule: "import-punctuation" },
  { snippet: "Symbol(1)", rule: "ambient:Symbol" },
  { snippet: "new WeakMap()", rule: "ambient:WeakMap" },
  { snippet: "new WeakSet()", rule: "ambient:WeakSet" },
  { snippet: 'import{readFileSync}from"node:fs"', rule: "specifier:node:fs" },
  { snippet: 'export*from"fs"', rule: "specifier:fs" },
  { snippet: 'export{x}from"fs"', rule: "specifier:fs" },
  { snippet: ';import"fs"', rule: "specifier:fs" },
  { snippet: 'import /* c */ "node:fs"', rule: "specifier:node:fs" },
  { snippet: 'import x from /* c */ "node:fs"', rule: "specifier:node:fs" },
  { snippet: 'import x from // c\n"node:fs"', rule: "specifier:node:fs", label: 'import x from, a line comment, "node:fs"' },
  { snippet: 'import\u00a0("fs")', rule: "import-punctuation", label: 'import, U+00A0, ("fs")' },
  { snippet: "import\u2028.meta.url", rule: "import-punctuation", label: "import, U+2028, .meta.url" },
  { snippet: "import\ufeff.meta.url", rule: "import-punctuation", label: "import, U+FEFF, .meta.url" },
  { snippet: 'import // c\r("fs")', rule: "import-punctuation", label: 'import, a line comment ended by U+000D, ("fs")' },
  { snippet: 'import "@keel/core/src/terms/load.ts"', rule: "specifier:@keel/core/src/terms/load.ts" },
  { snippet: 'import x from "../../core/src/index.ts"', rule: "specifier:../../core/src/index.ts" },
  { snippet: 'import y from "./test-support/z.ts"', rule: "specifier-support" },
  { snippet: 'import z from "./z.test.ts"', rule: "specifier-test" },
  { snippet: 'import x from "../outside.ts"', rule: "specifier:../outside.ts" },
  { snippet: 'import x from "../../outside.ts"', rule: "specifier:../../outside.ts", file: "./test-support/closes.ts" },
  { snippet: 'import x from "./absent.ts"', rule: "specifier-missing:./absent.ts", known: ["./engine.ts"] },
  { snippet: "const \\u0061 = 1", rule: "escape", label: "backslash u in an identifier" },
  { snippet: 'const s = "\\x41"', rule: "escape", label: "backslash x in a string" },
];

const POSITIVES = [
  'import { observationSchedule } from "@keel/core"',
  'import { formatRatio } from "./fraction.ts"',
  "BigInt(10) ** 6n",
  "Math.floor(x / 4)",
  "Object.keys(x)",
  "new Map()",
  "Number.isInteger(x)",
  'new Error("x")',
  "/^(\\d{4})$/.exec(s)",
];

test("ambient names come from the running global object", () => {
  const names = ambientNames();
  expect(names).toContain("crypto");
  expect(names).toContain("setTimeout");
  expect(names).toContain("console");
  expect(names).toContain("Date");
  expect(names).not.toContain("Array");
  expect(names).not.toContain("BigInt");
  for (const name of ["Symbol", "WeakMap", "WeakSet"]) expect(names, name).toContain(name);
});

for (const item of NEGATIVES) {
  test(`purity rejects ${item.label ?? item.snippet}`, () => {
    const known = item.known === undefined ? undefined : new Set(item.known);
    expect(purityHits(item.snippet, item.file ?? "./engine.ts", known), item.snippet).toContain(item.rule);
  });
}

for (const snippet of POSITIVES) {
  test(`purity accepts ${snippet}`, () => {
    expect(purityHits(snippet), snippet).toEqual([]);
  });
}

function sourceRoot(): string {
  const url = import.meta.url;
  if (!url.startsWith("file://")) throw new Error("purity test is not a file URL");
  const file = decodeURIComponent(url.slice("file://".length));
  const slash = file.lastIndexOf("/");
  if (slash < 0) throw new Error("purity test has no directory");
  return file.slice(0, slash);
}

/** Every entry under dir except `*.test.ts`, whatever its extension, so a file the glob cannot see is still listed. */
function listedSources(dir: string, prefix: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory()) found.push(...listedSources(`${dir}/${entry.name}`, rel));
    else if (!rel.endsWith(".test.ts")) found.push(`./${rel}`);
  }
  return found;
}

/** The two listing rules. Empty when the glob's keys equal the listing and every listed file ends in `.ts`. */
function listingFailures(globbed: string[], listed: string[]): string[] {
  const failures: string[] = [];
  if ([...globbed].sort().join("\n") !== [...listed].sort().join("\n")) failures.push("comparison");
  if (listed.some((file) => !file.endsWith(".ts"))) failures.push("extension");
  return failures;
}

function globbedSources(): string[] {
  return Object.keys(sources)
    .filter((file) => !file.endsWith(".test.ts"))
    .sort();
}

test("payoff sources pass the purity checker", () => {
  const files = Object.entries(sources).filter(([file]) => !file.endsWith(".test.ts"));
  expect(files.length).toBeGreaterThan(0);
  const listed = listedSources(sourceRoot(), "").sort();
  const globbed = globbedSources();
  expect(listingFailures(globbed, listed), `glob ${globbed.join(" ")} listing ${listed.join(" ")}`).toEqual([]);
  expect(listed).toContain("./test-support/nested/depth-marker.ts");
  const known = new Set(globbed);
  const joined = files.map(([, text]) => text).join("\n");
  expect(joined).toContain("export function evaluateNote");
  expect(joined).toContain("PAYOFF_DEPTH_MARKER");
  for (const [file, text] of files) {
    expect(purityHits(text, file, known), `${file} ${purityHits(text, file, known).join(" ")}`).toEqual([]);
  }
});

test("a one-level glob misses the depth marker", () => {
  const narrowed = globbedSources().filter((file) => file.split("/").length < 4);
  const listed = listedSources(sourceRoot(), "").sort();
  expect(listingFailures(narrowed, listed)).toEqual(["comparison"]);
  expect(narrowed).not.toContain("./test-support/nested/depth-marker.ts");
});

test("synthetic listings fail the comparison and the extension rule", () => {
  const listed = listedSources(sourceRoot(), "").sort();
  const globbed = globbedSources();
  expect(listingFailures(globbed, listed)).toEqual([]);
  for (const name of ["./x.mts", "./x.js", "./x.json"]) {
    expect(listingFailures(globbed, [...listed, name]), name).toEqual(["comparison", "extension"]);
    expect(listingFailures([...globbed, name], [...listed, name]), name).toEqual(["extension"]);
  }
});

test("a file on disk that is not .ts is listed and fails both rules", () => {
  const dir = mkdtempSync(join(tmpdir(), "keel-purity-")) as string;
  try {
    mkdirSync(join(dir, "nested"));
    for (const name of ["ok.ts", "x.js", "nested/y.mts", "nested/z.json", "skipped.test.ts"]) {
      writeFileSync(join(dir, name), "export {};\n");
    }
    const listed = listedSources(dir, "").sort();
    expect(listed).toEqual(["./nested/y.mts", "./nested/z.json", "./ok.ts", "./x.js"]);
    expect(listingFailures(["./ok.ts"], listed)).toEqual(["comparison", "extension"]);
    expect(listingFailures(["./ok.ts"], ["./ok.ts"])).toEqual([]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

function consoleMethods(): string[] {
  const names: string[] = [];
  for (const name of Object.getOwnPropertyNames(console)) {
    const desc = Object.getOwnPropertyDescriptor(console, name);
    if (desc !== undefined && "value" in desc && typeof desc.value === "function") names.push(name);
  }
  return names;
}

function replace(target: object, key: string, value: unknown): () => void {
  let owner: object | null = target;
  while (owner !== null) {
    const desc = Object.getOwnPropertyDescriptor(owner, key);
    if (desc !== undefined) {
      const saved = desc;
      const host = owner;
      Object.defineProperty(host, key, { configurable: true, enumerable: Boolean(desc.enumerable), writable: true, value });
      return () => {
        Object.defineProperty(host, key, saved);
      };
    }
    owner = Object.getPrototypeOf(owner) as object | null;
  }
  throw new Error(`missing ${key}`);
}

function installStubs(): { counts: Map<string, number>; restore: () => void } {
  const counts = new Map<string, number>();
  const restores: Array<() => void> = [];
  const hook = (key: string, target: object, prop: string, fn: () => unknown) => {
    counts.set(key, 0);
    restores.push(
      replace(target, prop, () => {
        counts.set(key, (counts.get(key) ?? 0) + 1);
        return fn();
      }),
    );
  };
  hook("Math.random", Math, "random", () => 0);
  hook("Date.now", Date, "now", () => 0);
  hook("performance.now", performance, "now", () => 0);
  hook("fetch", globalThis, "fetch", () => undefined);
  hook("crypto.getRandomValues", crypto, "getRandomValues", () => undefined);
  hook("crypto.randomUUID", crypto, "randomUUID", () => "");
  hook("String.prototype.toLocaleUpperCase", String.prototype, "toLocaleUpperCase", () => "");
  hook("String.prototype.toLocaleLowerCase", String.prototype, "toLocaleLowerCase", () => "");
  hook("String.prototype.localeCompare", String.prototype, "localeCompare", () => 0);
  hook("Number.prototype.toLocaleString", Number.prototype, "toLocaleString", () => "");
  for (const method of consoleMethods()) hook(`console.${method}`, console, method, () => undefined);
  return {
    counts,
    restore: () => {
      for (const restore of restores.reverse()) restore();
    },
  };
}

function withStubs(run: () => void): Map<string, number> {
  const installed = installStubs();
  try {
    run();
  } finally {
    installed.restore();
  }
  return installed.counts;
}

/** The stubs a run touched. */
function touched(counts: Map<string, number>): string[] {
  const keys: string[] = [];
  for (const [key, count] of counts) {
    if (count !== 0) keys.push(key);
  }
  return keys;
}

function calls(): Array<{ key: string; run: () => void }> {
  const host = globalThis as unknown as { fetch: (input: string) => unknown };
  return [
    { key: "Math.random", run: () => void Math.random() },
    { key: "Date.now", run: () => void Date.now() },
    { key: "performance.now", run: () => void performance.now() },
    { key: "fetch", run: () => void host.fetch("x") },
    { key: "crypto.getRandomValues", run: () => void crypto.getRandomValues(undefined) },
    { key: "crypto.randomUUID", run: () => void crypto.randomUUID() },
    { key: "String.prototype.toLocaleUpperCase", run: () => void "a".toLocaleUpperCase() },
    { key: "String.prototype.toLocaleLowerCase", run: () => void "a".toLocaleLowerCase() },
    { key: "String.prototype.localeCompare", run: () => void "a".localeCompare("b") },
    { key: "Number.prototype.toLocaleString", run: () => void (1).toLocaleString() },
    ...consoleMethods().map((method) => ({
      key: `console.${method}`,
      run: () => {
        const fn = console[method];
        if (fn !== undefined) fn();
      },
    })),
  ];
}

test("console methods include the printing methods", () => {
  expect(consoleMethods()).toEqual(expect.arrayContaining(["log", "info", "warn", "error", "debug"]));
});

test("each runtime stub counts only its own call", () => {
  for (const item of calls()) {
    const counts = withStubs(() => {
      item.run();
    });
    expect(counts.get(item.key), item.key).toBe(1);
    for (const [key, count] of counts) {
      if (key !== item.key) expect(count, `${item.key} vs ${key}`).toBe(0);
    }
  }
});

test("public payoff functions are stable and do not touch the stubs", () => {
  const nyse = calendar();
  const exercise = () =>
    ["g01-called-first", "g03-live", "g08-unknown-missing", "g11-estimated-stop"].map((id) => {
      const { input } = readGolden(id);
      return [
        evaluateNote(input.terms, nyse, input.closes, input.asOf),
        payoutSchedule(input.terms, nyse),
        finalPayout(input.terms, nyse, "3/5"),
        noteMetrics(input.terms, input.closes, input.asOf),
      ];
    });
  const installed = installStubs();
  let left = "";
  let right = "";
  try {
    left = JSON.stringify(exercise());
    right = JSON.stringify(exercise());
  } finally {
    installed.restore();
  }
  expect(left).toBe(right);
  expect(touched(installed.counts)).toEqual([]);
});

test("the stub check names a stub that a run touches", () => {
  const counts = withStubs(() => {
    void Date.now();
    void Math.random();
  });
  expect(touched(counts).sort()).toEqual(["Date.now", "Math.random"]);
});
