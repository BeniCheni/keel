import net from "node:net";

/**
 * Runs inside the Linux CI namespace after `pnpm verify`. Both requests must fail,
 * and they must fail because there is no route out: a resolver that cannot be
 * reached or a network that is unreachable. Any other outcome (a response, an
 * aborted timeout, a malformed call) is a problem, so a probe that never really
 * tried the network cannot pass.
 */
const NO_ROUTE = new Set(["ENETUNREACH", "EHOSTUNREACH", "ENETDOWN", "EAI_AGAIN", "ENOTFOUND", "EAI_FAIL"]);

const problems = [];

function codeOf(error) {
  return error?.cause?.code ?? error?.code ?? error?.name ?? "unknown";
}

try {
  const response = await fetch("https://example.com", { signal: AbortSignal.timeout(8000) });
  problems.push(`fetch completed with status ${response.status}`);
} catch (error) {
  const code = codeOf(error);
  if (NO_ROUTE.has(code)) console.log(`fetch blocked: ${code}`);
  else problems.push(`fetch failed for another reason: ${code}`);
}

const outcome = await new Promise((resolve) => {
  const socket = net.connect({ host: "1.1.1.1", port: 443 });
  let settled = false;
  const finish = (value) => {
    if (settled) return;
    settled = true;
    socket.destroy();
    resolve(value);
  };
  socket.setTimeout(8000);
  socket.on("connect", () => finish("connected"));
  socket.on("timeout", () => finish("timeout"));
  socket.on("error", (error) => finish(codeOf(error)));
});

if (NO_ROUTE.has(outcome)) console.log(`net.connect blocked: ${outcome}`);
else problems.push(`net.connect did not fail with a no-route error: ${outcome}`);

if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  process.exit(1);
}
