import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SETTING = /\b(DEVELOPMENT_TEAM|PROVISIONING_PROFILE_SPECIFIER)(\[[^\]]*\])?\s*=\s*(\S+)/g;
const DEVICE = [
  /(?<![A-Fa-f0-9])[A-Fa-f0-9]{40}(?![A-Fa-f0-9])/g,
  /(?<![A-Fa-f0-9])[A-Fa-f0-9]{8}-[A-Fa-f0-9]{16}(?![A-Fa-f0-9])/g,
];

function gitFiles(root) {
  const result = spawnSync("git", ["ls-files", "-z", "--", "apps/ios"], { cwd: root, encoding: "utf8" });
  if (result.error || result.status === null) return { ok: false, status: 127, files: [] };
  if (result.status !== 0) return { ok: false, status: result.status, files: [] };
  return { ok: true, status: 0, files: result.stdout.split("\0").filter(Boolean) };
}

export function signingHits(root) {
  const listed = gitFiles(root);
  if (!listed.ok) return { ok: false, status: listed.status, hits: [] };
  const hits = [];
  for (const rel of listed.files) {
    if (rel.endsWith(".mobileprovision")) hits.push({ file: rel, rule: "profile" });
    let text;
    try {
      text = readFileSync(join(root, rel), "utf8");
    } catch {
      return { ok: false, status: 1, hits: [] };
    }
    SETTING.lastIndex = 0;
    for (const match of text.matchAll(SETTING)) {
      const value = match[3].replace(/^"|"$/g, "");
      if (value.length === 0) continue;
      hits.push({ file: rel, rule: match[1] });
    }
    for (const pattern of DEVICE) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) hits.push({ file: rel, rule: "device" });
    }
  }
  return { ok: true, status: hits.length === 0 ? 0 : 1, hits };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.argv[2] ?? process.cwd();
  const result = signingHits(root);
  if (!result.ok) {
    process.stderr.write("ios-signing\tgit\n");
    process.exit(result.status || 2);
  }
  for (const hit of result.hits) process.stdout.write(`ios-signing\t${hit.rule}\t${hit.file}\n`);
  process.exit(result.status);
}
