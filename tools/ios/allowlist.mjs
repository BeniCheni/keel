import { readFileSync } from "node:fs";
import { join } from "node:path";

export function parseAllowlist(text) {
  const modules = [];
  const frameworks = [];
  const selectors = [];
  const symbols = [];
  const undefinedSymbols = [];
  const reasons = new Map();
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length === 0 || line.startsWith("#")) continue;
    const parts = line.split("\t");
    if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
      throw new Error(`allowlist line ${i + 1}`);
    }
    const [kind, value] = parts;
    if (kind === "module") modules.push(value);
    else if (kind === "framework") frameworks.push(value);
    else if (kind === "selector") selectors.push(value);
    else if (kind === "symbol") symbols.push(value);
    else if (kind === "undefined") undefinedSymbols.push(value);
    else throw new Error(`allowlist line ${i + 1}`);
    const key = `${kind}\t${value}`;
    if (reasons.has(key)) throw new Error(`duplicate allowlist entry on line ${i + 1}`);
    reasons.set(key, parts[2]);
  }
  return { modules, frameworks, selectors, symbols, undefinedSymbols, reasons };
}

export function loadAllowlist(root, file = "tools/ios/allowlist.txt") {
  return parseAllowlist(readFileSync(join(root, file), "utf8"));
}
