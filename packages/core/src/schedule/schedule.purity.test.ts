import { expect, test } from "vitest";
import {
  nyseRulesCalendar,
  observationSchedule,
  scheduleDateFlags,
  scheduleDiff,
  termDateFlags,
} from "../index.ts";
import type { Terms } from "../terms/types.ts";
import { loadExample, loadMinimal } from "./samples.ts";
import type { ExchangeCalendar } from "./types.ts";

declare const performance: { now: () => number };
declare const crypto: { getRandomValues: (value: unknown) => unknown; randomUUID: () => string };
declare const console: Record<string, (...args: unknown[]) => unknown>;

const PURE_NAMES = [
  "Array",
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

const sources = import.meta.glob("./**/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});

function ambientNames(): string[] {
  const pure = new Set<string>(PURE_NAMES);
  return Object.getOwnPropertyNames(globalThis).filter((name) => !pure.has(name));
}

function wholeWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![A-Za-z0-9_$])${escaped}(?![A-Za-z0-9_$])`).test(text);
}

const LINE_END = /[\n\r\u2028\u2029]/;

/** Skips what JavaScript allows between two tokens: any whitespace or line terminator it accepts (`\s` is that set), and comments. */
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

/** Every string that follows the word `from` or `import`, whatever stands before the word and across any gap after it. */
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

function mathMisuse(text: string): boolean {
  return /(?<![A-Za-z0-9_$])Math(?![A-Za-z0-9_$])(?!\.(?:floor|ceil|min|max|abs|trunc)(?![A-Za-z0-9_$]))/.test(text);
}

function purityHits(text: string): string[] {
  const hits: string[] = [];
  for (const spec of specifiers(text)) {
    if (!spec.startsWith("./") && !spec.startsWith("../")) hits.push(`specifier:${spec}`);
  }
  if (importPunctuation(text)) hits.push("import-punctuation");
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

const NEGATIVES: Array<{ snippet: string; rule: string; label?: string }> = [
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
  { snippet: "BigInt(1)", rule: "ambient:BigInt" },
  { snippet: "Symbol(1)", rule: "ambient:Symbol" },
  { snippet: "new WeakMap()", rule: "ambient:WeakMap" },
  { snippet: "new WeakSet()", rule: "ambient:WeakSet" },
  // Forms found at Pass 1 of PR #30. AC10: "A form found later is added here as a new control".
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
];

const POSITIVES = [
  'import { dayOfWeek } from "../terms/dates.ts"',
  "Math.floor(x / 4)",
  "Object.keys(x)",
  "Number.isInteger(x)",
  "new Map()",
  'new Error("x")',
  "/^(\\d{4})$/.exec(s)",
  "scheduleDateFlags",
];

test("ambient names come from the running global object", () => {
  const names = ambientNames();
  expect(names).toContain("crypto");
  expect(names).toContain("setTimeout");
  expect(names).toContain("console");
  expect(names).toContain("Date");
  expect(names).not.toContain("Array");
  for (const name of ["BigInt", "Symbol", "WeakMap", "WeakSet"]) expect(names, name).toContain(name);
});

for (const item of NEGATIVES) {
  test(`purity rejects ${item.label ?? item.snippet}`, () => {
    expect(purityHits(item.snippet), item.snippet).toContain(item.rule);
  });
}

for (const snippet of POSITIVES) {
  test(`purity accepts ${snippet}`, () => {
    expect(purityHits(snippet), snippet).toEqual([]);
  });
}

test("schedule sources pass the purity checker", () => {
  const files = Object.entries(sources).filter(([file]) => !file.endsWith(".test.ts"));
  expect(files.length).toBeGreaterThan(0);
  const joined = files.map(([, text]) => text).join("\n");
  expect(joined).toContain("export function nyseRulesCalendar");
  expect(joined).toContain("export function observationSchedule");
  for (const [file, text] of files) {
    expect(file.endsWith(".test.ts"), file).toBe(false);
    expect(purityHits(text), `${file} ${purityHits(text).join(" ")}`).toEqual([]);
  }
});

function sameTwice(run: () => unknown): boolean {
  return JSON.stringify(run()) === JSON.stringify(run());
}

test("the repeat comparison rejects a lastIndex stand-in", () => {
  const pattern = /x/g;
  expect(
    sameTwice(() => {
      const found = pattern.exec("x");
      return found === null ? -1 : found.index;
    }),
  ).toBe(false);
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
      Object.defineProperty(host, key, {
        configurable: true,
        enumerable: Boolean(desc.enumerable),
        writable: true,
        value,
      });
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

function anchorDate(terms: Terms): string {
  const anchor = terms.dates.first_call_observation;
  if (anchor.status === "unknown" || anchor.status === "conflict") return "2026-09-01";
  return anchor.value;
}

function exercise(terms: Terms, calendar: ExchangeCalendar): unknown {
  return [
    nyseRulesCalendar(),
    scheduleDateFlags(anchorDate(terms), calendar),
    termDateFlags(terms, calendar),
    observationSchedule(terms, calendar),
    scheduleDiff(terms, calendar),
  ];
}

test("public schedule functions are stable and do not touch the stubs", () => {
  const nyse = nyseRulesCalendar();
  const narrow: ExchangeCalendar = { id: "test-2028", fromYear: 2028, toYear: 2028, closures: [] };
  const case1 = loadMinimal();
  const case8 = loadExample();
  const case13 = loadMinimal();
  const first = case13.dates.first_call_observation;
  const maturity = case13.dates.maturity;
  const frequency = case13.call.frequency;
  if (first.status === "unknown" || first.status === "conflict") throw new Error("anchor");
  if (maturity.status === "unknown" || maturity.status === "conflict") throw new Error("maturity");
  if (frequency.status === "unknown" || frequency.status === "conflict") throw new Error("frequency");
  first.value = "2028-11-30";
  maturity.value = "2028-12-31";
  frequency.value = "monthly";
  const installed = installStubs();
  let equal = false;
  try {
    equal = sameTwice(() => [exercise(case1, nyse), exercise(case8, nyse), exercise(case13, narrow)]);
  } finally {
    installed.restore();
  }
  expect(equal).toBe(true);
  for (const [key, count] of installed.counts) expect(count, key).toBe(0);
});
