import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import tls from "node:tls";

function block(name) {
  return function blockedNetwork() {
    throw new Error(`network blocked: ${name}`);
  };
}

/** Fast local check. Loopback is blocked too. The Linux CI namespace is authoritative. */
export function installNetworkGuard() {
  globalThis.fetch = block("fetch");
  http.request = block("http.request");
  https.request = block("https.request");
  net.connect = block("net.connect");
  tls.connect = block("tls.connect");
  dns.lookup = block("dns.lookup");
}
