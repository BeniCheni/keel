import { expect, test } from "vitest";
import * as api from "./index.ts";

test("public API is empty", () => {
  expect(Object.keys(api)).toEqual([]);
});
