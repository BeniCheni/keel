import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { expect, test } from "vitest";
import { NESTED_RUN_TIMEOUT_MS, repoRoot, run } from "./helpers.mjs";

function rootWith(files) {
  const root = mkdtempSync(join(tmpdir(), "keel-copy-"));
  for (const [rel, body] of Object.entries(files)) {
    mkdirSync(join(root, rel, ".."), { recursive: true });
    writeFileSync(join(root, rel), body);
  }
  return root;
}

function copy(root) {
  return run(process.execPath, ["tools/copy/cli.mjs", root]);
}

test("a banned word in a Swift literal or in ruleFor fails copy lint", () => {
  const plants = [
    { "apps/ios/Keel/Copy.swift": "let x = \"should\"\n" },
    { "apps/ios/KeelCoreHost/Sources/Note.swift": "let note = \"sell\"\n" },
    {
      "packages/core/src/schedule/schedule.ts": "function ruleFor(step: number, calendarId: string): string {\n  return `should ${step}`\n}\n",
    },
  ];
  for (const files of plants) {
    const result = copy(rootWith(files));
    expect(result.status).toBe(1);
  }
  const comment = copy(rootWith({ "apps/ios/Keel/Copy.swift": "// should\nlet x = \"ready\"\n" }));
  expect(comment.status).toBe(0);
}, NESTED_RUN_TIMEOUT_MS);

test("copy lint checks nested Swift literals inside interpolations", () => {
  const file = "apps/ios/Keel/Copy.swift";
  const plants = [
    ['let x = "\\(flag ? "should" : "ready")"', 1],
    ['let x = "\\(format(value: "\\(flag ? "buy" : "ready")"))"', 1],
    ['let x = """\n\\(format("sell"))\n"""', 2],
    ['let x = "\\(format(ready /* ) "hold" */))"', 0],
    ['let x = "\\\\(ready) \\(flag ? "ready" : "also ready")"', 0],
  ];
  for (const [body, line] of plants) {
    const result = copy(rootWith({ [file]: body + "\n" }));
    expect(result.status, body).toBe(line > 0 ? 1 : 0);
    expect(result.stdout, body).toBe(line > 0 ? ["copy", file, line].join("\t") + "\n" : "");
  }
}, NESTED_RUN_TIMEOUT_MS);

test("the repo copy lint passes", () => {
  expect(copy(repoRoot).status).toBe(0);
}, NESTED_RUN_TIMEOUT_MS);
