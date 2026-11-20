import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { NESTED_RUN_TIMEOUT_MS, run } from "../../acceptance/test/helpers.mjs";

function visible(text) {
  return text.replace(/\u001b\[[0-9;]*m/g, "");
}

function controls(setting) {
  const noXcode = mkdtempSync(join(tmpdir(), "keel-noxcode-"));
  const env = { ...process.env, DEVELOPER_DIR: noXcode, KEEL_IOS_CONTROLS: setting };
  // A path filter, not a file name: it matches the one control test file under tools/ios/test.
  const result = run("pnpm", ["exec", "vitest", "run", "--config", "tools/vitest.config.mjs", "tools/ios/test/binary-check"], { env });
  return { status: result.status, text: visible(`${result.stdout}\n${result.stderr}`) };
}

test("with no iOS SDK the binary controls are skipped, and they fail where the swift job requires them", () => {
  const optional = controls("");
  expect(optional.status).toBe(0);
  expect(optional.text).toMatch(/Test Files\s+1 skipped \(1\)/);
  expect(optional.text).toMatch(/Tests\s+9 skipped \(9\)/);
  expect(optional.text).not.toMatch(/Tests\s+\d+ passed/);
  const required = controls("required");
  expect(required.status).not.toBe(0);
  expect(required.text).toContain("ios-controls: no iOS SDK at 27.0 or later was found");
}, NESTED_RUN_TIMEOUT_MS);
