import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const ALLOWLIST_REL = "tools/tripwire/allowlist.txt";

const PRICE_KEYS = new Set(["open", "high", "low", "close", "adj close", "price"]);

export function cusipCheckDigit(body) {
  const chars = String(body).toUpperCase();
  if (chars.length !== 8) return null;
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    const char = chars[i];
    let value;
    if (char >= "0" && char <= "9") value = char.charCodeAt(0) - 48;
    else if (char >= "A" && char <= "Z") value = char.charCodeAt(0) - 55;
    else return null;
    if (i % 2 === 1) value *= 2;
    sum += Math.floor(value / 10) + (value % 10);
  }
  return (10 - (sum % 10)) % 10;
}

function isCusip(token) {
  if (token.length !== 9) return false;
  const upper = token.toUpperCase();
  const digit = cusipCheckDigit(upper.slice(0, 8));
  if (digit === null) return false;
  return upper[8] === String(digit);
}

function isIsinWithCusip(token) {
  if (!/^[A-Za-z]{2}[A-Za-z0-9]{9}[0-9]$/.test(token)) return false;
  return isCusip(token.slice(2, 11));
}

function lineAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === "\n") line += 1;
  }
  return line;
}

function tokens(text) {
  const found = [];
  let i = 0;
  while (i < text.length) {
    if (!/[A-Za-z0-9]/.test(text[i])) {
      i += 1;
      continue;
    }
    const start = i;
    while (i < text.length && /[A-Za-z0-9]/.test(text[i])) i += 1;
    found.push({ token: text.slice(start, i), index: start });
  }
  return found;
}

function findCusips(text) {
  const hits = [];
  for (const item of tokens(text)) {
    if (item.token.length === 9 && isCusip(item.token)) hits.push(item.index);
    if (item.token.length === 12 && isIsinWithCusip(item.token)) hits.push(item.index);
  }
  return hits;
}

function accountKeywordPattern() {
  const account = ["acc", "ount"].join("");
  const acct = ["ac", "ct"].join("");
  const slash = ["a", "/", "c"].join("");
  return new RegExp(`(?:^|[^A-Za-z])(${account}|${acct}|${slash})(?![A-Za-z])`, "gi");
}

function findAccounts(text) {
  const hits = [];
  for (const match of text.matchAll(/(?:^|[^A-Za-z0-9])([A-Za-z]{3}-\d{6})(?!\d)/g)) {
    hits.push(match.index + match[0].length - match[1].length);
  }
  for (const match of text.matchAll(accountKeywordPattern())) {
    const keywordEnd = match.index + match[0].length;
    const windowEnd = keywordEnd + 40;
    let i = keywordEnd;
    while (i < windowEnd && i < text.length) {
      if (!/[A-Za-z0-9]/.test(text[i])) {
        i += 1;
        continue;
      }
      if (i > keywordEnd && /[A-Za-z0-9]/.test(text[i - 1])) {
        while (i < text.length && /[A-Za-z0-9]/.test(text[i])) i += 1;
        continue;
      }
      const start = i;
      while (i < text.length && /[A-Za-z0-9]/.test(text[i])) i += 1;
      const token = text.slice(start, i);
      const digits = token.replace(/\D/g, "").length;
      if (start < windowEnd && token.length >= 6 && token.length <= 12 && digits >= 4) {
        hits.push(start);
      }
    }
    const lineEnd = text.indexOf("\n", keywordEnd);
    const restEnd = lineEnd === -1 ? text.length : lineEnd;
    const rest = text.slice(keywordEnd, restEnd);
    for (const mask of rest.matchAll(/[*xX]{3,}\d{3,4}(?!\d)/g)) {
      hits.push(keywordEnd + mask.index);
    }
  }
  return hits;
}

function findSsns(text) {
  const hits = [];
  const patterns = [/(?:^|\D)(\d{3}-\d{2}-\d{4})(?!\d)/g, /(?:^|\D)(\d{3} \d{2} \d{4})(?!\d)/g];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      hits.push(match.index + match[0].length - match[1].length);
    }
  }
  return hits;
}

function addressPattern() {
  const direction =
    "N|S|E|W|NE|NW|SE|SW|North|South|East|West|Northeast|Northwest|Southeast|Southwest";
  const word = "[A-Z][A-Za-z]*";
  const street =
    "Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Place|Pl|Lane|Ln|Drive|Dr|Court|Ct|Parkway|Pkwy|Terrace|Way";
  return new RegExp(
    `(?:^|[^0-9A-Za-z])(\\d+)\\s+(?:(?:${direction})\\s+)?(?:${word}\\s+){1,3}(?:${street})\\b(?:\\s+(?:Apt|Unit|Suite|#)\\s*\\d+[A-Za-z]?)?`,
    "g",
  );
}

function findAddresses(text) {
  const hits = [];
  for (const match of text.matchAll(addressPattern())) {
    hits.push(match.index + match[0].length - match[0].trimStart().length);
  }
  return hits;
}

function findEmails(text) {
  const hits = [];
  for (const match of text.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) {
    const email = match[0];
    const before = match.index > 0 ? text[match.index - 1] : "";
    const afterIndex = match.index + email.length;
    const after = afterIndex < text.length ? text[afterIndex] : "";
    if (before && /[A-Za-z0-9._%+-]/.test(before)) continue;
    if (after && /[A-Za-z0-9.-]/.test(after)) continue;
    const local = email.slice(0, email.indexOf("@"));
    if (local.toLowerCase() === "noreply") continue;
    hits.push(match.index);
  }
  return hits;
}

function textHits(text, where) {
  const hits = [];
  const add = (klass, indexes) => {
    for (const index of indexes) hits.push({ class: klass, where, line: lineAt(text, index), index });
  };
  add("cusip", findCusips(text));
  add("account", findAccounts(text));
  add("ssn", findSsns(text));
  add("address", findAddresses(text));
  add("email", findEmails(text));
  return hits;
}

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function unscannable(buf) {
  if (buf.includes(0)) return true;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(buf);
    return false;
  } catch {
    return true;
  }
}

function decode(buf) {
  return normalizeNewlines(new TextDecoder("utf-8", { fatal: true }).decode(buf));
}

export function isLocalOnly(rel) {
  const norm = rel.split("\\").join("/");
  if (norm === "design" || norm.startsWith("design/")) return true;
  if (norm === "terms" || norm.startsWith("terms/")) return true;
  if (norm.split("/").includes(".keel-data")) return true;
  if (norm.endsWith(".sqlite")) return true;
  if (norm.endsWith(".pdf")) return true;
  return false;
}

function globAllowed(glob) {
  if (glob.includes("\\") || glob.startsWith("/") || /^[A-Za-z]:/.test(glob)) return false;
  const parts = glob.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) return false;
  if (parts[0] !== "fixtures" || parts.length < 2) return false;
  return true;
}

function globToRegExp(glob) {
  let out = "^";
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i];
    if (char === "*" && glob[i + 1] === "*") {
      if (glob[i + 2] === "/") {
        out += "(?:.*/)?";
        i += 2;
      } else {
        out += ".*";
        i += 1;
      }
    } else if (char === "*") out += "[^/]*";
    else if (char === "?") out += "[^/]";
    else if ("\\.^$+()[]{}|".includes(char)) out += `\\${char}`;
    else out += char;
  }
  return new RegExp(`${out}$`);
}

function parseAllowlist(text) {
  const lines = text.split("\n");
  let offset = 0;
  const entries = [];
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNo = i + 1;
    if (raw.length === 0) {
      offset += raw.length + 1;
      continue;
    }
    const parts = raw.split("\t");
    const valid = parts.length === 3 && parts.every((part) => part.length > 0) && globAllowed(parts[0]);
    if (!valid) hits.push({ class: "allowlist", where: ALLOWLIST_REL, line: lineNo, index: offset });
    else {
      const valueStart = offset + parts[0].length + 1;
      entries.push({
        glob: parts[0],
        value: parts[1],
        valueStart,
        valueEnd: valueStart + parts[1].length,
        globRe: globToRegExp(parts[0]),
      });
    }
    offset += raw.length + 1;
  }
  return { entries, hits };
}

function blankSpans(text, entries) {
  const chars = text.split("");
  for (const entry of entries) {
    for (let i = entry.valueStart; i < entry.valueEnd && i < chars.length; i++) chars[i] = " ";
  }
  return chars.join("");
}

function blankValues(text, values) {
  let out = text;
  for (const value of values) out = out.split(value).join(" ".repeat(value.length));
  return out;
}

function headerHits(line, delimiter) {
  const cells = line.split(delimiter).map((cell) => cell.trim().replace(/^"(.*)"$/, "$1").toLowerCase());
  return cells.some((cell) => PRICE_KEYS.has(cell));
}

function priceHit(rel, text) {
  const lower = rel.toLowerCase();
  const first = text.split("\n")[0] ?? "";
  if (lower.endsWith(".csv") || lower.endsWith(".tsv")) {
    if (first.trim() === "# synthetic: true") return false;
    return headerHits(first, lower.endsWith(".tsv") ? "\t" : ",");
  }
  if (!lower.endsWith(".json")) return false;
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return false;
  }
  const arrayHasKey = (arr) => {
    for (const item of arr) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      for (const key of Object.keys(item)) {
        if (PRICE_KEYS.has(key.toLowerCase())) return true;
      }
    }
    return false;
  };
  if (Array.isArray(data)) return arrayHasKey(data);
  if (!data || typeof data !== "object") return false;
  if (data.synthetic === true) return false;
  for (const value of Object.values(data)) {
    if (Array.isArray(value) && arrayHasKey(value)) return true;
  }
  return false;
}

function git(root, args) {
  return spawnSync("git", args, { cwd: root, encoding: "buffer" });
}

function dedupe(hits) {
  const seen = new Set();
  const out = [];
  for (const hit of hits) {
    const key = `${hit.class}\t${hit.where}\t${hit.line}\t${hit.index}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(hit);
  }
  out.sort((a, b) => a.where.localeCompare(b.where) || a.line - b.line || a.class.localeCompare(b.class));
  return out;
}

export function scanRepo(root) {
  const origin = git(root, ["rev-parse", "--verify", "--quiet", "refs/remotes/origin/main"]);
  if (origin.status !== 0) return { error: "origin/main unavailable", hits: [] };

  const listed = git(root, ["ls-files", "-z"]);
  if (listed.status !== 0) return { error: "git ls-files failed", hits: [] };
  const files = listed.stdout.toString("utf8").split("\0").filter(Boolean);
  if (!files.includes(ALLOWLIST_REL)) return { error: "allowlist missing", hits: [] };

  let allowBuf;
  try {
    allowBuf = readFileSync(join(root, ALLOWLIST_REL));
  } catch {
    return { error: "allowlist unreadable", hits: [] };
  }
  if (unscannable(allowBuf)) return { error: "allowlist unscannable", hits: [] };
  const allowText = decode(allowBuf);
  const allow = parseAllowlist(allowText);
  const hits = [...allow.hits];

  const range = git(root, ["rev-list", "refs/remotes/origin/main..HEAD"]);
  if (range.status !== 0) return { error: "commit range failed", hits: [] };
  const shas = range.stdout.toString("utf8").split("\n").filter(Boolean);
  for (const sha of shas) {
    const shown = git(root, ["show", "-s", "--format=%B", sha]);
    if (shown.status !== 0) return { error: "commit message unreadable", hits: [] };
    if (unscannable(shown.stdout)) return { error: "commit message unscannable", hits: [] };
    hits.push(...textHits(decode(shown.stdout), `commit ${sha}`));
  }

  for (const rel of files) {
    if (isLocalOnly(rel)) hits.push({ class: "local-only", where: rel, line: 1, index: 0 });
    let buf;
    try {
      buf = readFileSync(join(root, rel));
    } catch {
      return { error: "unreadable file", hits: [] };
    }
    if (unscannable(buf)) {
      hits.push({ class: "unscannable", where: rel, line: 1, index: 0 });
      continue;
    }
    const text = decode(buf);
    if (priceHit(rel, text)) hits.push({ class: "price", where: rel, line: 1, index: 0 });
    if (rel === ALLOWLIST_REL) {
      const cusipOnly = textHits(blankSpans(text, allow.entries), rel).filter((hit) => hit.class === "cusip");
      const rest = textHits(text, rel).filter((hit) => hit.class !== "cusip");
      hits.push(...cusipOnly, ...rest);
      continue;
    }
    const values = allow.entries.filter((entry) => entry.globRe.test(rel)).map((entry) => entry.value);
    hits.push(...textHits(values.length === 0 ? text : blankValues(text, values), rel));
  }

  return { error: null, hits: dedupe(hits) };
}
