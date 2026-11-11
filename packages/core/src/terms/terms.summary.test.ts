import { expect, test } from "vitest";
import { dateFlags } from "./dates.ts";
import { loadTerms } from "./load.ts";
import { verificationSummary } from "./summary.ts";
import { textOf } from "./fixtures.ts";

test("summaries match the frozen payoff counts", () => {
  const example = loadTerms(textOf("valid", "example-autocall.yaml"), "example-autocall.yaml");
  const minimal = loadTerms(textOf("valid", "minimal.yaml"), "minimal.yaml");
  expect(example.ok).toBe(true);
  expect(minimal.ok).toBe(true);
  if (!example.ok || !minimal.ok) return;

  expect(verificationSummary(example.terms)).toEqual({
    verified: 8,
    total: 17,
    unverified: [
      "dates.maturity",
      "dates.observation_schedule",
      "underlyings.members[2].initial",
      "underlyings.members[3].initial",
      "underlyings.performance_rounding",
      "call.level",
      "premium.rate_per_year",
      "premium.accrual",
      "barrier.level",
    ],
  });
  expect(verificationSummary(minimal.terms)).toEqual({
    verified: 15,
    total: 17,
    unverified: ["dates.final_valuation", "dates.observation_schedule"],
  });
  expect(example.terms.dates.final_valuation).toEqual({
    value: "2031-07-09",
    status: "primary",
    source: "supplement",
  });

  const issuer = example.terms.issuer;
  expect(issuer.status).toBe("primary");
  if (issuer.status === "primary") expect(issuer.value).toBe("Example Bank SA");
  expect(example.terms.underlyings.members.map((member) => member.ticker)).toEqual(["ALFA", "BRVO", "CHRL", "DLTA"]);
  expect(example.terms.underlyings.members.map((member) => member.initial.status)).toEqual([
    "primary",
    "primary",
    "document",
    "advisor",
  ]);
  expect(example.terms.dates.observation_schedule).toBeUndefined();
  expect(example.terms.dates.trade.status).toBe("primary");
  if (example.terms.dates.trade.status === "primary") {
    expect(dateFlags(example.terms.dates.trade.value)).toEqual(["weekend"]);
  }
  expect(example.terms.dates.maturity.status).toBe("conflict");
  if (example.terms.dates.maturity.status === "conflict") {
    expect(example.terms.dates.maturity.candidates.map((candidate) => candidate.status)).toEqual(["document", "advisor"]);
  }
  expect(example.terms.dates.first_call_observation.status).toBe("primary");
  expect(example.terms.underlyings.performance_rounding).toEqual({ status: "unknown", value: null });
  expect(example.terms.call.level.status).toBe("advisor");
  expect(example.terms.call.non_call_months.status).toBe("primary");
  expect(example.terms.call.frequency.status).toBe("primary");
  expect(example.terms.premium.rate_per_year.status).toBe("user");
  expect(example.terms.premium.accrual.status).toBe("assumed");
  expect(example.terms.barrier.level.status).toBe("estimate");
  expect(example.terms.barrier.observation.status).toBe("primary");
  expect(example.terms.barrier.below_barrier.status).toBe("primary");
});

test("final valuation is listed immediately after the first call observation", () => {
  const minimal = loadTerms(textOf("valid", "minimal.yaml"), "minimal.yaml");
  expect(minimal.ok).toBe(true);
  if (!minimal.ok) return;
  const terms = structuredClone(minimal.terms);
  const maturity = terms.dates.maturity;
  const first = terms.dates.first_call_observation;
  if (maturity.status !== "primary") throw new Error("maturity");
  if (first.status !== "primary") throw new Error("first call");
  terms.dates.maturity = { value: maturity.value, status: "document", source: maturity.source };
  terms.dates.first_call_observation = { value: first.value, status: "document", source: first.source };
  expect(verificationSummary(terms).unverified.slice(0, 4)).toEqual([
    "dates.maturity",
    "dates.first_call_observation",
    "dates.final_valuation",
    "dates.observation_schedule",
  ]);
});
