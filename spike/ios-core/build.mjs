import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { bundleVariant } from "./bundle.mjs";

const root = process.argv[2] ? process.argv[2] : join(import.meta.dirname, "../..");
const dist = join(root, "spike/ios-core/dist");
mkdirSync(dist, { recursive: true });

for (const variant of ["compile", "standalone"]) {
  const built = await bundleVariant(root, variant);
  if (!built.ok) {
    process.stderr.write(`build failed variant=${variant} ${built.error}\n`);
    process.exit(1);
  }
  writeFileSync(join(dist, `${variant}.js`), built.text);
  process.stdout.write(`variant=${variant} bytes=${built.bytes}\n`);
}
