import { expect, test, vi } from "vitest";
import { parse, stringify } from "yaml";
import { textOf, termsManifest } from "./fixtures.ts";
import { loadTerms } from "./load.ts";
import { verificationSummary } from "./summary.ts";

test("same-position diagnostics use locale-independent path order", () => {
  const text = textOf("valid", "minimal.yaml")
    .replace(/call:\n[\s\S]*?(?=premium:)/, "")
    .replace(/barrier:\n[\s\S]*?(?=economics:)/, "")
    .replace(/economics:\n[\s\S]*?(?=sources:)/, "");
  const compare = vi.spyOn(String.prototype, "localeCompare").mockImplementation(function (this: string, other: string) {
    return this < other ? 1 : this > other ? -1 : 0;
  });
  try {
    const result = loadTerms(text, "minimal.yaml");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.map(({ path }) => path)).toEqual(["barrier", "call", "economics"]);
  } finally {
    compare.mockRestore();
  }
});

function scheduleText(entries: string): string {
  return textOf("valid", "minimal.yaml").replace("underlyings:\n", `  observation_schedule:\n${entries}underlyings:\n`);
}

const CONFLICT = `    - status: conflict
      candidates:
        - value: 2026-06-07
          status: primary
          source: supplement
        - value: 2026-06-06
          status: primary
          source: supplement
`;
const known = (date: string): string => `    - value: ${date}\n      status: primary\n      source: supplement\n`;

test("schedule conflicts retain candidate order and flags without ordering their values", () => {
  for (const entries of [CONFLICT, known("2026-06-08") + CONFLICT, CONFLICT + known("2026-06-05")]) {
    const result = loadTerms(scheduleText(entries), "minimal.yaml");
    expect(result.ok).toBe(true);
    if (!result.ok) continue;
    const index = entries.startsWith(known("2026-06-08")) ? 1 : 0;
    const term = result.terms.dates.observation_schedule?.[index];
    expect(term?.status).toBe("conflict");
    if (term?.status === "conflict") expect(term.candidates.map(({ value }) => value)).toEqual(["2026-06-07", "2026-06-06"]);
    for (const candidate of [0, 1]) {
      expect(result.dateFlags[`dates.observation_schedule[${index}].candidates[${candidate}]`]).toEqual(["weekend"]);
    }
    expect(verificationSummary(result.terms)).toEqual({ verified: 15, total: 16, unverified: ["dates.observation_schedule"] });
  }
});

test("known schedule values remain strictly increasing across conflicts and unknowns", () => {
  const unknown = "    - value: null\n      status: unknown\n";
  for (const last of ["2026-06-08", "2026-06-09"]) {
    const result = loadTerms(scheduleText(known("2026-06-09") + CONFLICT + unknown + known(last)), "minimal.yaml");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual([expect.objectContaining({ code: "schedule-order", path: "dates.observation_schedule[3].value" })]);
    }
  }
  expect(loadTerms(scheduleText(known("2026-06-08") + CONFLICT + unknown + known("2026-06-09")), "minimal.yaml").ok).toBe(true);
});

test("the generated duplicate-ticker and negative-zero cases have positioned manifest entries", () => {
  const fixtures: Array<[string, string, string]> = [
    ["duplicate-ticker.yaml", "duplicate-ticker", "underlyings.members[1].ticker"],
    ["wrong-type-negative-zero.yaml", "wrong-type", "call.non_call_months.value"],
  ];
  const minimal = textOf("valid", "minimal.yaml");
  expect(textOf("invalid", "duplicate-ticker.yaml")).toBe(minimal.replace("ticker: BRVO", "ticker: ALFA"));
  expect(textOf("invalid", "wrong-type-negative-zero.yaml")).toBe(minimal.replace("value: 6\n", "value: -0\n"));
  for (const [file, code, path] of fixtures) {
    const row = termsManifest.invalid.find((item) => item.file === file);
    expect(row).toEqual(expect.objectContaining({ code, path }));
    const result = loadTerms(textOf("invalid", file), file);
    expect(result.ok).toBe(false);
    if (!result.ok && row) expect(result.errors).toEqual([expect.objectContaining({ code, path, line: row.line, column: row.column })]);
  }
});

type RecordValue = Record<string, unknown>;
function fullDocument(): RecordValue {
  const doc = parse(textOf("valid", "minimal.yaml")) as RecordValue;
  const example = parse(textOf("valid", "example-autocall.yaml")) as RecordValue;
  doc.identifiers = example.identifiers;
  const economics = doc.economics as RecordValue;
  economics.estimated_value = { value: 20, status: "user" };
  economics.fees = { value: 3, status: "user" };
  (doc.dates as RecordValue).observation_schedule = [{ value: "2027-01-04", status: "primary", source: "supplement" }];
  return doc;
}

function termSites(doc: RecordValue): Array<{ path: string; owner: RecordValue; key: string }> {
  const sites: Array<{ path: string; owner: RecordValue; key: string }> = [];
  const walk = (value: RecordValue, prefix: string): void => {
    for (const [key, child] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (child && typeof child === "object" && "status" in child) sites.push({ path, owner: value, key });
      else if (Array.isArray(child)) {
        child.forEach((item: RecordValue, index) => {
          if ("status" in item) sites.push({ path: `${path}[${index}]`, owner: child as unknown as RecordValue, key: String(index) });
          else walk(item, `${path}[${index}]`);
        });
      } else if (child && typeof child === "object") walk(child as RecordValue, path);
    }
  };
  walk(doc, "");
  return sites;
}

test("a null conflict candidate has exactly one status-fields diagnostic on every term field", () => {
  const doc = fullDocument();
  const sites = termSites(doc);
  expect(sites).toHaveLength(24);
  for (const site of sites) {
    const original = site.owner[site.key] as RecordValue;
    site.owner[site.key] = { status: "conflict", candidates: [{ ...original, value: null }, original] };
    try {
      const result = loadTerms(stringify(doc), "minimal.yaml");
      expect(result.ok, site.path).toBe(false);
      if (!result.ok) expect(result.errors, site.path).toEqual([expect.objectContaining({ code: "status-fields", path: `${site.path}.candidates[0].value` })]);
    } finally {
      site.owner[site.key] = original;
    }
  }
});

test("an unresolved alias used as a key still produces a fallback diagnostic", () => {
  const result = loadTerms(`${textOf("valid", "minimal.yaml")}*nope : 1\n`, "minimal.yaml");
  expect(result).toEqual({ ok: false, errors: [expect.objectContaining({ code: "alias", path: "", line: 1, column: 1 })] });
});

test("negative zero is wrong-type on each integer term and its candidates; minus one retains its range error", () => {
  const doc = fullDocument();
  const sites = termSites(doc).filter(({ owner, key }) => typeof (owner[key] as RecordValue).value === "number");
  expect(sites).toHaveLength(7);
  for (const site of sites) {
    const original = site.owner[site.key] as RecordValue;
    for (const candidate of [false, true]) {
      site.owner[site.key] = candidate
        ? { status: "conflict", candidates: [{ value: "NEGATIVE_ZERO", status: "user" }, original] }
        : { value: "NEGATIVE_ZERO", status: "user" };
      const path = `${site.path}${candidate ? ".candidates[0]" : ""}.value`;
      try {
        const tokens: Array<[string, string]> = [["-0", "wrong-type"], ["-1", "out-of-range"]];
        for (const [token, code] of tokens) {
          const result = loadTerms(stringify(doc).replace("NEGATIVE_ZERO", token), "minimal.yaml");
          expect(result.ok, path).toBe(false);
          if (!result.ok) expect(result.errors, path).toEqual([expect.objectContaining({ code, path })]);
        }
      } finally {
        site.owner[site.key] = original;
      }
    }
  }
});
