import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { run } from "./helpers.mjs";

/**
 * The namespace itself only exists on the Linux CI cells. These tests preload a
 * stub for `fetch` and `net.connect` and check how the probe reads each outcome.
 */
function probeWith({ fetchBody, socketEvent }) {
  const dir = mkdtempSync(join(tmpdir(), "keel-nsprobe-"));
  const stub = join(dir, "stub.mjs");
  writeFileSync(
    stub,
    [
      'import { EventEmitter } from "node:events";',
      'import net from "node:net";',
      `globalThis.fetch = async () => { ${fetchBody} };`,
      "net.connect = () => {",
      "  const socket = new EventEmitter();",
      "  socket.setTimeout = () => {};",
      "  socket.destroy = () => {};",
      `  setImmediate(() => { ${socketEvent} });`,
      "  return socket;",
      "};",
      "",
    ].join("\n"),
  );
  try {
    return run(process.execPath, ["--import", stub, "tools/ci/namespace-probe.mjs"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const noRouteFetch = 'throw new TypeError("fetch failed", { cause: Object.assign(new Error("getaddrinfo"), { code: "EAI_AGAIN" }) });';
const noRouteSocket = 'socket.emit("error", Object.assign(new Error("connect"), { code: "ENETUNREACH" }));';

test("the namespace probe passes only when both requests fail for want of a route, and says why", () => {
  const result = probeWith({ fetchBody: noRouteFetch, socketEvent: noRouteSocket });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("fetch blocked: EAI_AGAIN");
  expect(result.stdout).toContain("net.connect blocked: ENETUNREACH");
});

test("the namespace probe fails when fetch completes", () => {
  const result = probeWith({ fetchBody: "return { status: 200 };", socketEvent: noRouteSocket });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("fetch completed with status 200");
});

test("the namespace probe fails when fetch throws for a reason other than the network", () => {
  const result = probeWith({
    fetchBody: 'throw Object.assign(new TypeError("Invalid URL"), { code: "ERR_INVALID_URL" });',
    socketEvent: noRouteSocket,
  });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("fetch failed for another reason: ERR_INVALID_URL");
});

test("the namespace probe fails when the socket connects or only times out", () => {
  const connected = probeWith({ fetchBody: noRouteFetch, socketEvent: 'socket.emit("connect");' });
  expect(connected.status).toBe(1);
  expect(connected.stderr).toContain("net.connect did not fail with a no-route error: connected");
  const timedOut = probeWith({ fetchBody: noRouteFetch, socketEvent: 'socket.emit("timeout");' });
  expect(timedOut.status).toBe(1);
  expect(timedOut.stderr).toContain("net.connect did not fail with a no-route error: timeout");
});
