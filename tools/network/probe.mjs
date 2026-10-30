import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import tls from "node:tls";
import { installNetworkGuard } from "./guard.mjs";

installNetworkGuard();

const which = process.argv[2];
if (which === "fetch") {
  globalThis.fetch("http://127.0.0.1:9/");
} else if (which === "http.request") {
  http.request("http://127.0.0.1:9/");
} else if (which === "https.request") {
  https.request("https://127.0.0.1:9/");
} else if (which === "net.connect") {
  net.connect(9, "127.0.0.1");
} else if (which === "tls.connect") {
  tls.connect({ host: "127.0.0.1", port: 9 });
} else if (which === "dns.lookup") {
  dns.lookup("localhost", () => {});
} else {
  console.error("unknown network probe");
  process.exit(2);
}

process.exit(0);
