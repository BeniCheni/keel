import { expect, test } from "vitest";
import { placeRow } from "../../generators/golden/generate.mjs";
import { NESTED_RUN_TIMEOUT_MS } from "./helpers.mjs";

const DATE = "2026-09-01";
const ROUNDING = { mode: "half-up", places: 4 };

test("a rejected fixed close is refused", () => {
  expect(() =>
    placeRow([], "g-fixed", DATE, { worstTicker: "ALFA", fixedClose: "100000000" }, ROUNDING),
  ).toThrow("g-fixed: fixed close rejected");
}, NESTED_RUN_TIMEOUT_MS);

test("a worst member seeded below without its close is an error", () => {
  const row = { worstTicker: "BRVO", seedBelow: true };
  expect(() => placeRow([], "g-silent", DATE, row, ROUNDING)).toThrow("g-silent: worst member has no close");
  expect(() =>
    placeRow([], "g-fixed-row", DATE, { ...row, fixedClose: "76.470975" }, ROUNDING),
  ).not.toThrow();
  expect(() =>
    placeRow(
      [],
      "g-conflict",
      DATE,
      {
        ...row,
        conflict: { ticker: "BRVO", values: ["70.1", "71.2"], sources: ["synthetic-a", "synthetic-b"] },
      },
      ROUNDING,
    ),
  ).not.toThrow();
  expect(() => placeRow([], "g-missing", DATE, { ...row, missing: "BRVO" }, ROUNDING)).not.toThrow();
}, NESTED_RUN_TIMEOUT_MS);
