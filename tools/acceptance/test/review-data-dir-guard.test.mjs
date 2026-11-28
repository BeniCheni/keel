import { accessSync, constants, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, isAbsolute, join } from "node:path";
import { expect, test } from "vitest";
import { NESTED_RUN_TIMEOUT_MS, repoRoot, run } from "./helpers.mjs";

const SHELL_TIMEOUT_MS = 10_000;
const sentinel = "reached";
const stubMktemp = 'mktemp() { printf "%s\n" "$TEST_MKTEMP_DIR"; return "$TEST_MKTEMP_STATUS"; }';
const cases = [
  { name: "rejects a failed mktemp naming an existing directory", stubStatus: "1", status: 1 },
  { name: "preserves a failed mktemp status even for an empty directory", stubStatus: "1", stubDir: "empty", status: 1 },
  { name: "rejects a successful mktemp naming a nonempty directory", stubStatus: "0", status: 1 },
  { name: "rejects a writable relative TMPDIR", parent: "relative", status: 1 },
  { name: "rejects a missing TMPDIR directory", parent: "missing", status: 1 },
  { name: "exports an absolute, empty directory on success", status: 0 },
];

function hasZsh() {
  return (process.env.PATH ?? "").split(delimiter).some((directory) => {
    try {
      accessSync(join(directory, "zsh"), constants.X_OK);
      return true;
    } catch {
      return false;
    }
  });
}

function readGuard() {
  const skill = readFileSync(join(repoRoot, ".claude/skills/keel-pr-review/SKILL.md"), "utf8");
  const guard = /^3\. Point the app's data folder[^\n]*\n[ \t]+\x60([^\x60\n]+)\x60[ \t]*$/m.exec(skill)?.[1];
  if (!guard) throw new Error("The code span after setup step 3 is missing");
  return guard;
}

const zshInstalled = hasZsh();
for (const shell of ["bash", "zsh"]) {
  for (const scenario of cases) {
    test.skipIf(shell === "zsh" && !zshInstalled)(shell + " setup step 3 " + scenario.name, () => {
      const root = mkdtempSync(join(tmpdir(), "keel-review-guard-"));
      try {
        const full = join(root, "full");
        mkdirSync(full);
        writeFileSync(join(full, "synthetic"), "");
        mkdirSync(join(root, "empty"));
        mkdirSync(join(root, "relative"));
        const setup = scenario.stubStatus === undefined ? ":" : stubMktemp;
        const script = [setup, readGuard(), 'printf "%s\n" reached', "printenv KEEL_DATA_DIR"].join("\n");
        const startupFlags = shell === "bash" ? ["--noprofile", "--norc"] : ["-f"];
        const result = run(shell, [...startupFlags, "-c", script], {
          cwd: root,
          env: {
            PATH: process.env.PATH,
            TMPDIR: scenario.parent === "relative" ? "relative" : join(root, scenario.parent ?? ""),
            TEST_MKTEMP_DIR: join(root, scenario.stubDir ?? "full"),
            TEST_MKTEMP_STATUS: scenario.stubStatus ?? "",
          },
          timeout: SHELL_TIMEOUT_MS,
        });
        expect(result.status, result.stderr).toBe(scenario.status);
        if (scenario.status === 0) {
          const [marker, dataDir] = result.stdout.trimEnd().split("\n");
          expect(marker).toBe(sentinel);
          expect(isAbsolute(dataDir)).toBe(true);
          expect(dirname(dataDir)).toBe(root);
          expect(readdirSync(dataDir)).toEqual([]);
        } else {
          expect(result.stdout.split("\n")).not.toContain(sentinel);
        }
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }, NESTED_RUN_TIMEOUT_MS);
  }
}
