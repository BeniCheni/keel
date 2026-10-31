import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, normalize, relative, sep } from "node:path";

const SKIP = new Set([".git", "node_modules", "dist", "coverage"]);
const PACKAGE = "@keel/montecarlo";
const TRIVIA = String.raw`(?:\s|/\*[\s\S]*?\*/|//[^\n]*(?:\n|$))*`;
const CALL = String.raw`\b(?:import|require)${TRIVIA}\(${TRIVIA}`;
const END_ARGUMENT = String.raw`${TRIVIA}(?=[,)])`;

const SPECIFIERS = [
  /\bimport\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?["']([^"']+)["']/g,
  /\bexport\s+(?:type\s+)?[^'";]*?\s+from\s+["']([^"']+)["']/g,
  new RegExp(`${CALL}["']([^"']+)["']${END_ARGUMENT}`, "g"),
  new RegExp(`${CALL}\\x60([^\\x60$]+)\\x60${END_ARGUMENT}`, "g"),
];

function posix(path) {
  return path.split(sep).join("/");
}

export function isAllowedImporter(relPosix) {
  return (
    relPosix === "packages/montecarlo" ||
    relPosix.startsWith("packages/montecarlo/") ||
    relPosix === "packages/ui/src/screens/scenario" ||
    relPosix.startsWith("packages/ui/src/screens/scenario/")
  );
}

export function isMontecarloSpecifier(root, file, spec) {
  if (spec === PACKAGE || spec.startsWith(`${PACKAGE}/`)) return true;
  const specPosix = spec.replace(/\\/g, "/");
  if (specPosix === "packages/montecarlo" || specPosix.startsWith("packages/montecarlo/")) return true;
  if (spec.startsWith(".")) {
    const resolved = posix(normalize(join(dirname(file), spec)));
    const target = posix(normalize(join(root, "packages", "montecarlo")));
    return resolved === target || resolved.startsWith(`${target}/`);
  }
  return false;
}

function walk(dir, files) {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of names) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    let stat;
    try {
      stat = lstatSync(path);
    } catch {
      continue;
    }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) walk(path, files);
    else if (stat.isFile()) files.push(path);
  }
}

function readText(path) {
  try {
    const buf = readFileSync(path);
    if (buf.includes(0)) return null;
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return null;
  }
}

export function specifiersIn(text) {
  const found = [];
  for (const pattern of SPECIFIERS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const spec = match[1];
      if (spec === undefined) continue;
      const start = match.index + match[0].lastIndexOf(spec);
      found.push({ spec, index: start });
    }
  }
  return found;
}

function lineAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === "\n") line++;
  }
  return line;
}

export function checkBoundaries(root) {
  const files = [];
  walk(root, files);
  const hits = [];
  for (const file of files) {
    const rel = posix(relative(root, file));
    if (isAllowedImporter(rel)) continue;
    const text = readText(file);
    if (text === null) continue;
    const seen = new Set();
    for (const found of specifiersIn(text)) {
      if (!isMontecarloSpecifier(root, file, found.spec)) continue;
      const line = lineAt(text, found.index);
      const key = `${rel}\t${line}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({ file: rel, line });
    }
  }
  hits.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  return hits;
}
