import { expect, test } from "vitest";
import { NESTED_RUN_TIMEOUT_MS, repoRoot, run } from "./helpers.mjs";

/**
 * The core entry is consumed by later slices from plain Node, not only through Vite.
 * Node resolves a package-relative specifier only to a file that exists, so `ajv/dist/2020`
 * fails there while `ajv/dist/2020.js` loads. This keeps the entry importable both ways.
 */
test(
  "the core entry loads under Node alone, without a bundler",
  () => {
    const script = 'import("./packages/core/src/index.ts").then((api) => console.log(Object.keys(api).join(" ")))';
    const result = run(process.execPath, ["--input-type=module", "-e", script], { cwd: repoRoot });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout.trim()).toBe("dateFlags loadTerms verificationSummary");
  },
  NESTED_RUN_TIMEOUT_MS,
);
