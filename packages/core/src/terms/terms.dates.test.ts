import { expect, test } from "vitest";
import { dateFlags, dayOfWeek } from "./dates.ts";
import { loadTerms } from "./load.ts";
import { textOf } from "./fixtures.ts";

const DATES = [
  "2028-02-24",
  "2028-02-25",
  "2028-02-26",
  "2028-02-27",
  "2028-02-28",
  "2028-02-29",
  "2028-03-01",
  "2028-03-02",
  "2028-03-03",
  "2028-03-04",
  "2028-03-05",
  "2028-03-06",
  "2028-03-07",
  "2028-03-08",
];

const WEEKENDS = new Set(["2028-02-26", "2028-02-27", "2028-03-04", "2028-03-05"]);

test("weekends are Saturday and Sunday across a leap-day fortnight", () => {
  expect(DATES).toHaveLength(14);
  for (const iso of DATES) {
    expect(dateFlags(iso), iso).toEqual(WEEKENDS.has(iso) ? ["weekend"] : []);
  }
  expect(dateFlags("2028-02-25")).toEqual([]);
  expect(dateFlags("2028-03-03")).toEqual([]);
  expect(dateFlags("2028-02-29")).toEqual([]);
  expect(dateFlags("2027-02-30")).toEqual([]);
});

test("the loader rejects 2027-02-30 and accepts the leap day", () => {
  const minimal = textOf("valid", "minimal.yaml");
  const invalid = loadTerms(
    minimal.replace("  maturity:\n    value: 2031-03-03\n", "  maturity:\n    value: 2027-02-30\n"),
    "minimal.yaml",
  );
  expect(invalid.ok).toBe(false);
  if (!invalid.ok) {
    expect(invalid.errors).toEqual([
      expect.objectContaining({ code: "invalid-date", path: "dates.maturity.value" }),
    ]);
  }
  const leap = loadTerms(
    minimal.replace("  maturity:\n    value: 2031-03-03\n", "  maturity:\n    value: 2028-02-29\n"),
    "minimal.yaml",
  );
  expect(leap.ok).toBe(true);

  // A date that fails the schema pattern is invalid-date too, from the schema rather than the calendar.
  const unpadded = loadTerms(
    minimal.replace("  maturity:\n    value: 2031-03-03\n", "  maturity:\n    value: 2031-3-3\n"),
    "minimal.yaml",
  );
  expect(unpadded.ok).toBe(false);
  if (!unpadded.ok) {
    expect(unpadded.errors).toEqual([
      expect.objectContaining({ code: "invalid-date", path: "dates.maturity.value", line: 19, column: 12 }),
    ]);
  }
});

test("the century rule of the Gregorian calendar holds", () => {
  const minimal = textOf("valid", "minimal.yaml");
  const century = loadTerms(
    minimal.replace("  maturity:\n    value: 2031-03-03\n", "  maturity:\n    value: 2100-02-29\n"),
    "minimal.yaml",
  );
  expect(century.ok).toBe(false);
  if (!century.ok) {
    expect(century.errors).toEqual([expect.objectContaining({ code: "invalid-date", path: "dates.maturity.value" })]);
  }
  const quadricentennial = loadTerms(
    minimal.replace("  maturity:\n    value: 2031-03-03\n", "  maturity:\n    value: 2400-02-29\n"),
    "minimal.yaml",
  );
  expect(quadricentennial.ok).toBe(true);
  expect(dateFlags("2100-02-29")).toEqual([]);
  // 2000-02-29 was a Tuesday and the calendar repeats every 400 years.
  expect(dateFlags("2400-02-29")).toEqual([]);
  expect(dateFlags("2000-02-29")).toEqual([]);
});

const EXAMPLE_DATE_FLAGS = {
  "dates.trade": ["weekend"],
  "dates.settlement": [],
  "dates.maturity.candidates[0]": [],
  "dates.maturity.candidates[1]": ["weekend"],
  "dates.first_call_observation": ["weekend"],
  "dates.final_valuation": [],
};

function withFinalValuation(body: string, schedule = ""): string {
  return textOf("valid", "minimal.yaml")
    .replace("schema: mln-terms/0.1\n", "schema: mln-terms/0.2\n")
    .replace("underlyings:\n", `  final_valuation:\n${body}${schedule}underlyings:\n`);
}

test("dateFlags on example-autocall matches the frozen object", () => {
  const loaded = loadTerms(textOf("valid", "example-autocall.yaml"), "example-autocall.yaml");
  expect(loaded.ok).toBe(true);
  if (!loaded.ok) return;
  expect(loaded.dateFlags).toEqual(EXAMPLE_DATE_FLAGS);
  const finalValuation = loaded.terms.dates.final_valuation;
  expect(finalValuation).toEqual({ value: "2031-07-09", status: "primary", source: "supplement" });
  expect(dayOfWeek(2031, 7, 9)).toBe(3);
  const keys = Object.keys(loaded.dateFlags);
  expect(keys.indexOf("dates.final_valuation")).toBe(keys.indexOf("dates.first_call_observation") + 1);
});

test("a Saturday final valuation flags weekend, and a conflict flags each candidate", () => {
  const saturday = loadTerms(
    withFinalValuation(
      "    value: 2026-03-21\n    status: primary\n    source: supplement\n",
      "  observation_schedule:\n    - value: 2026-09-01\n      status: primary\n      source: supplement\n",
    ),
    "minimal.yaml",
  );
  expect(saturday.ok).toBe(true);
  if (saturday.ok) {
    expect(saturday.dateFlags["dates.final_valuation"]).toEqual(["weekend"]);
    const keys = Object.keys(saturday.dateFlags);
    expect(keys.indexOf("dates.final_valuation")).toBe(keys.indexOf("dates.first_call_observation") + 1);
    expect(keys.indexOf("dates.observation_schedule[0]")).toBe(keys.indexOf("dates.final_valuation") + 1);
  }

  const conflict = loadTerms(
    withFinalValuation(
      "    status: conflict\n    candidates:\n      - value: 2026-03-21\n        status: primary\n        source: supplement\n      - value: 2026-03-23\n        status: primary\n        source: supplement\n",
    ),
    "minimal.yaml",
  );
  expect(conflict.ok).toBe(true);
  if (conflict.ok) {
    expect(conflict.dateFlags["dates.final_valuation"]).toBeUndefined();
    expect(conflict.dateFlags["dates.final_valuation.candidates[0]"]).toEqual(["weekend"]);
    expect(conflict.dateFlags["dates.final_valuation.candidates[1]"]).toEqual([]);
  }

  const unknown = loadTerms(withFinalValuation("    value: null\n    status: unknown\n"), "minimal.yaml");
  expect(unknown.ok).toBe(true);
  if (unknown.ok) expect(unknown.dateFlags["dates.final_valuation"]).toBeUndefined();
});

test("an unpadded final valuation is invalid-date", () => {
  const loaded = loadTerms(
    withFinalValuation("    value: 2031-7-9\n    status: primary\n    source: supplement\n"),
    "minimal.yaml",
  );
  expect(loaded.ok).toBe(false);
  if (!loaded.ok) {
    expect(loaded.errors).toEqual([
      expect.objectContaining({ code: "invalid-date", path: "dates.final_valuation.value" }),
    ]);
  }
});
