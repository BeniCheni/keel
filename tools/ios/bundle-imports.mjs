import { pathToFileURL } from "node:url";
import { buildBundle } from "../../apps/ios/bundle/build.mjs";

export function metafileHits(metafile) {
  const hits = [];
  const inputs = new Set(Object.keys(metafile.inputs ?? {}));
  for (const output of Object.values(metafile.outputs ?? {})) {
    for (const item of output.imports ?? []) {
      if (item.external) hits.push({ rule: "external", path: item.path });
    }
    for (const input of Object.keys(output.inputs ?? {})) inputs.add(input);
  }
  for (const input of inputs) {
    const normalized = input.split("\\").join("/");
    if (normalized.includes("packages/plugin-mln/") || normalized.includes("packages/montecarlo/")) {
      hits.push({ rule: "input", path: normalized });
    }
  }
  return hits;
}

export async function bundleImportHits(root, options = {}) {
  const built = await buildBundle(root, options);
  if (!built.ok) return { ok: false, error: built.error, hits: [] };
  return { ok: true, hits: metafileHits(built.metafile) };
}

function printHits(hits) {
  for (const hit of hits) process.stdout.write(`ios-bundle\t${hit.rule}\t${hit.path}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.argv[2] ?? process.cwd();
  const result = await bundleImportHits(root);
  if (!result.ok) {
    process.stderr.write(`ios-bundle\t${result.error}\n`);
    process.exit(2);
  }
  printHits(result.hits);
  process.exit(result.hits.length === 0 ? 0 : 1);
}
