import { expect, test } from "vitest";
import { dateFlags } from "./dates.ts";
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
});
