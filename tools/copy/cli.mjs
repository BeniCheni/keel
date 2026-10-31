import { lintCopy } from "./lint.mjs";

const root = process.argv[2] ?? process.cwd();
const hits = lintCopy(root);
for (const hit of hits) {
  process.stdout.write(`copy\t${hit.file}\t${hit.line}\n`);
}
process.exit(hits.length === 0 ? 0 : 1);
