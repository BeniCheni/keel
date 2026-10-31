import { checkBoundaries } from "./check.mjs";

const root = process.argv[2] ?? process.cwd();
const hits = checkBoundaries(root);
for (const hit of hits) {
  process.stdout.write(`boundary\t${hit.file}\t${hit.line}\n`);
}
process.exit(hits.length === 0 ? 0 : 1);
