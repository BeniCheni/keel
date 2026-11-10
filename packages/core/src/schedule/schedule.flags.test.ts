import { expect, test } from "vitest";
import { nyseRulesCalendar, termDateFlags } from "../index.ts";
import { loadTerms } from "../terms/load.ts";
import { textOf, textsIn } from "../terms/fixtures.ts";
import { scheduleDateFlags } from "./flags.ts";

const FLAGS: Record<string, string[]> = {
  "2026-11-26": ["exchange-holiday"],
  "2026-07-03": ["exchange-holiday"],
  "2026-07-04": ["weekend"],
  "2027-12-31": [],
  "2028-01-01": ["weekend"],
  "2025-12-25": ["outside-calendar"],
  "2025-12-27": ["weekend", "outside-calendar"],
  "2060-12-31": [],
  "2027-02-30": ["invalid-date"],
  "2061-01-03": ["outside-calendar"],
};

test("scheduleDateFlags matches the frozen table", () => {
  const calendar = nyseRulesCalendar();
  for (const [date, flags] of Object.entries(FLAGS)) {
    expect(scheduleDateFlags(date, calendar), date).toEqual(flags);
  }
  expect(scheduleDateFlags("2028-02-29", calendar)).toEqual([]);
});

test("termDateFlags on example-autocall matches the frozen object", () => {
  const loaded = loadTerms(textOf("valid", "example-autocall.yaml"), "example-autocall.yaml");
  expect(loaded.ok).toBe(true);
  if (!loaded.ok) return;
  expect(termDateFlags(loaded.terms, nyseRulesCalendar())).toEqual({
    "dates.trade": ["weekend"],
    "dates.settlement": [],
    "dates.maturity.candidates[0]": [],
    "dates.maturity.candidates[1]": ["weekend"],
    "dates.first_call_observation": ["weekend"],
  });
});

test("termDateFlags uses the loader's date key set for every valid fixture", () => {
  const calendar = nyseRulesCalendar();
  const names = [...textsIn("valid").keys()];
  expect(names.length).toBeGreaterThanOrEqual(2);
  for (const name of names) {
    const loaded = loadTerms(textOf("valid", name), name);
    expect(loaded.ok, name).toBe(true);
    if (!loaded.ok) continue;
    expect(Object.keys(termDateFlags(loaded.terms, calendar)).sort(), name).toEqual(Object.keys(loaded.dateFlags).sort());
  }
});

test("termDateFlags keys a listed conflict through its candidates", () => {
  const text = textOf("valid", "minimal.yaml").replace(
    "underlyings:\n",
    `  observation_schedule:
    - value: 2026-09-01
      status: primary
      source: supplement
    - value: 2026-12-01
      status: primary
      source: supplement
    - value: 2027-03-02
      status: user
    - status: conflict
      candidates:
        - value: 2027-06-01
          status: primary
          source: supplement
        - value: 2027-06-02
          status: primary
          source: supplement
underlyings:
`,
  );
  const loaded = loadTerms(text, "minimal.yaml");
  expect(loaded.ok).toBe(true);
  if (!loaded.ok) return;
  const keys = Object.keys(termDateFlags(loaded.terms, nyseRulesCalendar())).sort();
  expect(keys).toEqual(Object.keys(loaded.dateFlags).sort());
  expect(keys).toEqual(
    expect.arrayContaining([
      "dates.observation_schedule[0]",
      "dates.observation_schedule[1]",
      "dates.observation_schedule[2]",
      "dates.observation_schedule[3].candidates[0]",
      "dates.observation_schedule[3].candidates[1]",
    ]),
  );
  expect(keys).not.toContain("dates.observation_schedule[3]");
});

test("termDateFlags gives an unknown date no key, as the loader does", () => {
  const text = textOf("valid", "minimal.yaml")
    .replace(
      "  settlement:\n    value: 2026-03-04\n    status: primary\n    source: supplement\n",
      "  settlement:\n    value: null\n    status: unknown\n",
    )
    .replace(
      "underlyings:\n",
      `  observation_schedule:
    - value: 2026-09-01
      status: primary
      source: supplement
    - value: null
      status: unknown
underlyings:
`,
    );
  const loaded = loadTerms(text, "minimal.yaml");
  expect(loaded.ok).toBe(true);
  if (!loaded.ok) return;
  const keys = Object.keys(termDateFlags(loaded.terms, nyseRulesCalendar())).sort();
  expect(keys).toEqual(Object.keys(loaded.dateFlags).sort());
  expect(keys).toEqual([
    "dates.first_call_observation",
    "dates.maturity",
    "dates.observation_schedule[0]",
    "dates.trade",
  ]);
});
