import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

function run(command, args) {
  const result = spawnSync(command, args, { cwd: repoRoot, stdio: "inherit" });
  if (result.error || result.status === null) return 127;
  return result.status;
}

export const steps = [
  {
    name: "typecheck",
    run: () => run("pnpm", ["exec", "tsc", "-p", "packages/core", "--noEmit"]),
  },
  {
    name: "tests",
    run: () => run("pnpm", ["--filter", "@keel/core", "test"]),
  },
  {
    name: "tooling",
    run: () => run("pnpm", ["test:tooling"]),
  },
  {
    name: "tripwire",
    run: () => run(process.execPath, ["tools/tripwire/cli.mjs"]),
  },
  {
    name: "network",
    run: () => run(process.execPath, ["tools/network/cli.mjs"]),
  },
  {
    name: "determinism",
    run: () => run(process.execPath, ["tools/fixtures/verify.mjs"]),
  },
  {
    name: "copy",
    run: () => run(process.execPath, ["tools/copy/cli.mjs"]),
  },
  {
    name: "boundaries",
    run: () => run(process.execPath, ["tools/boundary/cli.mjs"]),
  },
];
