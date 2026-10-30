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
  return hits;
}
