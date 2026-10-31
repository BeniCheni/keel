import { scanRepo } from "./scan.mjs";

const root = process.argv[2] ?? process.cwd();
const result = scanRepo(root);
if (result.error) {
  console.error(`scan error: ${result.error}`);
  process.exit(2);
}
for (const hit of result.hits) {
  process.stdout.write(`${hit.class}\t${hit.where}\t${hit.line}\n`);
}
process.exit(result.hits.length === 0 ? 0 : 1);
