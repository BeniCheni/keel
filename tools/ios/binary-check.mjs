import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { loadAllowlist, parseAllowlist } from "./allowlist.mjs";

export const RULES = [
  "framework",
  "named",
  "contentsOf",
  "contentsOfURL",
  "initWithURL",
  "urlSelector",
  "urlSymbol",
];

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error || result.status === null) return { ok: false, stdout: "" };
  if (result.status !== 0) return { ok: false, stdout: result.stdout ?? "" };
  return { ok: true, stdout: result.stdout ?? "" };
}

function linesMatching(text, pattern) {
  let count = 0;
  for (const line of text.split("\n")) {
    if (pattern.test(line)) count += 1;
  }
  return count;
}

function frameworks(text) {
  const names = [];
  const rows = text.split("\n").slice(1);
  for (const row of rows) {
    const path = row.trim().split(/\s+/)[0] ?? "";
    if (!path.includes(".framework/")) continue;
    names.push(path.split("/").pop());
  }
  return names;
}

function selectorTokens(text) {
  const found = new Set();
  for (const match of text.matchAll(/[A-Za-z0-9_:]*URL[A-Za-z0-9_:]*/g)) {
    if (match[0].length > 0) found.add(match[0]);
  }
  return [...found];
}

export function binarySurface(binary) {
  const linked = run("xcrun", ["otool", "-L", binary]);
  const symbols = run("xcrun", ["nm", "-u", binary]);
  if (!linked.ok || !symbols.ok) return { ok: false };
  const demangled = spawnSync("xcrun", ["swift-demangle"], { input: symbols.stdout, encoding: "utf8" });
  if (demangled.error || demangled.status !== 0) return { ok: false };
  const selectors = run("xcrun", ["otool", "-v", "-s", "__TEXT", "__objc_methname", binary]);
  if (!selectors.ok) return { ok: false };
  const selectorText = selectors.stdout ?? "";
  return {
    ok: true,
    linked: linked.stdout,
    demangled: demangled.stdout ?? "",
    selectors: selectorText,
    tokens: selectorTokens(selectorText),
  };
}

export function ruleCounts(binary, allowlist) {
  const surface = binarySurface(binary);
  if (!surface.ok) return { ok: false, counts: {} };
  const demangledText = surface.demangled;
  const selectorText = surface.selectors;
  const allowedFrameworks = new Set(allowlist.frameworks);
  const allowedSelectors = new Set(allowlist.selectors);
  const tokens = selectorTokens(selectorText);
  const counts = {
    framework: frameworks(surface.linked).filter((name) => !allowedFrameworks.has(name)).length,
    named: linesMatching(demangledText, /URLSession|Data\.init\(contentsOf:|_socket$|_connect$|_getaddrinfo$/),
    contentsOf: linesMatching(demangledText, /contentsOf: (__shared )?Foundation\.URL/),
    contentsOfURL: linesMatching(selectorText, /ContentsOfURL/),
    initWithURL: tokens.filter((token) => token.startsWith("initWithURL:")).length,
    urlSelector: tokens.filter((token) => !allowedSelectors.has(token)).length,
    urlSymbol: demangledText.split("\n").filter((line) => {
      if (!/\([^)]*Foundation\.URL/.test(line)) return false;
      return !allowlist.symbols.some((symbol) => symbol.length > 0 && line.includes(symbol));
    }).length,
  };
  return { ok: true, counts };
}

export function evaluateBinary(binary, allowlist, enabled = RULES) {
  const result = ruleCounts(binary, allowlist);
  if (!result.ok) return { status: 2, counts: {} };
  const counts = {};
  let hits = 0;
  for (const rule of RULES) {
    const value = enabled.includes(rule) ? result.counts[rule] : 0;
    counts[rule] = value;
    hits += value;
  }
  return { status: hits > 0 ? 1 : 0, counts };
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
    process.stderr.write(`ios-binary\t${error.message}\n`);
    process.exit(2);
  }
  const result = evaluateBinary(binary, allowlist);
  for (const rule of RULES) process.stdout.write(`${rule}=${result.counts[rule] ?? 0}\n`);
  process.exit(result.status);
}
