/**
 * Test knobs for the verify runner. They come from argv only, so `pnpm verify`
 * with no arguments runs every step whatever the environment holds.
 */
export function parseOptions(argv) {
  let stub = false;
  const fail = new Set();
  const rest = [];
  const addNames = (list) => {
    for (const name of list.split(",")) {
      if (name.trim()) fail.add(name.trim());
    }
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--stub") stub = true;
    else if (arg === "--fail") addNames(argv[++i] ?? "");
    else if (arg.startsWith("--fail=")) addNames(arg.slice("--fail=".length));
    else rest.push(arg);
  }
  return { stub, fail, rest };
}

export function statusOf(step, options) {
  if (options.fail.has(step.name)) return 1;
  if (options.stub) return 0;
  return step.run();
}
