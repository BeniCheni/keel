import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

/**
 * `pnpm test:tooling [-- <filter>]`. pnpm forwards a literal `--`, and vitest ignores
 * every filter that follows one, so the whole suite ran while the caller believed the
 * run was narrowed. The `--` is dropped here and the filters reach vitest, which
 * matches them against the test file's path.
 */
export function vitestArgs(argv) {
  const filters = argv[0] === "--" ? argv.slice(1) : argv;
  return ["run", "--config", "tools/vitest.config.mjs", ...filters];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = spawnSync("pnpm", ["exec", "vitest", ...vitestArgs(process.argv.slice(2))], { stdio: "inherit" });
  process.exit(result.status ?? 1);
}
