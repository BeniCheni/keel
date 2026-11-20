import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { isInvokedDirectly } from "./entry-point.mjs";

const NAMES = ["Text", "Label", "Button", "Section", "navigationTitle", "alert"];

function walk(dir, files) {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of names) {
    const path = join(dir, name);
    let stat;
    try {
      stat = statSync(path);
    } catch {
      continue;
    }
    if (stat.isDirectory()) walk(path, files);
    else if (name.endsWith(".swift")) files.push(path);
  }
}

function skipString(text, index) {
  if (text.startsWith("\"\"\"", index)) {
    const end = text.indexOf("\"\"\"", index + 3);
    return end === -1 ? text.length : end + 3;
  }
  if (text[index] !== "\"") return index;
  let j = index + 1;
  while (j < text.length) {
    if (text[j] === "\\") {
      j += 2;
      continue;
    }
    if (text[j] === "\"") return j + 1;
    j += 1;
  }
  return text.length;
}

function hasLiteral(span) {
  for (let i = 0; i < span.length; i++) {
    if (span.startsWith("\"\"\"", i) || span[i] === "\"") return true;
  }
  return false;
}

function callSpan(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const next = skipString(text, i);
    if (next !== i) {
      i = next - 1;
      continue;
    }
    if (text[i] === "(") depth += 1;
    else if (text[i] === ")") {
      depth -= 1;
      if (depth === 0) return text.slice(open, i + 1);
    }
  }
  return text.slice(open);
}

export function inlineHits(root) {
  const dir = join(root, "apps/ios/Keel");
  const files = [];
  walk(dir, files);
  const hits = [];
  for (const file of files) {
    if (file.endsWith("/Copy.swift") || file.endsWith("\\Copy.swift")) continue;
    const rel = relative(root, file).split("\\").join("/");
    const text = readFileSync(file, "utf8");
    for (let i = 0; i < text.length; i++) {
      const next = skipString(text, i);
      if (next !== i) {
        i = next - 1;
        continue;
      }
      if (text.startsWith("//", i)) {
        const end = text.indexOf("\n", i);
        i = end === -1 ? text.length : end;
        continue;
      }
      for (const name of NAMES) {
        if (!text.startsWith(name, i)) continue;
        const before = i === 0 ? "" : text[i - 1];
        if (before && /[A-Za-z0-9_]/.test(before)) continue;
        const after = i + name.length;
        if (after < text.length && /[A-Za-z0-9_]/.test(text[after])) continue;
        let j = after;
        while (j < text.length && /\s/.test(text[j])) j += 1;
        if (text[j] !== "(") continue;
        const span = callSpan(text, j);
        if (hasLiteral(span)) hits.push({ file: rel, name });
      }
    }
  }
  return hits;
}

if (isInvokedDirectly(import.meta.url)) {
  const root = process.argv[2] ?? process.cwd();
  const hits = inlineHits(root);
  for (const hit of hits) process.stdout.write(`ios-inline\t${hit.name}\t${hit.file}\n`);
  process.exit(hits.length === 0 ? 0 : 1);
}
