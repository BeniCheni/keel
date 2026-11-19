import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { isInvokedDirectly } from "./entry-point.mjs";
import { loadAllowlist } from "./allowlist.mjs";

const BANNED = [
  "URLSession",
  "NWConnection",
  "NSURLConnection",
  "CFNetwork",
  "WKWebView",
  "SFSafariViewController",
  "importNetwork",
  "Darwin",
  "socket",
  "contentsOf",
  "URL(string",
];

function walkSwift(dir, files) {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of names) {
    if (name === ".build" || name === "node_modules") continue;
    const path = join(dir, name);
    let stat;
    try {
      stat = statSync(path);
    } catch {
      continue;
    }
    if (stat.isDirectory()) walkSwift(path, files);
    else if (name.endsWith(".swift")) files.push(path);
  }
}

function squeeze(text) {
  return text.replace(/\s+/g, "");
}

function modulesIn(text) {
  const found = [];
  const pattern = /^[ \t]*(?:@testable[ \t]+)?import[ \t]+(?:(?:typealias|struct|class|enum|protocol|func|let|var)[ \t]+)?([A-Za-z_][A-Za-z0-9_]*)/gm;
  for (const match of text.matchAll(pattern)) found.push(match[1]);
  return found;
}

export function sourceHits(root, allowlist) {
  const dir = join(root, "apps/ios");
  const files = [];
  walkSwift(dir, files);
  const modules = new Set(allowlist.modules);
  const hits = [];
  for (const file of files) {
    const rel = relative(root, file).split("\\").join("/");
    const text = readFileSync(file, "utf8");
    const flat = squeeze(text);
    for (const token of BANNED) {
      if (flat.includes(token)) hits.push({ file: rel, rule: "token", detail: token });
    }
    for (const name of modulesIn(text)) {
      if (!modules.has(name)) hits.push({ file: rel, rule: "import", detail: name });
    }
  }
  return hits;
}

function printHits(hits) {
  for (const hit of hits) process.stdout.write(`ios-source\t${hit.rule}\t${hit.detail}\t${hit.file}\n`);
}

if (isInvokedDirectly(import.meta.url)) {
  const root = process.argv[2] ?? process.cwd();
  let allowlist;
  try {
    allowlist = loadAllowlist(root);
  } catch (error) {
    process.stderr.write(`ios-source\t${error.message}\n`);
    process.exit(2);
  }
  const hits = sourceHits(root, allowlist);
  printHits(hits);
  process.exit(hits.length === 0 ? 0 : 1);
}
