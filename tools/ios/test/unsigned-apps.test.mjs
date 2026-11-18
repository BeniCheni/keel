import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { NESTED_RUN_TIMEOUT_MS, repoRoot, run } from "../../acceptance/test/helpers.mjs";
import { loadAllowlist, parseAllowlist } from "../allowlist.mjs";
import { unusedBinaryEntries } from "../allowlist-usage.mjs";

test("the swift job builds and binary-checks both unsigned configurations", ({ onTestFinished }) => {
  const workflow = readFileSync(join(repoRoot, ".github/workflows/verify.yml"), "utf8");
  const swift = workflow.split(/^  swift:$/m)[1].split(/^  verify:$/m)[0];
  const step = /^      - name: Unsigned app\n        run: \|\n((?: {10}.*\n)+)/m.exec(swift);
  expect(step).not.toBeNull();
  const dir = mkdtempSync(join(tmpdir(), "keel-ci-"));
  onTestFinished(() => rmSync(dir, { recursive: true, force: true }));
  const commands = [
    'xcodebuild() { printf "build %s\\n" "$*"; }',
    'cmp() { printf "cmp %s\\n" "$*"; }',
    'node() { printf "node %s\\n" "$*"; }',
    step[1],
  ].join("\n");
  const result = run("bash", ["-c", commands], { env: { ...process.env, TMPDIR: dir } });
  expect(result.status, result.stderr).toBe(0);
  const lines = result.stdout.trim().split("\n");
  for (const config of ["Release", "Verification"]) {
    expect(lines.filter((line) => line.startsWith("build ") && line.includes("-configuration " + config + " "))).toHaveLength(1);
    expect(lines.filter((line) => line.startsWith("cmp ") && line.includes("/" + config + "-iphoneos/Keel.app/core.js"))).toHaveLength(1);
    expect(lines.filter((line) => line.startsWith("node tools/ios/binary-check.mjs ") && line.endsWith("/" + config + "-iphoneos/Keel.app/Keel"))).toHaveLength(1);
  }
  expect(lines.at(-1)).toMatch(/^node tools\/ios\/allowlist-usage\.mjs .*\/Release-iphoneos\/Keel\.app\/Keel .*\/Verification-iphoneos\/Keel\.app\/Keel$/);
}, NESTED_RUN_TIMEOUT_MS);

test("the committed framework list has a use or a retention reason for each entry", () => {
  const surface = {
    frameworks: ["Combine", "CoreFoundation", "CryptoKit", "Foundation", "JavaScriptCore", "SwiftUI", "UIKit"],
    selectors: [], urlSymbols: [], undefinedSymbols: [],
  };
  const allowlist = loadAllowlist(repoRoot);
  // The workflow checks every kind against its actual builds. This regression
  // pins the stale framework approvals from the baseline.
  expect(unusedBinaryEntries(allowlist, [surface]).filter((entry) => entry.startsWith("framework\t"))).toEqual([]);
}, NESTED_RUN_TIMEOUT_MS);

test("usage can come from either app and an unused entry needs a retention reason", () => {
  const allowlist = parseAllowlist([
    "framework\tReleaseOnly\tThe Release app links it.",
    "symbol\tVerificationOnly\tThe Verification app imports it.",
    "undefined\tUnused\tStale approval.",
    "selector\tControlOnly\tRetained for the allowed control on another SDK.",
    "module\tSourceOnly\tSource imports are checked separately.",
  ].join("\n"));
  const release = { frameworks: ["ReleaseOnly"], selectors: [], urlSymbols: [], undefinedSymbols: [] };
  const verification = { frameworks: [], selectors: [], urlSymbols: ["VerificationOnly"], undefinedSymbols: [] };
  expect(unusedBinaryEntries(allowlist, [release, verification])).toEqual(["undefined\tUnused"]);
}, NESTED_RUN_TIMEOUT_MS);
