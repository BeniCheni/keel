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
    "dates.final_valuation": [],
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

function withFinalValuation(body: string, schedule = ""): string {
  return textOf("valid", "minimal.yaml")
    .replace("schema: mln-terms/0.1\n", "schema: mln-terms/0.2\n")
    .replace("underlyings:\n", `  final_valuation:\n${body}${schedule}underlyings:\n`);
}

test("a Saturday final valuation flags weekend, and a conflict flags each candidate", () => {
  const calendar = nyseRulesCalendar();
  const saturday = loadTerms(
    withFinalValuation(
      "    value: 2026-03-21\n    status: primary\n    source: supplement\n",
      "  observation_schedule:\n    - value: 2026-09-01\n      status: primary\n      source: supplement\n",
    ),
    "minimal.yaml",
  );
  expect(saturday.ok).toBe(true);
  if (saturday.ok) {
    const flags = termDateFlags(saturday.terms, calendar);
    expect(flags["dates.final_valuation"]).toEqual(["weekend"]);
    const keys = Object.keys(flags);
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
    const flags = termDateFlags(conflict.terms, calendar);
    expect(flags["dates.final_valuation"]).toBeUndefined();
    expect(flags["dates.final_valuation.candidates[0]"]).toEqual(["weekend"]);
    expect(flags["dates.final_valuation.candidates[1]"]).toEqual([]);
  }

  const unknown = loadTerms(withFinalValuation("    value: null\n    status: unknown\n"), "minimal.yaml");
  expect(unknown.ok).toBe(true);
  if (unknown.ok) expect(termDateFlags(unknown.terms, calendar)["dates.final_valuation"]).toBeUndefined();
});
