import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "vitest";
import { inspectTools } from "../spawn-graph.mjs";
import { vitestArgs } from "../../test-tooling.mjs";
import { NESTED_RUN_TIMEOUT_MS, repoRoot, repoTempPath, run, spawnCollect } from "./helpers.mjs";

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
  expect(core.devDependencies.vitest).toBe(root.devDependencies.vitest);
  expect(core.dependencies ?? {}).toEqual({});
  expect(Object.keys(root.devDependencies).sort()).toEqual(["typescript", "vitest"]);
});

test("strict, noUncheckedIndexedAccess, and exactOptionalPropertyTypes are in force", () => {
  expect(tsc("export const value = 1;\n").status).toBe(0);
  expect(tsc("export function first(values: string[]): string {\n  return values[0];\n}\n").status).not.toBe(0);
  expect(tsc("type Box = { label?: string };\nexport const box: Box = { label: undefined };\n").status).not.toBe(0);
  expect(tsc("export function shout(value: string | null): string {\n  return value.toUpperCase();\n}\n").status).not.toBe(0);
}, NESTED_RUN_TIMEOUT_MS);

test("a filter that matches no file fails", () => {
  const result = run("pnpm", ["--filter", "@keel/core", "test", "zz-no-such-test-file"]);
  expect(result.status).not.toBe(0);
}, NESTED_RUN_TIMEOUT_MS);

test("test:tooling drops a leading -- so the filter reaches vitest", () => {
  const scripts = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")).scripts;
  expect(scripts["test:tooling"]).toBe("node tools/test-tooling.mjs");
  expect(vitestArgs(["--", "tripwire"])).toEqual(["run", "--config", "tools/vitest.config.mjs", "tripwire"]);
  expect(vitestArgs(["tripwire"])).toEqual(["run", "--config", "tools/vitest.config.mjs", "tripwire"]);
  expect(vitestArgs([])).toEqual(["run", "--config", "tools/vitest.config.mjs"]);
  const narrowed = run(process.execPath, ["tools/test-tooling.mjs", "--", "copy-boundary"]);
  expect(narrowed.status).toBe(0);
  expect(visible(`${narrowed.stdout}\n${narrowed.stderr}`)).toMatch(/Test Files\s+1 passed \(1\)/);
  const none = run(process.execPath, ["tools/test-tooling.mjs", "--", "zz-no-such-tooling-test"]);
  expect(none.status).not.toBe(0);
  expect(visible(`${none.stdout}\n${none.stderr}`)).toContain("No test files found");
}, NESTED_RUN_TIMEOUT_MS);

function visible(text) {
  return text.replace(/\u001b\[[0-9;]*m/g, "");
}

function honestySource(passes) {
  return [
    'import { expect, test } from "vitest";',
    'test("marker", () => {',
    passes ? "  expect(1).toBe(1);" : "  expect(1).toBe(2);",
    "});",
    "",
  ].join("\n");
}

function readReport(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

test("a temporary honesty test is discovered from the json report, and a failing one turns the run red", () => {
  const reportDir = mkdtempSync(join(tmpdir(), "keel-honesty-"));
  const srcDir = join(repoRoot, "packages/core/src");
  const passing = repoTempPath(srcDir, ".honesty.test.ts");
  const failing = repoTempPath(srcDir, ".honesty.test.ts");
  const passReport = join(reportDir, "pass.json");
  const failReport = join(reportDir, "fail.json");
  try {
    writeFileSync(passing, honestySource(true));
    const ok = run("pnpm", [
      "--filter",
      "@keel/core",
      "test",
      basename(passing, ".test.ts"),
      "--reporter=json",
      `--outputFile=${passReport}`,
    ]);
    const passed = readReport(passReport);
    expect(ok.status).toBe(0);
    expect(passed.testResults.map((item) => item.name)).toEqual([passing]);
    expect(passed.numPassedTests).toBe(1);
    expect(passed.numFailedTests).toBe(0);
    rmSync(passing, { force: true });
    writeFileSync(failing, honestySource(false));
    const bad = run("pnpm", [
      "--filter",
      "@keel/core",
      "test",
      basename(failing, ".test.ts"),
      "--reporter=json",
      `--outputFile=${failReport}`,
    ]);
    const failed = readReport(failReport);
    expect(bad.status).not.toBe(0);
    expect(failed.testResults.map((item) => item.name)).toEqual([failing]);
    expect(failed.numFailedTests).toBe(1);
    expect(failed.numPassedTests).toBe(0);
  } finally {
    rmSync(passing, { force: true });
    rmSync(failing, { force: true });
    rmSync(reportDir, { recursive: true, force: true });
  }
}, NESTED_RUN_TIMEOUT_MS);

function putFile(root, rel, lines) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${lines.join("\n")}\n`);
}

function spawnFixture() {
  const root = mkdtempSync(join(tmpdir(), "keel-spawn-"));
  putFile(root, "tools/acceptance/test/helpers.mjs", [
    'import { spawnSync } from "node:child_process";',
    "export const NESTED_RUN_TIMEOUT_MS = 60000;",
    "export function run() {",
    '  spawnSync("true", []);',
    "}",
    "export function write() {",
    "  return 1;",
    "}",
  ]);
  putFile(root, "tools/leaf.mjs", [
    'import { spawnSync } from "node:child_process";',
    "export function leaf() {",
    '  spawnSync("true", []);',
    "}",
  ]);
  putFile(root, "tools/wrap-leaf.mjs", [
    'import { leaf } from "./leaf.mjs";',
    "export function wrapped() {",
    "  leaf();",
    "}",
  ]);
  putFile(root, "tools/reexport-leaf.mjs", ['export { leaf } from "./leaf.mjs";']);
  putFile(root, "tools/wrap-helper.mjs", [
    'import { run } from "./acceptance/test/helpers.mjs";',
    "export function viaRun() {",
    "  run();",
    "}",
  ]);
  putFile(root, "tools/reexport-helper.mjs", ['export { run } from "./acceptance/test/helpers.mjs";']);
  putFile(root, "tools/wrap-helper-2.mjs", [
    'import { viaRun } from "./wrap-helper.mjs";',
    "export function viaVia() {",
    "  viaRun();",
    "}",
  ]);
  putFile(root, "tools/wrap-write.mjs", [
    'import { write } from "./acceptance/test/helpers.mjs";',
    "export function viaWrite() {",
    "  write();",
    "}",
  ]);
  putFile(root, "tools/acceptance/test/spawn-fixtures.test.mjs", [
    'import { test } from "vitest";',
    'import { NESTED_RUN_TIMEOUT_MS } from "./helpers.mjs";',
    'import { leaf } from "../../leaf.mjs";',
    'import { wrapped } from "../../wrap-leaf.mjs";',
    'import { leaf as reexported } from "../../reexport-leaf.mjs";',
    'import { viaRun } from "../../wrap-helper.mjs";',
    'import { run } from "../../reexport-helper.mjs";',
    'import { viaVia } from "../../wrap-helper-2.mjs";',
    'import { viaWrite } from "../../wrap-write.mjs";',
    "function throughLeaf() {",
    "  leaf();",
    "}",
    'test("leaf", () => {',
    "  leaf();",
    "});",
    'test("wrap", () => {',
    "  wrapped();",
    "});",
    'test("reexport", () => {',
    "  reexported();",
    "});",
    'test("helper", () => {',
    "  viaRun();",
    "});",
    'test("reexport helper", () => {',
    "  run();",
    "});",
    'test("second", () => {',
    "  viaVia();",
    "});",
    'test("through", () => {',
    "  throughLeaf();",
    "});",
    'test("write", () => {',
    "  viaWrite();",
    "});",
    'test("leaf with timeout", () => {',
    "  leaf();",
    "}, NESTED_RUN_TIMEOUT_MS);",
  ]);
  putFile(root, "tools/acceptance/test/bad-import.test.mjs", [
    'import { spawnSync } from "node:child_process";',
    'import { test } from "vitest";',
    'test("bad", () => {',
    '  spawnSync("true", []);',
    "});",
  ]);
  return root;
}

function symbols(report, file) {
  return report.entryPoints.filter((entry) => entry.file === file).map((entry) => entry.symbol).sort();
}

test("the spawn graph follows wrappers and re-exports and leaves a write-only wrapper out", () => {
  const root = spawnFixture();
  try {
    const report = inspectTools(root);
    expect(symbols(report, "tools/leaf.mjs")).toEqual(["leaf"]);
    expect(symbols(report, "tools/wrap-leaf.mjs")).toEqual(["wrapped"]);
    expect(symbols(report, "tools/reexport-leaf.mjs")).toEqual(["leaf"]);
    expect(symbols(report, "tools/wrap-helper.mjs")).toEqual(["viaRun"]);
    expect(symbols(report, "tools/reexport-helper.mjs")).toEqual(["run"]);
    expect(symbols(report, "tools/wrap-helper-2.mjs")).toEqual(["viaVia"]);
    expect(symbols(report, "tools/wrap-write.mjs")).toEqual([]);
    expect(symbols(report, "tools/acceptance/test/helpers.mjs")).toEqual(["run"]);
    expect(report.missingTimeouts.map((item) => item.name).sort()).toEqual([
      "helper",
      "leaf",
      "reexport",
      "reexport helper",
      "second",
      "through",
      "wrap",
    ]);
    expect(report.forbiddenChildProcessImports).toEqual(["tools/acceptance/test/bad-import.test.mjs"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("spawned tooling tests declare NESTED_RUN_TIMEOUT_MS of at least 60000", () => {
  const live = inspectTools(repoRoot);
  expect(live.forbiddenChildProcessImports).toEqual([]);
  expect(live.missingTimeouts).toEqual([]);
  expect(live.nestedTimeoutMs).toBe(NESTED_RUN_TIMEOUT_MS);
  expect(live.nestedTimeoutMs).toBeGreaterThanOrEqual(60000);
  expect(symbols(live, "tools/acceptance/test/helpers.mjs")).toEqual([
    "cleanRepo",
    "commitAll",
    "git",
    "pointOrigin",
    "run",
    "spawnCollect",
    "tempGit",
    "tripwire",
  ]);
  expect(symbols(live, "tools/tripwire/scan.mjs")).toEqual([
    "ALLOWLIST_REL",
    "VENDORS_REL",
    "cusipCheckDigit",
    "isLocalOnly",
    "scanRepo",
  ]);
  expect(symbols(live, "tools/fixtures/check.mjs")).toEqual([
    "check",
    "productionTrees",
    "splitTrees",
    "treesOf",
    "verifyDeterminism",
    "verifyRegistered",
  ]);
  expect(symbols(live, "tools/network/run.mjs")).toEqual(["blockedByGuard", "probeNames", "runProbe", "runProbes"]);
  expect(symbols(live, "tools/test-tooling.mjs")).toEqual(["vitestArgs"]);
  expect(symbols(live, "tools/verify/steps.mjs")).toEqual(["repoRoot", "steps"]);
});

test("tooling tests do not embed fixed repo temp names", () => {
  const hits = [];
  const pattern = /["'`][^"'`\n]*?(zz-[A-Za-z0-9_-]+\.test\.mjs|[A-Za-z0-9_-]+\.honesty\.test\.ts)["'`]/g;
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.name.endsWith(".test.mjs")) {
        const source = readFileSync(path, "utf8");
        for (const match of source.matchAll(pattern)) hits.push(`${entry.name} ${match[1]}`);
      }
    }
  };
  visit(join(repoRoot, "tools"));
  expect(hits).toEqual([]);
});

test("overlapping processes use different repo temp names and leave the tree unchanged", async () => {
  const barrier = mkdtempSync(join(tmpdir(), "keel-overlap-"));
  const script = join(barrier, "write-temp.mjs");
  const repoDir = join(repoRoot, "tools/acceptance/test");
  const helperUrl = pathToFileURL(join(repoRoot, "tools/acceptance/test/helpers.mjs")).href;
  const before = run("git", ["status", "--porcelain", "--untracked-files=all", "--", "packages", "tools"]);
  writeFileSync(
    script,
    [
      'import { readdirSync, rmSync, writeFileSync } from "node:fs";',
      'import { setTimeout } from "node:timers/promises";',
      'import { join } from "node:path";',
      `import { repoTempPath } from ${JSON.stringify(helperUrl)};`,
      "const barrier = process.argv[2];",
      "const repoDir = process.argv[3];",
      "const suffix = process.argv[4];",
      "const deadline = Date.now() + 30000;",
      "async function waitFor(prefix, count) {",
      "  while (readdirSync(barrier).filter((name) => name.startsWith(prefix)).length < count) {",
      "    if (Date.now() > deadline) process.exit(3);",
      "    await setTimeout(15);",
      "  }",
      "}",
      'writeFileSync(join(barrier, "ready-" + process.pid), "ready");',
      'await waitFor("ready-", 2);',
      "const path = repoTempPath(repoDir, suffix);",
      'writeFileSync(path, "overlap\\n", { flag: "wx" });',
      'writeFileSync(join(barrier, "path-" + process.pid), path);',
      'await waitFor("path-", 2);',
      "rmSync(path, { force: true });",
      'process.stdout.write(path + "\\n");',
      "",
    ].join("\n"),
  );
  try {
    expect(before.status).toBe(0);
    const args = [script, barrier, repoDir, ".test.mjs"];
    const results = await Promise.all([
      spawnCollect(process.execPath, args),
      spawnCollect(process.execPath, args),
    ]);
    expect(results.map((result) => result.status), results.map((result) => result.stderr).join("\n")).toEqual([0, 0]);
    const paths = results.map((result) => result.stdout.trim());
    expect(paths[0]).not.toBe(paths[1]);
    const pids = paths.map((path) => basename(path).split("-")[1]);
    expect(pids[0]).not.toBe(pids[1]);
    const after = run("git", ["status", "--porcelain", "--untracked-files=all", "--", "packages", "tools"]);
    expect(after.status).toBe(0);
    expect(after.stdout).toBe(before.stdout);
    for (const path of paths) expect(after.stdout).not.toContain(basename(path));
  } finally {
    try {
      for (const name of readdirSync(barrier)) {
        if (!name.startsWith("path-")) continue;
        rmSync(readFileSync(join(barrier, name), "utf8").trim(), { force: true });
      }
    } catch {
      // The barrier is removed below either way.
    }
    rmSync(barrier, { recursive: true, force: true });
  }
}, NESTED_RUN_TIMEOUT_MS);
