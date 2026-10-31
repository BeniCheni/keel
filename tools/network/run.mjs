import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const probe = fileURLToPath(new URL("./probe.mjs", import.meta.url));

export const probeNames = [
  "fetch",
  "WebSocket",
  "http.request",
  "http.get",
  "https.request",
  "https.get",
  "net.connect",
  "net.createConnection",
  "net.Socket.prototype.connect",
  "tls.connect",
  "dns.lookup",
  "dns.resolve",
  "dns.resolve4",
  "dns.resolve6",
  "dns.promises.lookup",
  "dns.promises.resolve",
  "dns.promises.resolve4",
  "dns.promises.resolve6",
  "dns.Resolver.prototype.resolve",
  "dns.Resolver.prototype.resolve4",
  "dns.Resolver.prototype.resolve6",
  "dgram.createSocket",
];

export function runProbe(name) {
  return spawnSync(process.execPath, [probe, name], { encoding: "utf8" });
}

/** A probe counts as blocked only when the guard itself killed it, by name. */
export function blockedByGuard(name, result) {
  return result.status === 1 && String(result.stderr ?? "").includes(`network blocked: ${name}`);
}

export function runProbes(names = probeNames, run = runProbe) {
  const missed = [];
  for (const name of names) {
    if (!blockedByGuard(name, run(name))) missed.push(name);
  }
  return missed;
}
