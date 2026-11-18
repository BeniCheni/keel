import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const BANNED = /(?:^|[^A-Za-z])(should|buy|sell|hold)(?![A-Za-z])/i;

function walk(dir, files) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, files);
    else if (stat.isFile()) files.push(path);
  }
}

function lineAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === "\n") line += 1;
  }
  return line;
}

function swiftLiterals(text) {
  const found = [];
  let i = 0;
  while (i < text.length) {
    if (text.startsWith("//", i)) {
      const end = text.indexOf("\n", i);
      i = end === -1 ? text.length : end + 1;
      continue;
    }
    if (text.startsWith("/*", i)) {
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? text.length : end + 2;
      continue;
    }
    if (text.startsWith("\"\"\"", i)) {
      const end = text.indexOf("\"\"\"", i + 3);
      found.push({ text: text.slice(i + 3, end === -1 ? text.length : end), index: i });
      i = end === -1 ? text.length : end + 3;
      continue;
    }
    if (text[i] === "\"") {
      let j = i + 1;
      let body = "";
      while (j < text.length) {
        if (text[j] === "\\") {
          body += text.slice(j, j + 2);
          j += 2;
          continue;
        }
        if (text[j] === "\"") break;
        body += text[j];
        j += 1;
      }
      found.push({ text: body, index: i });
      i = j + 1;
      continue;
    }
    i += 1;
  }
  return found;
}

function ruleForBody(text) {
  const start = text.search(/function ruleFor\b/);
  if (start < 0) return "";
  const open = text.indexOf("{", start);
  if (open < 0) return "";
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth += 1;
    else if (text[i] === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(open, i + 1);
    }
  }
  return text.slice(open);
}

function templateStatics(body) {
  const parts = [];
  const pattern = /`(?:\\.|[^`\\])*`/g;
  for (const match of body.matchAll(pattern)) {
    const raw = match[0].slice(1, -1);
    parts.push(raw.replace(/\$\{[^}]*\}/g, ""));
  }
  const quoted = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g;
  for (const match of body.matchAll(quoted)) parts.push(match[0].slice(1, -1));
  return parts;
}

function pushBanned(hits, file, line, text) {
  if (BANNED.test(text)) hits.push({ file, line });
}

export function lintCopy(root) {
  const files = [];
  const copyDir = join(root, "packages/ui/src/copy");
  if (existsSync(copyDir)) walk(copyDir, files);
  for (const name of ["README.md", "DISCLAIMER.md"]) {
    const path = join(root, name);
    if (existsSync(path)) files.push(path);
  }
  const hits = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (BANNED.test(lines[i])) {
        hits.push({ file: relative(root, file).split("\\").join("/"), line: i + 1 });
      }
    }
  }
  const swiftDir = join(root, "apps/ios");
  if (existsSync(swiftDir)) {
    const swiftFiles = [];
    walk(swiftDir, swiftFiles);
    for (const file of swiftFiles) {
      if (!file.endsWith(".swift")) continue;
      const rel = relative(root, file).split("\\").join("/");
      const text = readFileSync(file, "utf8");
      for (const literal of swiftLiterals(text)) pushBanned(hits, rel, lineAt(text, literal.index), literal.text);
    }
  }
  const schedule = join(root, "packages/core/src/schedule/schedule.ts");
  if (existsSync(schedule)) {
    const text = readFileSync(schedule, "utf8");
    const body = ruleForBody(text);
    const bodyAt = text.indexOf(body);
    for (const part of templateStatics(body)) {
      if (!BANNED.test(part)) continue;
      hits.push({ file: "packages/core/src/schedule/schedule.ts", line: lineAt(text, Math.max(bodyAt, 0)) });
    }
  }
  return hits;
}
