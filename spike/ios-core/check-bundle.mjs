import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inspectVariant } from "./bundle.mjs";

const root = process.argv[2] ? process.argv[2] : join(import.meta.dirname, "../..");
const planted = process.env.KEEL_SPIKE_PLANTED ?? "";
let failed = false;

for (const variant of ["compile", "standalone"]) {
  const builtPath = join(root, "spike/ios-core/dist", `${variant}.js`);
  let shipped = "";
  try {
    shipped = readFileSync(builtPath, "utf8");
  } catch {
    process.stderr.write(`missing bundle variant=${variant}\n`);
    failed = true;
    continue;
  }
  const bytes = Buffer.byteLength(shipped);
  const inspected = await inspectVariant(root, variant, planted);
  const flags = [...inspected.flags];
  if (shipped.includes("montecarlo") && !flags.some((flag) => flag.reason === "montecarlo")) {
    flags.push({ reason: "montecarlo" });
  }
  if (!inspected.ok && flags.length === 0) flags.push({ reason: "build", detail: inspected.error });
  if (flags.length === 0) {
    process.stdout.write(`variant=${variant} bytes=${bytes} flagged=0\n`);
    continue;
  }
  failed = true;
  for (const flag of flags) {
    const extra = flag.path ? ` path=${flag.path}` : flag.name ? ` name=${flag.name}` : flag.detail ? ` detail=${flag.detail}` : "";
    process.stdout.write(`variant=${variant} bytes=${bytes} flagged reason=${flag.reason}${extra}\n`);
  }
}

process.exit(failed ? 1 : 0);
