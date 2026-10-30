import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { repoRoot, run } from "./helpers.mjs";

function tsc(source) {
  const dir = mkdtempSync(join(tmpdir(), "keel-tsc-"));
  writeFileSync(join(dir, "probe.ts"), source);
  writeFileSync(
    join(dir, "tsconfig.json"),
    JSON.stringify({
      extends: join(repoRoot, "packages/core/tsconfig.json"),
      compilerOptions: { rootDir: ".", noEmit: true },
      include: ["probe.ts"],
    }),
  );
  const result = run("pnpm", ["exec", "tsc", "-p", join(dir, "tsconfig.json"), "--noEmit"]);
  rmSync(dir, { recursive: true, force: true });
  return result;
}

test("the core package is @keel/core with no runtime dependencies and a Node 24 floor", () => {
  const root = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
  const core = JSON.parse(readFileSync(join(repoRoot, "packages/core/package.json"), "utf8"));
  expect(root.engines.node).toBe(">=24");
  expect(core.name).toBe("@keel/core");
  expect(core.dependencies ?? {}).toEqual({});
  expect(Object.keys(root.devDependencies).sort()).toEqual(["typescript", "vitest"]);
});

test("strict, noUncheckedIndexedAccess, and exactOptionalPropertyTypes are in force", () => {
  expect(tsc("export const value = 1;\n").status).toBe(0);
  expect(tsc("export function first(values: string[]): string {\n  return values[0];\n}\n").status).not.toBe(0);
  expect(tsc("type Box = { label?: string };\nexport const box: Box = { label: undefined };\n").status).not.toBe(0);
  expect(tsc("export function shout(value: string | null): string {\n  return value.toUpperCase();\n}\n").status).not.toBe(0);
});

test("a filter that matches no file fails", () => {
  const result = run("pnpm", ["--filter", "@keel/core", "test", "zz-no-such-test-file"]);
  expect(result.status).not.toBe(0);
});

function visible(text) {
  return text.replace(/\u001b\[[0-9;]*m/g, "");
}

test("a temporary honesty test is discovered, and a failing one turns the run red", () => {
  const passing = join(repoRoot, "packages/core/src/zz-acceptance.honesty.test.ts");
  const failing = join(repoRoot, "packages/core/src/zz-acceptance-fail.honesty.test.ts");
  const env = { ...process.env, FORCE_COLOR: "1" };
  writeFileSync(
    passing,
    'import { expect, test } from "vitest";\ntest("honesty marker passes", () => {\n  expect(1).toBe(1);\n});\n',
  );
  try {
    const ok = run("pnpm", ["--filter", "@keel/core", "test", "zz-acceptance.honesty"], { env });
    const text = visible(`${ok.stdout}\n${ok.stderr}`);
    expect(ok.status).toBe(0);
    expect(text).toContain("zz-acceptance.honesty");
    expect(text).toMatch(/Tests\s+1 passed/);
  } finally {
    rmSync(passing, { force: true });
  }
  writeFileSync(
    failing,
    'import { expect, test } from "vitest";\ntest("honesty marker fails", () => {\n  expect(1).toBe(2);\n});\n',
  );
  try {
    const bad = run("pnpm", ["--filter", "@keel/core", "test", "zz-acceptance-fail.honesty"], { env });
    const text = visible(`${bad.stdout}\n${bad.stderr}`);
    expect(bad.status).not.toBe(0);
    expect(text).not.toContain("No test files found");
  } finally {
    rmSync(failing, { force: true });
  }
});
