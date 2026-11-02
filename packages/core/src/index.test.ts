import { expect, test } from "vitest";
import * as api from "./index.ts";

test("public API lists the terms functions", () => {
  expect(Object.keys(api)).toEqual(["dateFlags", "loadTerms", "verificationSummary"]);
});
