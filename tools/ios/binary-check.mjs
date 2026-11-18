import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { loadAllowlist, parseAllowlist } from "./allowlist.mjs";

export const RULES = [
  "framework",
  "named",
  "contentsOf",
  "contentsOfURL",
  "initWithURL",
  "selector",
  "urlSymbol",
  "undefinedSymbol",
];

function run(command, args, input) {
  const result = spawnSync(command, args, { input, encoding: "utf8" });
  if (result.error || result.status !== 0) {
    throw new Error(result.stderr?.trim() || result.error?.message || command + " failed");
  }
  return result.stdout;
}

function frameworkNames(linked) {
  return linked.split("\n").slice(1).flatMap((row) => {
    const path = row.trim().split(/\s+/)[0];
    return path.includes(".framework/") ? [path.split("/").at(-1)] : [];
  });
}

function referencedSelectors(metadata) {
  const names = [];
  let inSelectors = false;
  for (const line of metadata.split("\n")) {
    if (line.startsWith("Contents of (")) {
      inSelectors = /,__objc_selrefs\) section/.test(line);
    } else if (inSelectors && line.trim()) {
      const match = /^\s*0x[0-9a-f]+\s+(\S+)\s*$/i.exec(line);
      if (!match) throw new Error("unrecognized Objective-C selector reference");
      names.push(match[1]);
    }
  }
  return names;
}

export function binarySurface(binary) {
  const lines = (text) => text.split("\n").map((line) => line.trim()).filter(Boolean);
  try {
    const linked = run("xcrun", ["otool", "-L", binary]);
    const undefinedRows = lines(run("xcrun", ["nm", "-um", binary]));
    const imports = undefinedRows.map((row) => {
      const match = /^\(undefined\) (?:[\w ]+ )?(\S+)(?: \((?:from )?([^)]*)\))?$/.exec(row);
      if (!match) throw new Error("unrecognized undefined symbol");
      return { name: match[1], library: match[2] ?? "" };
    });
    const names = imports.map(({ name }) => name).join("\n");
    const demangled = lines(run("xcrun", ["swift-demangle", "--compact"], names + "\n"));
    if (demangled.length !== imports.length) throw new Error("unexpected swift-demangle output");
    const metadata = run("xcrun", ["otool", "-ov", binary]);
    const methodNames = run("xcrun", ["otool", "-v", "-s", "__TEXT", "__objc_methname", binary]);
    const selectors = referencedSelectors(metadata);
    return {
      ok: true,
      frameworks: [...new Set(frameworkNames(linked))],
      demangled,
      methodNames,
      selectors: [...new Set(selectors)],
      urlSymbols: [...new Set(demangled.filter((name) => /\bFoundation\.URL\b/.test(name)))],
      undefinedSymbols: [...new Set(imports.flatMap(({ name, library }, index) => {
        const swiftMangled = /^_?(?:\$[sST]|_T)/.test(name) && name !== demangled[index];
        if (swiftMangled) return [];
        // Compiler-generated Swift runtime and overlay references can have unmangled names.
        const runtime = /^_{1,2}swift(?:_|[A-Z])/.test(name) && library.startsWith("libswift");
        const overlay = name === "__swift_FORCE_LOAD_$_swift" + library && /^(Foundation|UIKit)$/.test(library);
        return runtime || overlay ? [] : [name];
      }))],
    };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function missing(names, allowed) {
  const known = new Set(allowed);
  return names.filter((name) => !known.has(name));
}

export function ruleCounts(binary, allowlist) {
  const surface = binarySurface(binary);
  if (!surface.ok) return { ok: false, counts: {}, error: surface.error };
  const { demangled, methodNames, selectors } = surface;
  const unlisted = {
    framework: missing(surface.frameworks, allowlist.frameworks),
    selector: missing(selectors, allowlist.selectors),
    urlSymbol: missing(surface.urlSymbols, allowlist.symbols),
    undefinedSymbol: missing(surface.undefinedSymbols, allowlist.undefinedSymbols),
  };
  const counts = {
    framework: unlisted.framework.length,
    named: demangled.filter((name) => /URLSession|Data\.init\(contentsOf:|^_(socket|connect|getaddrinfo)$/.test(name)).length,
    contentsOf: demangled.filter((name) => /contentsOf: (__shared )?Foundation\.URL\b/.test(name)).length,
    contentsOfURL: methodNames.split("\n").filter((line) => line.includes("ContentsOfURL")).length,
    initWithURL: [...methodNames.matchAll(/[A-Za-z0-9_:]*URL[A-Za-z0-9_:]*/g)]
      .filter(([name]) => name.startsWith("initWithURL:")).length,
    selector: unlisted.selector.length,
    urlSymbol: unlisted.urlSymbol.length,
    undefinedSymbol: unlisted.undefinedSymbol.length,
  };
  return { ok: true, counts, unlisted };
}

export function evaluateBinary(binary, allowlist, enabled = RULES) {
  const result = ruleCounts(binary, allowlist);
  if (!result.ok) return { status: 2, counts: {}, error: result.error };
  const counts = {};
  let hits = 0;
  for (const rule of RULES) {
    const value = enabled.includes(rule) ? result.counts[rule] : 0;
    counts[rule] = value;
    hits += value;
  }
  return { status: hits > 0 ? 1 : 0, counts, unlisted: result.unlisted };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const binary = process.argv[2];
  if (!binary) {
    process.stderr.write("ios-binary\tmissing binary\n");
    process.exit(2);
  }
  const root = process.argv[3] ?? process.cwd();
  let allowlist;
  try {
    allowlist = process.argv[4] ? parseAllowlist(process.argv[4]) : loadAllowlist(root);
  } catch (error) {
    process.stderr.write("ios-binary\t" + error.message + "\n");
    process.exit(2);
  }
  const result = evaluateBinary(binary, allowlist);
  for (const rule of RULES) process.stdout.write(rule + "=" + (result.counts[rule] ?? 0) + "\n");
  if (result.error) process.stderr.write("ios-binary\t" + result.error + "\n");
  for (const [rule, names] of Object.entries(result.unlisted ?? {})) {
    for (const name of names) process.stderr.write("ios-binary\t" + rule + "\t" + name + "\n");
  }
  process.exit(result.status);
}
