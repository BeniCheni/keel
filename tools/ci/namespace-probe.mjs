import net from "node:net";

const problems = [];

try {
  const response = await fetch("https://example.com", { signal: AbortSignal.timeout(8000) });
  problems.push(`fetch completed with status ${response.status}`);
} catch {
  // A thrown fetch is the expected outcome inside the namespace.
}

const connected = await new Promise((resolve) => {
  const socket = net.connect({ host: "1.1.1.1", port: 443 });
  let settled = false;
  const finish = (value) => {
    if (settled) return;
    settled = true;
    socket.destroy();
    resolve(value);
  };
  socket.setTimeout(8000);
  socket.on("connect", () => finish(true));
  socket.on("timeout", () => finish(false));
  socket.on("error", () => finish(false));
});

if (connected) problems.push("net.connect reached a public address");

if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  process.exit(1);
}
