import { pathToFileURL } from "node:url";
import { loadAllowlist } from "./allowlist.mjs";
import { binarySurface } from "./binary-check.mjs";

export function unusedBinaryEntries(allowlist, surfaces) {
  const fields = {
    framework: "frameworks",
    selector: "selectors",
    symbol: "urlSymbols",
    undefined: "undefinedSymbols",
  };
  const used = new Set();
  for (const surface of surfaces) {
    for (const [kind, field] of Object.entries(fields)) {
      for (const name of surface[field]) used.add(kind + "\t" + name);
    }
  }

  return [...allowlist.reasons].flatMap(([entry, reason]) => {
    const kind = entry.split("\t", 1)[0];
    if (!Object.hasOwn(fields, kind) || used.has(entry) || /^Retained for \S/.test(reason)) return [];
    return [entry];
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const paths = process.argv.slice(2);
  try {
    if (paths.length !== 2) throw new Error("expected the Release and Verification binaries");
    const surfaces = paths.map((path) => {
      const surface = binarySurface(path);
      if (!surface.ok) throw new Error(surface.error);
      return surface;
    });
    const unused = unusedBinaryEntries(loadAllowlist(process.cwd()), surfaces);
    for (const entry of unused) process.stderr.write("ios-allowlist\tunused\t" + entry + "\n");
    process.exitCode = unused.length > 0 ? 1 : 0;
  } catch (error) {
    process.stderr.write("ios-allowlist\t" + error.message + "\n");
    process.exitCode = 2;
  }
}
