import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const name = "terms";
export const version = 1;
export const seed = "keel-s01-terms-1";
export const trees = ["fixtures/synthetic/terms"];

const BANNED = /(?:^|[^A-Za-z])(should|buy|sell|hold)(?![A-Za-z])/i;
const MONTH_DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const WEEKDAY_TABLE = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
const CUSIP_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function assertSafeFixtureValues(entries) {
  for (const entry of entries) {
    if (entry.allowUnsafeMagnitude) continue;
    const token = String(entry.value);
    const integerPart = token.split(".")[0].replace(/^-/, "");
    if (/^\d+$/.test(integerPart) && integerPart.length >= 9) {
      throw new Error(`fixture value ${entry.label} has ${integerPart.length} integer digits`);
    }
  }
}

function cusipCheckDigit(body) {
  const chars = String(body).toUpperCase();
  if (chars.length !== 8) return null;
  let sum = 0;
  for (let i = 0; i < 8; i += 1) {
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

function assertNoUnexpectedCusip(texts, allowed) {
  const allow = new Set(allowed.map((value) => value.toUpperCase()));
  for (const text of texts) {
    const tokens = text.match(/[A-Za-z0-9]+/g) ?? [];
    for (const token of tokens) {
      if (isCusip(token) && !allow.has(token.toUpperCase())) {
        throw new Error("unexpected cusip-class token in generated fixture");
      }
      if (isIsinWithCusip(token)) throw new Error("unexpected isin embedding a cusip-class token");
    }
  }
}

function hashSeed(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seedValue) {
  let state = seedValue >>> 0;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function pickInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year, month) {
  if (month === 2 && isLeapYear(year)) return 29;
  return MONTH_DAYS[month];
}

function parseIso(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

function formatIso(year, month, day) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addDays(iso, days) {
  let { year, month, day } = parseIso(iso);
  let left = days;
  if (left >= 0) {
    while (left > 0) {
      const room = daysInMonth(year, month) - day;
      if (left <= room) {
        day += left;
        left = 0;
      } else {
        left -= room + 1;
        day = 1;
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
      }
    }
  } else {
    while (left < 0) {
      if (day - 1 >= -left) {
        day += left;
        left = 0;
      } else {
        left += day;
        month -= 1;
        if (month < 1) {
          month = 12;
          year -= 1;
        }
        day = daysInMonth(year, month);
      }
    }
  }
  return formatIso(year, month, day);
}

function dayOfWeek(year, month, day) {
  const shifted = month < 3 ? year - 1 : year;
  const table = WEEKDAY_TABLE[month - 1];
  return (shifted + Math.floor(shifted / 4) - Math.floor(shifted / 100) + Math.floor(shifted / 400) + table + day) % 7;
}

function isRealDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return false;
  const limit = daysInMonth(year, month);
  return day >= 1 && day <= limit;
}

function remember(bag, label, value, allowUnsafeMagnitude = false) {
  bag.push({ label, value: String(value), allowUnsafeMagnitude });
}

function scalar(text, mark = null) {
  return { kind: "scalar", text, mark };
}

function key(name, value, mark = null) {
  return { kind: "entry", name, value, mark };
}

function map(entries) {
  return { kind: "map", entries };
}

function seq(items) {
  return { kind: "seq", items };
}

function anchor(anchorName, value) {
  return { kind: "anchor", name: anchorName, value };
}

function alias(aliasName, mark = null) {
  return { kind: "alias", name: aliasName, mark };
}

function intScalar(bag, label, number, mark = null) {
  const text = String(number);
  remember(bag, label, text);
  return scalar(text, mark);
}

function decimalScalar(bag, label, text, mark = null) {
  remember(bag, label, text);
  return scalar(JSON.stringify(text), mark);
}

function rawScalar(bag, label, text, mark, allowUnsafeMagnitude = false) {
  remember(bag, label, text, allowUnsafeMagnitude);
  return scalar(text, mark);
}

function term(valueNode, status, source) {
  const entries = [key("value", valueNode), key("status", scalar(status))];
  if (source) entries.push(key("source", scalar(source)));
  return map(entries);
}

function textTerm(text, status, source) {
  return term(scalar(JSON.stringify(text)), status, source);
}

function dateTerm(iso, status, source) {
  if (!isRealDate(iso)) throw new Error("generated date is not real");
  return term(scalar(iso), status, source);
}

function sourcedInt(bag, label, number, status, source) {
  return term(intScalar(bag, label, number), status, source);
}

function member(ticker, initial) {
  return map([key("ticker", scalar(ticker)), key("initial", initial)]);
}

function sourceEntry(id, kind, file) {
  return key(id, map([key("kind", scalar(kind)), key("file", scalar(file))]));
}

function findEntry(node, entryName) {
  const found = node.entries.find((entry) => entry.name === entryName);
  if (!found) throw new Error(`missing entry ${entryName}`);
  return found;
}

function childMap(entry) {
  if (entry.value.kind === "map") return entry.value;
  if (entry.value.kind === "anchor") return entry.value.value;
  throw new Error(`entry ${entry.name} is not a map`);
}

function descend(node, names) {
  let current = node;
  for (const entryName of names) current = childMap(findEntry(current, entryName));
  return current;
}

function setValueToken(termNode, text, mark = null) {
  findEntry(termNode, "value").value = scalar(text, mark);
}

class Writer {
  constructor() {
    this.parts = [];
    this.len = 0;
    this.marks = {};
  }

  add(text, mark = null) {
    if (mark) {
      if (this.marks[mark] !== undefined) throw new Error(`duplicate mark ${mark}`);
      this.marks[mark] = this.len;
    }
    this.parts.push(text);
    this.len += text.length;
  }

  text() {
    return this.parts.join("");
  }
}

function renderInline(node, writer) {
  if (node.kind === "alias") {
    writer.add("*", node.mark);
    writer.add(node.name);
    return;
  }
  writer.add(node.text, node.mark);
}

function renderValue(value, indent, writer) {
  if (value.kind === "scalar" || value.kind === "alias") {
    writer.add(" ");
    renderInline(value, writer);
    writer.add("\n");
    return;
  }
  if (value.kind === "anchor") {
    writer.add(" &");
    writer.add(value.name);
    writer.add("\n");
    renderMap(value.value, indent + 2, writer);
    return;
  }
  if (value.kind === "map") {
    writer.add("\n");
    renderMap(value, indent + 2, writer);
    return;
  }
  if (value.kind === "seq") {
    writer.add("\n");
    for (const item of value.items) {
      if (item.kind !== "map") throw new Error("sequence item is not a map");
      renderMap(item, indent + 4, writer, true);
    }
    return;
  }
  throw new Error(`unknown node ${value.kind}`);
}

function renderMap(node, indent, writer, dash = false) {
  node.entries.forEach((entry, index) => {
    if (dash && index === 0) {
      writer.add(`${" ".repeat(Math.max(indent - 2, 0))}- `);
    } else {
      writer.add(" ".repeat(indent));
    }
    writer.add(entry.name, entry.mark);
    writer.add(":");
    renderValue(entry.value, indent, writer);
  });
}

function lineColumn(text, index) {
  let line = 1;
  let column = 1;
  const end = Math.min(index, text.length);
  for (let i = 0; i < end; i += 1) {
    if (text[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

function renderTree(tree) {
  const writer = new Writer();
  renderMap(tree, 0, writer);
  if (writer.marks.error !== undefined) throw new Error("unmarked tree carries an error mark");
  return writer.text();
}

function renderInvalid(tree, mutation) {
  const writer = new Writer();
  renderMap(tree, 0, writer);
  let text = writer.text();
  let index = writer.marks.error;
  if (mutation.prefix) {
    text = mutation.prefix + text;
    if (typeof index === "number") index += mutation.prefix.length;
  }
  if (mutation.markStart) index = 0;
  if (typeof index !== "number") throw new Error(`missing mark for ${mutation.file}`);
  const pos = lineColumn(text, index);
  return { text, line: pos.line, column: pos.column };
}

function buildMinimal(bag) {
  return map([
    key("schema", scalar("mln-terms/0.1")),
    key("id", scalar("note-min")),
    key("category", scalar("mln")),
    key("structure", scalar("autocall-snowball-worst-of")),
    key("issuer", textTerm("Example Bank SA", "primary", "supplement")),
    key(
      "dates",
      map([
        key("trade", dateTerm("2026-03-02", "primary", "supplement")),
        key("settlement", dateTerm("2026-03-04", "primary", "supplement")),
        key("maturity", dateTerm("2031-03-03", "primary", "supplement")),
        key("first_call_observation", dateTerm("2026-09-01", "primary", "supplement")),
      ]),
    ),
    key(
      "underlyings",
      map([
        key("basket", scalar("worst_of")),
        key(
          "members",
          seq([
            member("ALFA", term(decimalScalar(bag, "alfa", "100.25"), "primary", "supplement")),
            member("BRVO", term(decimalScalar(bag, "brvo", "80.5"), "primary", "supplement")),
            member("CHRL", term(decimalScalar(bag, "chrl", "120"), "primary", "supplement")),
            member("DLTA", term(decimalScalar(bag, "dlta", "95.125"), "primary", "supplement")),
          ]),
        ),
        key("performance_rounding", textTerm("half-up-4dp", "primary", "supplement")),
      ]),
    ),
    key(
      "call",
      map([
        key("level", sourcedInt(bag, "call-level", 9500, "primary", "supplement")),
        key("non_call_months", sourcedInt(bag, "non-call", 6, "primary", "supplement")),
        key("frequency", textTerm("quarterly", "primary", "supplement")),
      ]),
    ),
    key(
      "premium",
      map([
        key("rate_per_year", sourcedInt(bag, "rate", 850, "primary", "supplement")),
        key("accrual", textTerm("simple", "primary", "supplement")),
      ]),
    ),
    key(
      "barrier",
      map([
        key("level", sourcedInt(bag, "barrier", 6000, "primary", "supplement")),
        key("observation", textTerm("final", "primary", "supplement")),
        key("below_barrier", textTerm("one-for-one-worst", "primary", "supplement")),
      ]),
    ),
    key("economics", map([key("issue_price", sourcedInt(bag, "issue", 10000, "primary", "supplement"))])),
    key("sources", map([sourceEntry("supplement", "primary", "sources/supplement.pdf")])),
  ]);
}

function makeCusip(rng) {
  let body = "ZZZ";
  for (let i = 0; i < 5; i += 1) body += CUSIP_ALPHABET[Math.floor(rng() * CUSIP_ALPHABET.length)];
  const digit = cusipCheckDigit(body);
  if (digit === null) throw new Error("cusip body rejected");
  return `${body}${digit}`;
}

function makeIsin(rng) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    let middle = "";
    for (let i = 0; i < 9; i += 1) middle += CUSIP_ALPHABET[Math.floor(rng() * CUSIP_ALPHABET.length)];
    if (isCusip(middle)) continue;
    return `XS${middle}${pickInt(rng, 0, 9)}`;
  }
  throw new Error("isin rejected");
}

function makeId(rng) {
  let id = "note-";
  for (let i = 0; i < 6; i += 1) id += ID_ALPHABET[Math.floor(rng() * ID_ALPHABET.length)];
  return id;
}

function exampleDecimal(bag, label, rng) {
  const whole = pickInt(rng, 10, 999);
  const places = pickInt(rng, 1, 4);
  let fraction = "";
  for (let i = 0; i < places; i += 1) fraction += String(pickInt(rng, 0, 9));
  return decimalScalar(bag, label, `${whole}.${fraction}`);
}

function buildExample(bag, rng) {
  const cusip = makeCusip(rng);
  const isin = makeIsin(rng);
  const trade = addDays("2026-01-03", pickInt(rng, 0, 52) * 7);
  const parsed = parseIso(trade);
  if (dayOfWeek(parsed.year, parsed.month, parsed.day) !== 6) throw new Error("trade date is not a Saturday");
  const settlement = addDays(trade, pickInt(rng, 2, 5));
  const firstCall = addDays(trade, pickInt(rng, 120, 240));
  const maturityDocument = addDays(trade, pickInt(rng, 1500, 2200));
  const maturityAdvisor = addDays(maturityDocument, pickInt(rng, 1, 14));
  const rule = "Named barrier fraction.";
  const note = "Recorded accrual default.";
  if (BANNED.test(rule) || BANNED.test(note)) throw new Error("example prose is not product text");
  const tree = map([
    key("schema", scalar("mln-terms/0.1")),
    key("id", scalar(makeId(rng))),
    key("category", scalar("mln")),
    key("structure", scalar("autocall-snowball-worst-of")),
    key(
      "identifiers",
      map([
        key("cusip", term(scalar(cusip), "primary", "supplement")),
        key("isin", term(scalar(isin), "primary", "supplement")),
      ]),
    ),
    key("issuer", textTerm("Example Bank SA", "primary", "supplement")),
    key(
      "dates",
      map([
        key("trade", dateTerm(trade, "primary", "supplement")),
        key("settlement", dateTerm(settlement, "primary", "supplement")),
        key(
          "maturity",
          map([
            key("status", scalar("conflict")),
            key(
              "candidates",
              seq([
                dateTerm(maturityDocument, "document", "confirm-a"),
                dateTerm(maturityAdvisor, "advisor", "email-b"),
              ]),
            ),
          ]),
        ),
        key("first_call_observation", dateTerm(firstCall, "primary", "supplement")),
      ]),
    ),
    key(
      "underlyings",
      map([
        key("basket", scalar("worst_of")),
        key(
          "members",
          seq([
            member("ALFA", term(exampleDecimal(bag, "ex-alfa", rng), "primary", "supplement")),
            member("BRVO", term(exampleDecimal(bag, "ex-brvo", rng), "primary", "supplement")),
            member("CHRL", term(exampleDecimal(bag, "ex-chrl", rng), "document", "confirm-a")),
            member("DLTA", term(exampleDecimal(bag, "ex-dlta", rng), "advisor", "email-b")),
          ]),
        ),
        key(
          "performance_rounding",
          map([key("value", scalar("null")), key("status", scalar("unknown"))]),
        ),
      ]),
    ),
    key(
      "call",
      map([
        key("level", sourcedInt(bag, "ex-call", pickInt(rng, 1, 20000), "advisor", "email-b")),
        key("non_call_months", sourcedInt(bag, "ex-months", pickInt(rng, 0, 120), "primary", "supplement")),
        key("frequency", textTerm("quarterly", "primary", "supplement")),
      ]),
    ),
    key(
      "premium",
      map([
        key("rate_per_year", term(intScalar(bag, "ex-rate", pickInt(rng, 0, 10000)), "user")),
        key(
          "accrual",
          map([
            key("value", scalar("compound")),
            key("status", scalar("assumed")),
            key("note", scalar(JSON.stringify(note))),
          ]),
        ),
      ]),
    ),
    key(
      "barrier",
      map([
        key(
          "level",
          map([
            key("value", intScalar(bag, "ex-barrier", pickInt(rng, 1, 10000))),
            key("status", scalar("estimate")),
            key("rule", scalar(JSON.stringify(rule))),
          ]),
        ),
        key("observation", textTerm("final", "primary", "supplement")),
        key("below_barrier", textTerm("one-for-one-worst", "primary", "supplement")),
      ]),
    ),
    key(
      "economics",
      map([
        key("issue_price", sourcedInt(bag, "ex-issue", pickInt(rng, 10000, 9999999), "primary", "supplement")),
        key("estimated_value", sourcedInt(bag, "ex-estimate", pickInt(rng, 1, 999999), "primary", "supplement")),
        key("fees", sourcedInt(bag, "ex-fees", pickInt(rng, 0, 99999), "primary", "supplement")),
      ]),
    ),
    key(
      "sources",
      map([
        sourceEntry("supplement", "primary", "sources/supplement.pdf"),
        sourceEntry("confirm-a", "document", "sources/confirm-a.pdf"),
        sourceEntry("email-b", "advisor", "sources/email-b.txt"),
      ]),
    ),
  ]);
  return { tree, cusips: [cusip] };
}

function mutations() {
  return [
    { file: "schema-line.yaml", code: "schema-line", path: "schema", prefix: "# synthetic\n", markStart: true, apply() {} },
    {
      file: "duplicate-key.yaml",
      code: "duplicate-key",
      path: "call.level",
      apply(tree) {
        const call = descend(tree, ["call"]);
        const level = findEntry(call, "level");
        const copy = structuredClone(level);
        copy.mark = "error";
        call.entries.splice(call.entries.indexOf(level) + 1, 0, copy);
      },
    },
    {
      file: "alias.yaml",
      code: "alias",
      path: "barrier.level",
      apply(tree) {
        const rate = findEntry(descend(tree, ["premium"]), "rate_per_year");
        rate.value = anchor("rate", rate.value);
        findEntry(descend(tree, ["barrier"]), "level").value = alias("rate", "error");
      },
    },
    {
      file: "unknown-key-nested.yaml",
      code: "unknown-key",
      path: "call.levle",
      apply(tree, bag) {
        remember(bag, "levle", "1");
        descend(tree, ["call"]).entries.push(key("levle", scalar("1"), "error"));
      },
    },
    {
      file: "unknown-key-top.yaml",
      code: "unknown-key",
      path: "extra",
      apply(tree, bag) {
        remember(bag, "extra", "1");
        tree.entries.push(key("extra", scalar("1"), "error"));
      },
    },
    {
      file: "missing-required-top.yaml",
      code: "missing-required",
      path: "issuer",
      markStart: true,
      apply(tree) {
        tree.entries = tree.entries.filter((entry) => entry.name !== "issuer");
      },
    },
    {
      file: "missing-required-nested.yaml",
      code: "missing-required",
      path: "call.frequency",
      apply(tree) {
        const call = findEntry(tree, "call");
        call.mark = "error";
        childMap(call).entries = childMap(call).entries.filter((entry) => entry.name !== "frequency");
      },
    },
    {
      file: "wrong-type-float.yaml",
      code: "wrong-type",
      path: "call.level.value",
      apply(tree, bag) {
        markValue(tree, ["call", "level"], rawScalar(bag, "float", "9500.0", "error"));
      },
    },
    {
      file: "wrong-type-exponent.yaml",
      code: "wrong-type",
      path: "call.level.value",
      apply(tree, bag) {
        markValue(tree, ["call", "level"], rawScalar(bag, "exponent", "1e3", "error"));
      },
    },
    {
      file: "wrong-type-hex.yaml",
      code: "wrong-type",
      path: "call.level.value",
      apply(tree, bag) {
        markValue(tree, ["call", "level"], rawScalar(bag, "hex", "0x10", "error"));
      },
    },
    {
      file: "wrong-type-octal.yaml",
      code: "wrong-type",
      path: "call.level.value",
      apply(tree, bag) {
        markValue(tree, ["call", "level"], rawScalar(bag, "octal", "0o17", "error"));
      },
    },
    {
      file: "wrong-type-plus.yaml",
      code: "wrong-type",
      path: "call.level.value",
      apply(tree, bag) {
        markValue(tree, ["call", "level"], rawScalar(bag, "plus", "+9500", "error"));
      },
    },
    {
      file: "out-of-range-magnitude.yaml",
      code: "out-of-range",
      path: "economics.issue_price.value",
      apply(tree, bag) {
        markValue(tree, ["economics", "issue_price"], rawScalar(bag, "magnitude", "99999999999999999", "error", true));
      },
    },
    {
      file: "out-of-range-level.yaml",
      code: "out-of-range",
      path: "call.level.value",
      apply(tree, bag) {
        markValue(tree, ["call", "level"], rawScalar(bag, "level-max", "20001", "error"));
      },
    },
    {
      file: "invalid-date.yaml",
      code: "invalid-date",
      path: "dates.maturity.value",
      apply(tree) {
        setValueToken(descend(tree, ["dates", "maturity"]), "2027-02-30", "error");
      },
    },
    {
      file: "unknown-status.yaml",
      code: "unknown-status",
      path: "issuer.status",
      apply(tree) {
        findEntry(descend(tree, ["issuer"]), "status").value = scalar("guessed", "error");
      },
    },
    {
      file: "status-fields-unknown.yaml",
      code: "status-fields",
      path: "underlyings.performance_rounding.value",
      apply(tree) {
        const rounding = descend(tree, ["underlyings", "performance_rounding"]);
        findEntry(rounding, "status").value = scalar("unknown");
        rounding.entries = rounding.entries.filter((entry) => entry.name !== "source");
        findEntry(rounding, "value").value = scalar("half-up-4dp", "error");
      },
    },
    {
      file: "status-fields-estimate.yaml",
      code: "status-fields",
      path: "barrier.level.rule",
      apply(tree) {
        const level = findEntry(descend(tree, ["barrier"]), "level");
        level.mark = "error";
        const body = childMap(level);
        findEntry(body, "status").value = scalar("estimate");
        body.entries = body.entries.filter((entry) => entry.name !== "source");
      },
    },
    {
      file: "conflict-candidates.yaml",
      code: "conflict-candidates",
      path: "dates.maturity.candidates",
      apply(tree) {
        findEntry(descend(tree, ["dates"]), "maturity").value = map([
          key("status", scalar("conflict")),
          key("candidates", seq([dateTerm("2031-03-03", "primary", "supplement")]), "error"),
        ]);
      },
    },
    {
      file: "source-missing.yaml",
      code: "source-missing",
      path: "issuer.source",
      apply(tree) {
        findEntry(descend(tree, ["issuer"]), "source").value = scalar("missing-src", "error");
      },
    },
    {
      file: "source-kind.yaml",
      code: "source-kind",
      path: "issuer.source",
      apply(tree) {
        findEntry(descend(tree, ["issuer"]), "source").value = scalar("advisor-note", "error");
        descend(tree, ["sources"]).entries.push(
          key("advisor-note", map([key("kind", scalar("advisor")), key("file", scalar("sources/advisor-note.txt"))])),
        );
      },
    },
    {
      file: "source-path-dotdot.yaml",
      code: "source-path",
      path: "sources.supplement.file",
      apply(tree) {
        setQuotedFile(tree, "..");
      },
    },
    {
      file: "source-path-slash.yaml",
      code: "source-path",
      path: "sources.supplement.file",
      apply(tree) {
        setQuotedFile(tree, "/tmp/x");
      },
    },
    {
      file: "source-path-drive.yaml",
      code: "source-path",
      path: "sources.supplement.file",
      apply(tree) {
        setQuotedFile(tree, "C:/x");
      },
    },
    {
      file: "source-path-unc.yaml",
      code: "source-path",
      path: "sources.supplement.file",
      apply(tree) {
        setQuotedFile(tree, "//server/share");
      },
    },
    {
      file: "source-path-backslash.yaml",
      code: "source-path",
      path: "sources.supplement.file",
      apply(tree) {
        setQuotedFile(tree, "foo\\bar");
      },
    },
    {
      file: "schedule-order.yaml",
      code: "schedule-order",
      path: "dates.observation_schedule[1].value",
      apply(tree) {
        descend(tree, ["dates"]).entries.push(
          key(
            "observation_schedule",
            seq([
              dateTerm("2030-01-02", "primary", "supplement"),
              term(scalar("2030-01-02", "error"), "primary", "supplement"),
            ]),
          ),
        );
      },
    },
  ];
}

function markValue(tree, names, valueNode) {
  findEntry(descend(tree, names), "value").value = valueNode;
}

function setQuotedFile(tree, value) {
  findEntry(descend(tree, ["sources", "supplement"]), "file").value = scalar(JSON.stringify(value), "error");
}

function build() {
  const bag = [];
  const minimal = buildMinimal(bag);
  const example = buildExample(bag, mulberry32(hashSeed(seed)));
  const invalid = mutations().map((mutation) => {
    const tree = structuredClone(minimal);
    mutation.apply(tree, bag);
    const rendered = renderInvalid(tree, mutation);
    return {
      rel: `invalid/${mutation.file}`,
      file: mutation.file,
      code: mutation.code,
      path: mutation.path,
      line: rendered.line,
      column: rendered.column,
      text: rendered.text,
    };
  });
  const files = [
    { rel: "valid/example-autocall.yaml", text: renderTree(example.tree) },
    { rel: "valid/minimal.yaml", text: renderTree(minimal) },
    ...invalid.map((item) => ({ rel: item.rel, text: item.text })),
  ];
  const manifest = {
    name,
    version,
    seed,
    valid: ["example-autocall.yaml", "minimal.yaml"],
    invalid: invalid.map((item) => ({
      file: item.file,
      code: item.code,
      path: item.path,
      line: item.line,
      column: item.column,
    })),
  };
  files.push({ rel: "manifest.json", text: `${JSON.stringify(manifest, null, 2)}\n` });
  return { bag, files, cusips: example.cusips, manifest };
}

function assertProductText(files) {
  for (const file of files) {
    const lines = file.text.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      if (BANNED.test(lines[i])) throw new Error(`product text in ${file.rel} line ${i + 1}`);
    }
    const first = lines[0];
    if (file.rel.endsWith("schema-line.yaml")) {
      if (first !== "# synthetic") throw new Error("schema-line fixture drifted");
    } else if (file.rel.endsWith(".yaml") && first !== "schema: mln-terms/0.1") {
      throw new Error(`schema marker drifted in ${file.rel}`);
    }
  }
}

export function regen(root) {
  const built = build();
  assertSafeFixtureValues(built.bag);
  assertNoUnexpectedCusip(
    built.files.map((file) => file.text),
    built.cusips,
  );
  assertProductText(built.files);
  if (built.cusips.length !== 1) throw new Error(`expected one synthetic cusip, found ${built.cusips.length}`);
  const tree = join(root, trees[0]);
  rmSync(tree, { recursive: true, force: true });
  for (const file of built.files) {
    const dest = join(root, trees[0], file.rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, file.text);
  }
  const allowlist = built.cusips
    .map((value) => `fixtures/synthetic/terms/**\t${value}\tsynthetic fixture`)
    .join("\n");
  writeFileSync(join(root, "tools/tripwire/allowlist.txt"), `${allowlist}\n`);
}
