import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { NESTED_RUN_TIMEOUT_MS, repoRoot, run, write } from "../../acceptance/test/helpers.mjs";

const commands = [
  ["allowlist-usage", ["one"], /ios-allowlist\texpected/],
  ["binary-check", [], /ios-binary\tmissing binary/],
  ["bundle-imports", ["root"], /ios-bundle\t/],
  ["inline-check", ["root"], /ios-inline\tText/],
  ["signing-check", ["root"], /ios-signing\tgit/],
  ["source-check", ["root"], /ios-source\t/],
];

test.each(commands)("%s rejects invalid input when run through a symbolic link", (name, args, diagnostic) => {
  const root = mkdtempSync(join(tmpdir(), "keel-ios-entry-"));
  try {
    const entry = join(repoRoot, "tools/ios", name + ".mjs");
    const link = join(root, name + ".mjs");
    symlinkSync(entry, link);
    write(root, "apps/ios/Keel/RootView.swift", 'Text("hello")\n');
    const argv = args.map((arg) => arg === "root" ? root : arg);
    const direct = run(process.execPath, [entry, ...argv]);
    expect(direct.status).toBeGreaterThan(0);
    expect(direct.stdout + direct.stderr).toMatch(diagnostic);
    const linked = run(process.execPath, [link, ...argv]);
    expect(linked.status).toBe(direct.status);
    expect(linked.stdout + linked.stderr).toMatch(diagnostic);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, NESTED_RUN_TIMEOUT_MS);
