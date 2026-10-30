import dgram from "node:dgram";
import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import tls from "node:tls";
import { installNetworkGuard } from "./guard.mjs";

installNetworkGuard();

const host = "127.0.0.1";
const noop = () => {};
const calls = {
  fetch: () => globalThis.fetch(`http://${host}:9/`),
  WebSocket: () => new globalThis.WebSocket(`ws://${host}:9/`),
  "http.request": () => http.request(`http://${host}:9/`),
  "http.get": () => http.get(`http://${host}:9/`),
  "https.request": () => https.request(`https://${host}:9/`),
  "https.get": () => https.get(`https://${host}:9/`),
  "net.connect": () => net.connect(9, host),
  "net.createConnection": () => net.createConnection(9, host),
  "net.Socket.prototype.connect": () => new net.Socket().connect(9, host),
  "tls.connect": () => tls.connect({ host, port: 9 }),
  "dns.lookup": () => dns.lookup("localhost", noop),
  "dns.resolve": () => dns.resolve("localhost", noop),
  "dns.resolve4": () => dns.resolve4("localhost", noop),
  "dns.resolve6": () => dns.resolve6("localhost", noop),
  "dns.promises.lookup": () => dns.promises.lookup("localhost"),
  "dns.promises.resolve": () => dns.promises.resolve("localhost"),
  "dns.promises.resolve4": () => dns.promises.resolve4("localhost"),
  "dns.promises.resolve6": () => dns.promises.resolve6("localhost"),
  "dns.Resolver.prototype.resolve": () => new dns.Resolver().resolve("localhost", noop),
  "dns.Resolver.prototype.resolve4": () => new dns.Resolver().resolve4("localhost", noop),
  "dns.Resolver.prototype.resolve6": () => new dns.Resolver().resolve6("localhost", noop),
  "dgram.createSocket": () => dgram.createSocket("udp4"),
};

const call = calls[process.argv[2]];
if (!call) {
  console.error("unknown network probe");
  process.exit(2);
}
// A blocked call throws here, synchronously, and the process dies with exit 1
// before this line. Anything that returns, a promise included, reaches exit 0.
call();
process.exit(0);
