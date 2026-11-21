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

function swiftCommentEnd(text, start) {
  if (text.startsWith("//", start)) {
    const end = text.indexOf("\n", start + 2);
    return end === -1 ? text.length : end + 1;
  }
  if (!text.startsWith("/*", start)) return start;

  let depth = 1;
  let i = start + 2;
  while (i < text.length && depth > 0) {
    if (text.startsWith("/*", i)) {
      depth += 1;
      i += 2;
    } else if (text.startsWith("*/", i)) {
      depth -= 1;
      i += 2;
    } else {
      i += 1;
    }
  }
  return i;
}

function swiftLiterals(text) {
  const found = [];

  function interpolationEnd(start) {
    let depth = 1;
    let i = start;
    while (i < text.length && depth > 0) {
      const commentEnd = swiftCommentEnd(text, i);
      if (commentEnd !== i) {
        i = commentEnd;
      } else if (text[i] === '"') {
        i = literalEnd(i);
      } else {
        if (text[i] === "(") depth += 1;
        if (text[i] === ")") depth -= 1;
        i += 1;
      }
    }
    return i;
  }

  function literalEnd(index) {
    const quote = text.startsWith('"""', index) ? '"""' : '"';
    let start = index + quote.length;
    let i = start;
    let body = "";
    while (i < text.length && !text.startsWith(quote, i)) {
      if (text.startsWith("\\(", i)) {
        body += text.slice(start, i) + " ";
        i = interpolationEnd(i + 2);
        start = i;
      } else {
        i += text[i] === "\\" ? 2 : 1;
      }
    }
    found.push({ text: body + text.slice(start, i), index });
    return i + quote.length;
  }

  let i = 0;
  while (i < text.length) {
    const commentEnd = swiftCommentEnd(text, i);
    if (commentEnd !== i) i = commentEnd;
    else if (text[i] === '"') i = literalEnd(i);
    else i += 1;
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
