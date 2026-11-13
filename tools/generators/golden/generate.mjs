import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadTerms, nyseRulesCalendar, observationSchedule, scheduleDateFlags } from "../../../packages/core/src/index.ts";
import { addDaysIso } from "../../../packages/plugin-mln/src/dates.ts";
import { evaluateNote, noteMetrics, payoutSchedule } from "../../../packages/plugin-mln/src/index.ts";
import {
  divFrac,
  formatDecimal,
  formatRatio,
  mulFrac,
  parseDecimal,
  parseRatio,
  parseRounding,
  roundRatio,
} from "../../../packages/plugin-mln/src/fraction.ts";
import { cusipCheckDigit, scanRepo } from "../../tripwire/scan.mjs";

export const name = "golden";
export const version = 1;
export const seed = "keel-s03-golden-1";
export const trees = ["fixtures/golden"];

const MEMBERS = [
  { ticker: "ALFA", initial: "100.25" },
  { ticker: "BRVO", initial: "80.5" },
  { ticker: "CHRL", initial: "120" },
  { ticker: "DLTA", initial: "95.125" },
];

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

function isCusip(token) {
  if (token.length !== 9) return false;
  const upper = token.toUpperCase();
  const digit = cusipCheckDigit(upper.slice(0, 8));
  if (digit === null) return false;
  return upper[8] === String(digit);
}

export function seededValueRejected(text) {
  const token = String(text);
  const integerPart = token.split(".")[0].replace(/^-/, "");
  if (/^\d+$/.test(integerPart) && integerPart.length >= 9) return "digits";
  const parts = token.match(/[A-Za-z0-9]+/g) ?? [];
  for (const part of parts) {
    if (part.length === 9 && isCusip(part)) return "cusip";
  }
  return null;
}

export function drawAllowed(caseId, produce) {
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const value = produce();
    if (seededValueRejected(value) === null) return value;
  }
  throw new Error(`${caseId}: seeded value rejected after 64 draws`);
}

export function assertScanClean(result) {
  if (result.error) throw new Error(`tripwire error: ${result.error}`);
  if (result.hits.length > 0) {
    const detail = result.hits.map((hit) => `${hit.where} ${hit.class}`).join(", ");
    throw new Error(`tripwire hit: ${detail}`);
  }
}

function git(cwd, args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "git failed");
}

export function scanTree(goldenDir, repoRoot) {
  const temp = mkdtempSync(join(tmpdir(), "keel-golden-scan-"));
  try {
    git(temp, ["init", "-b", "main"]);
    mkdirSync(join(temp, "fixtures"), { recursive: true });
    cpSync(goldenDir, join(temp, "fixtures/golden"), { recursive: true });
    mkdirSync(join(temp, "tools/tripwire"), { recursive: true });
    cpSync(join(repoRoot, "tools/tripwire/allowlist.txt"), join(temp, "tools/tripwire/allowlist.txt"));
    cpSync(join(repoRoot, "tools/tripwire/vendors.txt"), join(temp, "tools/tripwire/vendors.txt"));
    git(temp, ["add", "-A"]);
    git(temp, [
      "-c",
      "user.name=Cursor",
      "-c",
      "user.email=cursoragent@cursor.com",
      "-c",
      "commit.gpgsign=false",
      "commit",
      "-m",
      "Scan synthetic golden output.",
    ]);
    git(temp, ["update-ref", "refs/remotes/origin/main", "HEAD"]);
    assertScanClean(scanRepo(temp));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

function yamlValue(value) {
  if (typeof value === "number") return String(value);
  if (value === null) return "null";
  return JSON.stringify(value);
}

function emitTerm(term, indent) {
  const pad = " ".repeat(indent);
  if (term.status === "unknown") return `${pad}value: null\n${pad}status: unknown\n`;
  if (term.status === "conflict") {
    let out = `${pad}status: conflict\n${pad}candidates:\n`;
    for (const candidate of term.candidates) {
      out += `${pad}  - value: ${yamlValue(candidate.value)}\n`;
      out += `${pad}    status: ${candidate.status}\n`;
      if (candidate.source !== undefined) out += `${pad}    source: ${yamlValue(candidate.source)}\n`;
    }
    return out;
  }
  let out = `${pad}value: ${yamlValue(term.value)}\n${pad}status: ${term.status}\n`;
  if (term.source !== undefined) out += `${pad}source: ${yamlValue(term.source)}\n`;
  if (term.rule !== undefined) out += `${pad}rule: ${yamlValue(term.rule)}\n`;
  if (term.note !== undefined) out += `${pad}note: ${yamlValue(term.note)}\n`;
  return out;
}

function emitTerms(terms) {
  let out = `schema: ${terms.schema}\n`;
  out += `id: ${yamlValue(terms.id)}\n`;
  out += `category: ${terms.category}\n`;
  out += `structure: ${terms.structure}\n`;
  out += "issuer:\n";
  out += emitTerm(terms.issuer, 2);
  out += "dates:\n";
  for (const key of ["trade", "settlement", "maturity", "first_call_observation"]) {
    out += `  ${key}:\n`;
    out += emitTerm(terms.dates[key], 4);
  }
  if (terms.dates.final_valuation !== undefined) {
    out += "  final_valuation:\n";
    out += emitTerm(terms.dates.final_valuation, 4);
  }
  if (terms.dates.observation_schedule !== undefined) {
    out += "  observation_schedule:\n";
    for (const item of terms.dates.observation_schedule) {
      const body = emitTerm(item, 4).replace(/^ {4}/, "    ").trimEnd();
      const lines = body.split("\n");
      out += `  - ${lines[0].trim()}\n`;
      for (const line of lines.slice(1)) out += `${line}\n`;
    }
  }
  out += "underlyings:\n";
  out += `  basket: ${terms.underlyings.basket}\n`;
  out += "  members:\n";
  for (const member of terms.underlyings.members) {
    out += `  - ticker: ${yamlValue(member.ticker)}\n`;
    out += "    initial:\n";
    out += emitTerm(member.initial, 6);
  }
  out += "  performance_rounding:\n";
  out += emitTerm(terms.underlyings.performance_rounding, 4);
  out += "call:\n";
  out += "  level:\n";
  out += emitTerm(terms.call.level, 4);
  out += "  non_call_months:\n";
  out += emitTerm(terms.call.non_call_months, 4);
  out += "  frequency:\n";
  out += emitTerm(terms.call.frequency, 4);
  out += "premium:\n";
  out += "  rate_per_year:\n";
  out += emitTerm(terms.premium.rate_per_year, 4);
  out += "  accrual:\n";
  out += emitTerm(terms.premium.accrual, 4);
  out += "barrier:\n";
  out += "  level:\n";
  out += emitTerm(terms.barrier.level, 4);
  out += "  observation:\n";
  out += emitTerm(terms.barrier.observation, 4);
  out += "  below_barrier:\n";
  out += emitTerm(terms.barrier.below_barrier, 4);
  out += "economics:\n";
  out += "  issue_price:\n";
  out += emitTerm(terms.economics.issue_price, 4);
  if (terms.economics.estimated_value !== undefined) {
    out += "  estimated_value:\n";
    out += emitTerm(terms.economics.estimated_value, 4);
  }
  if (terms.economics.fees !== undefined) {
    out += "  fees:\n";
    out += emitTerm(terms.economics.fees, 4);
  }
  out += "sources:\n";
  for (const [id, source] of Object.entries(terms.sources)) {
    out += `  ${id}:\n`;
    out += `    kind: ${source.kind}\n`;
    out += `    file: ${yamlValue(source.file)}\n`;
  }
  return out;
}

function reload(terms) {
  const yaml = emitTerms(terms);
  const loaded = loadTerms(yaml, "terms.yaml");
  if (!loaded.ok) {
    throw new Error(loaded.errors.map((error) => `${error.path} ${error.message}`).join("; "));
  }
  return { yaml, terms: loaded.terms };
}

function ratioOf(text) {
  const parsed = parseRatio(text);
  if (parsed === null) throw new Error(`ratio ${text}`);
  return parsed;
}

function basisPoints(frac) {
  return Number((frac.p * 10000n * 2n + frac.q) / (frac.q * 2n));
}

function closeText(initial, ratio, rounding) {
  const exact = mulFrac(parseDecimal(initial), ratio);
  let text = formatDecimal(exact, 6);
  const target = formatRatio(roundRatio(ratio, rounding));
  const matches = (candidate) => {
    const parsed = parseDecimal(candidate);
    if (parsed === null || parsed.p === 0n) return false;
    return formatRatio(roundRatio(divFrac(parsed, parseDecimal(initial)), rounding)) === target;
  };
  if (matches(text)) return text;
  const start = parseDecimal(text);
  const startUnits = (start.p * 1000000n) / start.q;
  for (let step = 1n; step <= 100000n; step += 1n) {
    for (const sign of [1n, -1n]) {
      const units = startUnits + sign * step;
      if (units <= 0n) continue;
      const candidate = formatDecimal({ p: units, q: 1000000n }, 6);
      if (matches(candidate)) return candidate;
    }
  }
  throw new Error("close did not preserve the rounded ratio");
}

function memberIndex(ticker) {
  return MEMBERS.findIndex((member) => member.ticker === ticker);
}

function openDay(date, direction, calendar) {
  let cursor = addDaysIso(date, direction);
  for (let step = 0; step < 14 && cursor !== null; step += 1) {
    if (scheduleDateFlags(cursor, calendar).length === 0) return cursor;
    cursor = addDaysIso(cursor, direction);
  }
  throw new Error(`no open day near ${date}`);
}

function rngFor(label) {
  return mulberry32(hashSeed(`${seed}:${label}`));
}

function pushClose(closes, close, caseId) {
  if (seededValueRejected(close.value) !== null) {
    throw new Error(`${caseId}: fixed close rejected`);
  }
  closes.push({ ...close, seq: closes.length });
}

function addMemberClose(closes, caseId, date, ticker, ratio, rounding) {
  const initial = MEMBERS[memberIndex(ticker)].initial;
  const value = closeText(initial, ratio, rounding);
  pushClose(closes, { ticker, date, value, source: "synthetic-close" }, caseId);
}

export function drawSeededClose(caseId, initial, rounding, nextRatio) {
  let ratio;
  const value = drawAllowed(caseId, () => {
    ratio = nextRatio();
    return closeText(initial, ratio, rounding);
  });
  return { value, ratio };
}

function seededRatio(rng, minStep, maxStep) {
  return { p: BigInt(pickInt(rng, minStep, maxStep)), q: 10000n };
}

function addSeededMemberClose(closes, caseId, date, ticker, rounding, nextRatio) {
  const initial = MEMBERS[memberIndex(ticker)].initial;
  const { value, ratio } = drawSeededClose(caseId, initial, rounding, nextRatio);
  closes.push({ ticker, date, value, source: "synthetic-close", seq: closes.length });
  return ratio;
}

function placeRow(closes, caseId, date, row, rounding) {
  const rng = rngFor(`${caseId}:${date}:row`);
  if (row.all !== undefined) {
    const ratio = ratioOf(row.all);
    for (const member of MEMBERS) addMemberClose(closes, caseId, date, member.ticker, ratio, rounding);
    return;
  }
  let worstTicker = row.worstTicker;
  let worstRatio = row.ratio === undefined ? null : ratioOf(row.ratio);
  if (row.fixedClose !== undefined) {
    worstTicker = row.worstTicker;
    const initial = MEMBERS[memberIndex(worstTicker)].initial;
    const raw = divFrac(parseDecimal(row.fixedClose), parseDecimal(initial));
    worstRatio = roundRatio(raw, rounding);
    pushClose(closes, { ticker: worstTicker, date, value: row.fixedClose, source: "synthetic-close" }, caseId);
  } else if (row.seedBelow === true && worstTicker === undefined) {
    worstTicker = MEMBERS[pickInt(rng, 0, MEMBERS.length - 1)].ticker;
    worstRatio = addSeededMemberClose(
      closes, caseId, date, worstTicker, rounding, () => seededRatio(rng, 6000, 9499),
    );
  }
  if (row.conflict !== undefined) {
    worstTicker = row.conflict.ticker;
    row.conflict.values.forEach((value, index) => {
      pushClose(
        closes,
        { ticker: row.conflict.ticker, date, value, source: row.conflict.sources[index] },
        caseId,
      );
    });
  }
  const lower = worstRatio === null ? 6000 : basisPoints(worstRatio) + 100;
  for (const member of MEMBERS) {
    if (member.ticker === worstTicker && row.missing === member.ticker) continue;
    if (member.ticker === worstTicker && (row.fixedClose !== undefined || row.conflict !== undefined || row.ratio !== undefined || row.seedBelow === true)) {
      if (row.fixedClose !== undefined || row.conflict !== undefined || row.seedBelow === true) continue;
      addMemberClose(closes, caseId, date, member.ticker, worstRatio, rounding);
      continue;
    }
    const memberRng = rngFor(`${caseId}:${date}:${member.ticker}`);
    addSeededMemberClose(closes, caseId, date, member.ticker, rounding, () => seededRatio(memberRng, lower, 13000));
  }
}

function decoyRatio(kind) {
  return kind === "called" ? { p: 1n, q: 2n } : { p: 6n, q: 5n };
}

function buildCase(spec, calendar, callDates, finalDate) {
  const rounding = parseRounding(spec.terms.underlyings.performance_rounding.value);
  if (rounding === null) throw new Error(`${spec.id} rounding`);
  const dateOf = (row) => {
    if (row.final === true) return finalDate;
    if (row.date !== undefined) return row.date;
    const date = callDates[row.dateIndex];
    if (date === undefined) throw new Error(`${spec.id} date ${row.dateIndex}`);
    return date;
  };
  const closes = [];
  const rowDates = [];
  for (const row of spec.rows) {
    const date = dateOf(row);
    rowDates.push({ date, decoy: row.decoy });
    placeRow(closes, spec.id, date, row, rounding);
  }
  for (const extra of spec.extras ?? []) {
    const date = extra.date ?? callDates[extra.dateIndex];
    placeRow(closes, spec.id, date, extra, rounding);
  }
  for (const row of rowDates) {
    const ratio = decoyRatio(row.decoy);
    for (const direction of [-1, 1]) {
      const date = openDay(row.date, direction, calendar);
      for (const member of MEMBERS) {
        if (closes.some((close) => close.date === date && close.ticker === member.ticker)) continue;
        addMemberClose(closes, spec.id, date, member.ticker, ratio, rounding);
      }
    }
  }
  if (!closes.some((close) => close.date === spec.asOf)) {
    for (const member of MEMBERS) {
      const memberRng = rngFor(`${spec.id}:asof:${member.ticker}`);
      addSeededMemberClose(closes, spec.id, spec.asOf, member.ticker, rounding, () => seededRatio(memberRng, 6000, 13000));
    }
  }
  closes.sort((left, right) => {
    if (left.date < right.date) return -1;
    if (left.date > right.date) return 1;
    const order = memberIndex(left.ticker) - memberIndex(right.ticker);
    if (order !== 0) return order;
    return left.seq - right.seq;
  });
  return closes.map(({ ticker, date, value, source }) => ({ ticker, date, value, source }));
}

function primary(value) {
  return { value, status: "primary", source: "supplement" };
}

function casesFor(root) {
  const text = readFileSync(join(root, "fixtures/synthetic/terms/valid/minimal.yaml"), "utf8").replace(
    "schema: mln-terms/0.1",
    "schema: mln-terms/0.2",
  );
  const loaded = loadTerms(text, "minimal.yaml");
  if (!loaded.ok) throw new Error("minimal terms did not load");
  const base = loaded.terms;
  base.dates.final_valuation = primary("2031-02-26");
  const calendar = nyseRulesCalendar();
  const estimated = observationSchedule(base, calendar);
  if (estimated.kind !== "estimated") throw new Error("base schedule");
  const callDates = estimated.entries.slice(0, 18).map((entry) => entry.date);
  const finalDate = "2031-02-26";
  const listedTerms = () => {
    const terms = structuredClone(base);
    terms.dates.observation_schedule = callDates.map((date) => primary(date));
    terms.dates.observation_schedule.push(primary(finalDate));
    return terms;
  };
  const below = (count) => Array.from({ length: count }, (_, dateIndex) => ({ dateIndex, seedBelow: true, decoy: "below" }));
  const finalRow = (ticker, ratio, decoy) => ({ final: true, worstTicker: ticker, ratio, decoy });
  const specs = [
    { id: "g01-called-first", terms: structuredClone(base), asOf: "2026-09-01", rows: [{ dateIndex: 0, worstTicker: "BRVO", fixedClose: "76.470975", decoy: "called" }] },
    {
      id: "g02-called-second",
      terms: listedTerms(),
      asOf: "2026-12-15",
      rows: [
        { dateIndex: 0, worstTicker: "CHRL", ratio: "9499/10000", decoy: "below" },
        { dateIndex: 1, worstTicker: "DLTA", ratio: "1289/1250", decoy: "called" },
      ],
    },
    {
      id: "g03-live",
      terms: listedTerms(),
      asOf: "2028-01-14",
      rows: below(6),
      extras: [{ dateIndex: 6, all: "11/10" }],
    },
    { id: "g04-final-above-call", terms: listedTerms(), asOf: "2031-03-03", rows: [...below(18), finalRow("ALFA", "19/20", "called")] },
    { id: "g05-final-fixed-par", terms: listedTerms(), asOf: "2031-02-27", rows: [...below(18), finalRow("BRVO", "3/5", "below")] },
    { id: "g06-final-below-boundary", terms: listedTerms(), asOf: "2031-03-03", rows: [...below(18), finalRow("CHRL", "5999/10000", "below")] },
    { id: "g07-final-deep", terms: listedTerms(), asOf: "2031-03-03", rows: [...below(18), finalRow("DLTA", "1571/5000", "below")] },
    {
      id: "g08-unknown-missing",
      terms: listedTerms(),
      asOf: "2027-09-15",
      rows: [...below(3), { dateIndex: 3, worstTicker: "BRVO", missing: "BRVO", seedBelow: true, decoy: "unknown" }],
      extras: [{ date: "2027-09-01", all: "11/10" }],
    },
    {
      id: "g09-unknown-conflict",
      terms: listedTerms(),
      asOf: "2027-03-15",
      rows: [
        ...below(2),
        {
          dateIndex: 2,
          conflict: { ticker: "CHRL", values: ["116.4", "111.6"], sources: ["synthetic-a", "synthetic-b"] },
          worstTicker: "CHRL",
          decoy: "unknown",
        },
      ],
    },
    {
      id: "g10-truncate-provisional",
      terms: (() => {
        const terms = listedTerms();
        terms.underlyings.performance_rounding = primary("truncate-4dp");
        terms.underlyings.members[3].initial = { value: "95.125", status: "advisor", source: "email-b" };
        terms.sources["email-b"] = { kind: "advisor", file: "sources/email-b.txt" };
        return terms;
      })(),
      asOf: "2026-12-15",
      rows: [
        { dateIndex: 0, worstTicker: "BRVO", fixedClose: "76.470975", decoy: "below" },
        { dateIndex: 1, worstTicker: "ALFA", ratio: "19/20", decoy: "called" },
      ],
    },
    {
      id: "g11-estimated-stop",
      terms: structuredClone(base),
      asOf: "2026-12-15",
      rows: [{ dateIndex: 0, seedBelow: true, decoy: "below" }],
      extras: [{ date: "2026-12-01", all: "11/10" }],
    },
  ];
  return specs.map((spec) => {
    const reloaded = reload(spec.terms);
    const schedule = observationSchedule(reloaded.terms, calendar);
    if (schedule.kind === "unavailable") throw new Error(`${spec.id} schedule`);
    const closes = buildCase({ ...spec, terms: reloaded.terms }, calendar, callDates, finalDate);
    const evaluation = evaluateNote(reloaded.terms, calendar, closes, spec.asOf);
    const payouts = payoutSchedule(reloaded.terms, calendar);
    const metrics = noteMetrics(reloaded.terms, closes, spec.asOf);
    return {
      id: spec.id,
      yaml: reloaded.yaml,
      input: { synthetic: true, case: spec.id, asOf: spec.asOf, calendar: calendar.id, terms: reloaded.terms, schedule, closes },
      expected: { synthetic: true, case: spec.id, evaluation, payouts, metrics },
    };
  });
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function regen(root) {
  const dir = join(root, "fixtures/golden");
  rmSync(dir, { recursive: true, force: true });
  for (const item of casesFor(root)) {
    const caseDir = join(dir, item.id);
    mkdirSync(join(caseDir, "expected"), { recursive: true });
    writeFileSync(join(caseDir, "terms.yaml"), item.yaml.endsWith("\n") ? item.yaml : `${item.yaml}\n`);
    writeJson(join(caseDir, "input.json"), item.input);
    writeJson(join(caseDir, "expected/result.json"), item.expected);
  }
  scanTree(dir, root);
}
