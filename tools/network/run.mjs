import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const probe = fileURLToPath(new URL("./probe.mjs", import.meta.url));

export const probeNames = [
  "fetch",
  "http.request",
  "https.request",
  "net.connect",
  "tls.connect",
  "dns.lookup",
];

export function runProbe(name) {
  return spawnSync(process.execPath, [probe, name], { encoding: "utf8" });
}

export function runProbes() {
  const missed = [];
  for (const name of probeNames) {
    const result = runProbe(name);
    if (result.status === 0 || result.status === null) missed.push(name);
  }
  return missed;
}
