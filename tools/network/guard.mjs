import dgram from "node:dgram";
import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import { syncBuiltinESMExports } from "node:module";
import net from "node:net";
import tls from "node:tls";

function block(name) {
  return function blockedNetwork() {
    throw new Error(`network blocked: ${name}`);
  };
}

/**
 * Fast local check. Loopback is blocked too. The Linux CI namespace is authoritative.
 * `net.Socket.prototype.connect` is the choke point under `http.get`, `http.ClientRequest`,
 * `net.createConnection` and any socket built by hand; the module-level functions are
 * blocked as well so the error names the call that was made.
 */
export function installNetworkGuard() {
  globalThis.fetch = block("fetch");
  globalThis.WebSocket = block("WebSocket");
  http.request = block("http.request");
  http.get = block("http.get");
  https.request = block("https.request");
  https.get = block("https.get");
  net.connect = block("net.connect");
  net.createConnection = block("net.createConnection");
  net.Socket.prototype.connect = block("net.Socket.prototype.connect");
  tls.connect = block("tls.connect");
  dns.lookup = block("dns.lookup");
  dns.resolve = block("dns.resolve");
  dns.resolve4 = block("dns.resolve4");
  dns.resolve6 = block("dns.resolve6");
  dns.promises.lookup = block("dns.promises.lookup");
  dns.promises.resolve = block("dns.promises.resolve");
  dns.promises.resolve4 = block("dns.promises.resolve4");
  dns.promises.resolve6 = block("dns.promises.resolve6");
  dns.Resolver.prototype.resolve = block("dns.Resolver.prototype.resolve");
  dns.Resolver.prototype.resolve4 = block("dns.Resolver.prototype.resolve4");
  dns.Resolver.prototype.resolve6 = block("dns.Resolver.prototype.resolve6");
  dgram.createSocket = block("dgram.createSocket");
  // Builtin named exports otherwise retain the original, unguarded functions.
  syncBuiltinESMExports();
}
