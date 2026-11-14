# Executive brief: PR #40, Pass 2.5, 2026-11-13 (America/New_York)

I ran every number below in this session, in a fresh clone at `831c337789f354458169c0913f38c658d7be0768`, with `KEEL_DATA_DIR` set to an empty temp folder. Anything I took from a PR body or comment is labelled as that vendor's claim. Seat: Opus 5.5 (`claude-opus-5-5`) at effort `high`, both read from session metadata; no fallback.

## Decision

Shadow mode: the gate says **"would escalate"**. Pass 1's High is still open by your ruling of 17:43 EST ("Fix in S03.1 (Recommended)"), and under `AGENTS.md` Severity an open High makes the verdict "not mergeable". You merge.

## What ships

- A spec for slice S03.1:
  - Cursor adds two golden cases: g12, a listed item dated after the final valuation date, and g13, the year-10000 slot. With them, Pass M can see both disagreements found off the golden set in PR #38.
  - Cursor adds the two generator guards.
  - Cursor makes `noteMetrics` skip a hole in `closes`, with AC12's test. This is the slice's one engine change.
  - Codex amends the reference at Pass 2, and Cursor never edits `tools/reference/**`.
- The S03 spec brought up to date with PR #38's review: rulings A, B and C, the `k` rule, check 2's order, an input contract, and the wording for L's item 18.
- One index row. No code, fixture, schema or sensitive path changes.

## What the passes found

- **Pass 1** (Codex, plan challenge at `ab9737e`): one High and seven Mediums.
  - **High 1:** `noteMetrics` throws a `TypeError` on a hole in `closes`, which the new input contract admits. It stays open by your 17:43 ruling.
  - **Mediums 2 to 8:** the calendar wording, ruling B's setup, item 18's scope, AC3 pinning `3e48b83`, AC6's Git exit code, AC4's version check, and Decision 4's silent-skip shape.
- **Pass 2** (Codex, at `faae442`): closed all seven Mediums. It found two new Mediums:
  - **P2-1:** a leading hole shifts the `close-invalid` index.
  - **P2-2:** Scope left out AC12's test file.
  - It also checked that AC12 and its three mutants would close the High once built. Pass M was N/A.
- **Pass 2 re-read** (Codex, at `831c337`): P2-1 and P2-2 closed. It raised one Medium on the records brief, which `659ee89` fixed on `docs/pr-40-records`. I confirmed the corrected sentence is there.
- **Pass 2.5 corroboration:**
  - Every Pass 1 and Pass 2 finding reproduces at `9ec6fd0`.
  - Every Medium is closed in the spec text at the head.
  - The High's path to closing holds: with a loop-only skip, Codex's `sparse-contract.mjs` exits 0 on both Nodes. Each of AC12's three mutants (no skip, `break`, skip at index 0 only) exits 1.
  - **No new findings.**
- **Contested:** nothing.

## Verification as re-run

| Check | Command | Result |
| --- | --- | --- |
| Head | `gh pr view 40 --json headRefOid`; `git rev-parse HEAD` | Both `831c337…0768`. Base `9ec6fd0`, which has not moved |
| Authorship | `git log --format='%h %an <%ae>' origin/main..HEAD` | 6 commits, each `Claude <noreply@anthropic.com>`. No Codex commit, so none to cold-read |
| Install | `pnpm install --frozen-lockfile` | Exit 0 on Node 24.22.2 and on 26.13.0 |
| Verify | `pnpm verify` | Exit 0 on both Nodes, all 8 steps `ok`. 511 of 511 passed in 38 files (core 178/16, plugin 210/12, tooling 123/10). `git status` clean. CI run [43525393848](https://github.com/BeniCheni/keel/actions/runs/43525393848) succeeded at the head |
| Determinism | The skill's `fixtures:regen` + registered-tree `git status` command | Exit 0, trees `fixtures/synthetic/terms` and `fixtures/golden` |
| Zero network | `pnpm verify:network` | Exit 0 |
| README quickstart | Each of the 8 `verify:*` steps, `pnpm --filter @keel/core test [calendar]`, `test:tooling [-- tripwire]`, `fixtures:regen`, `fixtures:trees` | All exit 0. A filter that matches nothing exits 1, as the README says. `test:ci-evidence` not run: it needs a failure-run id |
| Code equals `9ec6fd0` | `git diff --quiet <h> HEAD -- . ':(exclude)docs'` for `ab9737e`, `faae442`, `831c337` | Exit 0 for each, so the probes run in this clone run against `main`'s code |
| Claims rows | `git log`, `git diff --shortstat` at each pinned head | `ab9737e`: 3 commits, +129/−7. `faae442`: 5 commits, +133/−7. `831c337`: 6 commits, +133/−7. Always the same 3 files |
| Body probes | Hash check, then `node cases.mjs`, `cases-ref.py` (with the `9ec6fd0` and `3e48b83` references), `item18.mjs`, `zero-initial.mjs`, `holes.mjs`, on both Nodes | All 5 hashes match. Every result row reproduces, with identical output on both Nodes. See the notes below |
| Codex's probes | `contract-probe.mjs`, `generator-probe.mjs`, `sparse-contract.mjs`, on both Nodes | Calendar id `synthetic-calendar`; 4× `close-missing`; identical `as-of-invalid`; BRVO closes 0/1/2; `sparse-contract.mjs` exits 1 with all four hole cases throwing `TypeError` |
| `k` mutant | Delete the `continue` at `events.ts:139`, run plugin vitest with `--reporter=json`, then restore | Exit 1; 1 of 210 failed: "an item after the final valuation is found by its date, and by its place" (`payoff.evaluate.test.ts:682`). Clean after |
| References | `cmp` against `fd4fd79`'s and `9ec6fd0`'s `payoff.py`; `git rev-parse '3e48b83^{commit}'` after fetching `refs/pull/38/head` | Both `cmp` exit 0; `3e48b83` resolves |
| Schema bounds, calendar, throws | `python3 -I` over `$defs`; the body's calendar `grep`; `grep 'throw new'` | Rate 0–10000, months 0–120, level 1–20000, barrier 1–10000. `nyseRulesCalendar` alone at `calendar.ts:91`. 5 throws in `engine.ts`, 2 in `fraction.ts` |
| Tables, copy | `tablecols.py` (`57b8b74a…5fd2a`, hash matches); `grep -ciwE` copy words on the new spec | 0 bad rows in all 3 files (a bad-row control exits 1); 0 copy words |
| Tripwire | `tripwire-counts.mjs` (below) over the repo, title, body, 3 comments, both briefs, commit messages, the diff and my comment; `node tools/tripwire/cli.mjs .` | 0 in every class: CUSIP, account, SSN, address, email, price, local-only, unscannable, allowlist, vendors. A planted synthetic email gives `email` 1. The CLI exits 0 |
| Mutations | n/a | N/A: no code, engine or golden fixture changes |
| Pass M | `python3 tools/reference/payoff.py fixtures/golden/` | N/A for this PR. For the record: `cases 11, disagreements 0`, exit 0 |
| UI matrix / demo | `grep -c -i demo README.md` → 0 | N/A, and **not green**: the README has no demo step (idea 50) |

Notes on the body probes:
- **g12:** `evaluateNote` and `payoutSchedule` both give `listed-after-final-valuation` at index 18, and nothing else. The `9ec6fd0` reference adds `final-valuation-off-cycle`.
- **g13:** `live`, 0 rows, the next call on 9999-12-01. Payouts are 104250 for the call, and 104958 / 100000 for the final.
- **Item 18:** marking it `estimate` or `assumed` changes only `unverified` and `provisional`, on all 4 dates and in `payoutSchedule`.
- **Zero initial level:** the loader refuses it as `out-of-range`. Set by hand on loaded terms, `evaluateNote` and `noteMetrics` throw, while `payoutSchedule` and `finalPayout` return results.

Checks I did against the code at `9ec6fd0`:
- **The seven S03 edits** each match their branch:
  - **Status, ruling A:** matches `engine.ts:315-332`. With `runout.mjs`, only a conflict reaches the run-out: on L, 19 of 19 rows, then `final-valuation-conflict`. Absent and unknown stop earlier, on both schedule kinds.
  - **Events:** both listed bullets match `events.ts:121-143`.
  - **Check 2:** matches `read.ts:8-33` and `read.ts:64-82`, the metrics subset included.
  - **Ruling B:** matches the test at `payoff.honesty.test.ts:305-318`.
  - **Ruling C:** the gaps to slot 0 and slot 1 are 30 days and 1 day, and the cents rederive as 104250 and 104958.
  - **Input contract:** with `contract-stress.mjs`, 19,844 dense, type-valid calls on loaded B, L, g05 and g11 gave **0 throws** on both Nodes.
  - **Item 18:** with `item18-sweep.mjs`, the two-field claim held on **7,792 of 7,792** comparisons. That covers every `asOf` from 2026-03-01 to 2031-06-30, with and without closes, for both statuses.
- **S03.1's acceptance criteria can each fail:**
  - **AC1:** `after-final.py` prints `equal: False False` today on both Nodes. A scratch reference with Decision 2's one condition (`decision2-ref.py`) prints `True True`, and keeps the 11 cases at `disagreements 0`.
  - **AC2 and AC3:** the `9ec6fd0` reference disagrees on g12 only, and the `3e48b83` reference on g12 and g13.
  - **AC4:** the registry prints `1`.
  - **AC5:** the `k` mutant changes g12's engine output (it gains `final-valuation-off-cycle`). That supports the Mutation floor's statement that AC5 fails on g12.
  - **AC6:** Git exits 128 on a bad ref, and the filter prints a stray `read.ts`.
  - **AC7 and AC8:** the `placeRow` shapes are confirmed at `generate.mjs:315-357`.
  - **AC9, AC10, AC11:** each is a `git diff --quiet` or exit-code check, and each exits 0 now.
  - **AC12:** shown under Pass 2.5 corroboration above.
  - The version export is not written into any golden output, so moving to version 2 keeps the 11 cases byte-identical.

**Not re-run, and why:**
- The private-list check, which this seat does not run, by its prompt.
- Codex's 13-case scratch golden tree, built with the generator's seeded closes on `asOf`. I checked the two candidate cases with empty closes instead. Neither has a row, so closes on `asOf` are never read.
- `loadTerms` rejecting a dated-after item placed before the on-date item (`schedule-order`), which is Codex's claim.
- `test:ci-evidence`.

None of these is something the gate rests on.

## Estimates and model output

None.

## Risks and accepted costs

- **The High stays open after merge.** Merging puts an S03 contract on `main` that says every function skips a hole in `closes`. The contract itself names the gap: at `9ec6fd0`, `noteMetrics` still throws on one. That holds until S03.1's build lands AC12's test, which fails at `9ec6fd0` today. This is the same path PR #32's 13 Highs took under ruling 6.
- **Pass M reports one expected disagreement at Cursor's head.** It will disagree on g12 until Codex's Pass 2, and the spec tells Pass 1 to treat that as expected.
- **Late surfaces have no private-list check.** `659ee89`, my comment ([issuecomment-6870578359](https://github.com/BeniCheni/keel/pull/40#issuecomment-6870578359)) and the squash message postdate every check Codex ran. They need the PM's handoff scan.

## Shadow gate log

| Gate clause | Holds? |
| --- | --- |
| Not a release, no numbering fork | Yes. S03.1 is the number you picked |
| Verdict mergeable, every High closed | **No**: Pass 1's High is open by your 17:43 ruling |
| Nothing contested | Yes |
| `verify` green at tip; every number re-run | Yes. Exceptions are listed under "Not re-run" |
| No sensitive path, dependency or schema change | Yes |
| Every commit cold-read by a non-author vendor | Yes. Codex read `a415541`, `d09bbda` and `ab9737e` at Pass 1, `d466083` and `faae442` at Pass 2, and `831c337` at the re-read |
| Gate verdict | **would escalate** |
| Beni's decision (filled after) | Merged at `831c337` as `883bdd1` at 23:45:52 EST with Pass 1's High open, by his answer "Merge, High open (Recommended)" at 22:06:46 EST, after his private-list scan ("Yes, merged", 23:45:59 EST) (filled by the PM) |

## Questions for Beni

1. Do you confirm the 17:14 EST "No (Recommended)" (Cursor builds, every seat is the `AGENTS.md` default) and the 17:43 EST "Fix in S03.1 (Recommended)", as the Pass 0 and 1.5 briefs quote them?
2. Do you confirm the other rulings as quoted?
   - 2026-11-12, 14:29 EST: check 2 "In its path's place (Recommended)".
   - 2026-11-13:
     - 12:28 EST: A "Yes (Recommended)" and B "Reword it (Recommended)".
     - 13:20 EST: C "Yes, it counts (Recommended)".
     - 14:35 EST: `k` "No (Recommended)".
     - 15:07 EST: "Follow-up PR".
     - 15:28 EST: "S03.1 (Recommended)" and "One spec PR (Recommended)".
3. Merge PR #40 at `831c337` with Pass 1's High open under the 17:43 ruling, as PR #32 merged under ruling 6? (This one is also in the box below.)

## Proposed squash message (no handoff block, by this prompt)

Subject:

docs(specs): S03.1 spec, and S03 amended after its build review (#40)

Body:

Adds the S03.1 spec (docs/specs/s03.1-reference-k.md). Cursor adds two golden cases (g12, a listed item dated after the final valuation date; g13, the year-10000 slot), the generator's two guards and a hole skip in noteMetrics. Codex amends the reference's k rule at Pass 2. Amends the S03 spec from PR #38's review: rulings A, B and C and the k ruling of 2026-11-13, check 2's order of 2026-11-12, an input contract, and the wording for L's item 18. Adds one index row. No code changes.

Review: every commit is Claude-authored. Codex gave the plan challenge, Pass 2 and a re-read. One High stays open by owner ruling of 2026-11-13 ("Fix in S03.1 (Recommended)"): noteMetrics throws on a hole in closes. It closes when the S03.1 build lands AC12's test. Pass 2.5 ran on Opus 5.5 High. Shadow gate: would escalate. Reviewed head 831c337789f354458169c0913f38c658d7be0768.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>

Checked: `git log --format='%an <%ae>' origin/main..HEAD` gives only `Claude <noreply@anthropic.com>`. Codex's three review comments make Codex a reviewer, with identity `Codex <noreply@openai.com>` from hard rule 10. Pass 2.5 is Claude.

I give no merge command: the verdict is not mergeable, and you merge only from the PM's handoff, which adds the private-list scan of the late surfaces.

## Scripts my numbers rest on

Body and Codex probes are printed in the PR body and comments, and their hashes match. `tablecols.py` and `after-final.*` are in `docs/reviews/pr-32-pass-2.5.md` and `docs/reviews/pr-38-pass-2.5.md`. Mine follow, all run from the clone root.

`tripwire-counts.mjs` (`2f634fcf…2fc86`), run as `node tripwire-counts.mjs <clone> [files…]`:
```js
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
const root = process.argv[2];
const src = pathToFileURL(join(root, "tools/tripwire/scan.mjs"));
const text = readFileSync(src, "utf8").replace(/from "(\.{1,2}\/[^"]+)"/g, (_, s) => `from "${new URL(s, src).href}"`);
const copy = join(mkdtempSync(join(tmpdir(), "tw-")), "scan-copy.mjs");
writeFileSync(copy, text + "\nexport { textHits, parseVendors };\n");
const m = await import(pathToFileURL(copy));
const CLASSES = ["cusip", "account", "ssn", "address", "email", "price", "local-only", "unscannable", "allowlist", "vendors"];
const count = (hits) => Object.fromEntries(CLASSES.map((c) => [c, hits.filter((h) => h.class === c).length]).concat([["other", hits.filter((h) => !CLASSES.includes(h.class)).length]]));
const repo = m.scanRepo(root);
if (repo.error) { console.error("scanRepo error:", repo.error); process.exit(2); }
console.log("repo", JSON.stringify(count(repo.hits)));
const vendors = m.parseVendors(readFileSync(join(root, "tools/tripwire/vendors.txt"), "utf8"));
for (const f of process.argv.slice(3)) {
  const hits = m.textHits(readFileSync(f, "utf8"), f, vendors.addresses);
  console.log(f.split("/").pop(), JSON.stringify(count(hits)));
}
```

`ac12-variants.py` (`6dbc5282…71ca972`), run as `python3 -I ac12-variants.py packages/plugin-mln/src/engine.ts <fix|break|index0>`, then `node sparse-contract.mjs`, then `git checkout -- packages/plugin-mln/src/engine.ts`:
```python
import sys
p, v = sys.argv[1], sys.argv[2]
old = "  for (const close of closes) {\n    if (!names.has(close.ticker) || close.date > asOf) continue;"
new = {
  "fix":    "  for (const close of closes) {\n    if (close === undefined) continue;\n    if (!names.has(close.ticker) || close.date > asOf) continue;",
  "break":  "  for (const close of closes) {\n    if (close === undefined) break;\n    if (!names.has(close.ticker) || close.date > asOf) continue;",
  "index0": "  for (const [i, close] of closes.entries()) {\n    if (i === 0 && close === undefined) continue;\n    if (!names.has(close.ticker) || close.date > asOf) continue;",
}[v]
t = open(p).read()
assert t.count(old) == 1
open(p, "w").write(t.replace(old, new))
```

`decision2-ref.py` (`533ec343…d71b1`), run as `python3 -I decision2-ref.py tools/reference/payoff.py <out.py>`:
```python
import sys
t = open(sys.argv[1]).read()
a = '    for entry in schedule["entries"]:\n        index = entry["index"]\n        day = entry.get("date")\n'
b = ('    on_final = listed and final_date is not None and any(e.get("date") == final_date for e in schedule["entries"])\n' + a +
     '        if listed and final_date is not None and not on_final and day is not None and day > final_date:\n            continue\n')
assert t.count(a) == 1
open(sys.argv[2], "w").write(t.replace(a, b))
```

`ref-values.py` (`238bf62b…d8f24`), run as `python3 -I ref-values.py <payoff.py> <cases.json>`:
```python
import json, runpy, sys
ref = runpy.run_path(sys.argv[1])
for cid, case in json.load(open(sys.argv[2], encoding="utf-8")).items():
    d = case["data"]
    print(cid, "evaluation:", json.dumps(ref["evaluate"](d, []))[:200])
    print(cid, "payouts:   ", json.dumps(ref["payout_schedule"](d))[:200])
```

`runout.mjs` (`7a791643…6f350`), run as `node runout.mjs <clone>`:
```js
import { readFileSync } from "node:fs";
const ROOT = process.argv[2];
const { loadTerms, nyseRulesCalendar, observationSchedule } = await import(`${ROOT}/packages/core/src/index.ts`);
const { evaluateNote } = await import(`${ROOT}/packages/plugin-mln/src/index.ts`);
const cal = nyseRulesCalendar();
const fv = '  final_valuation:\n    value: "2031-02-26"\n    status: primary\n    source: "supplement"\n';
const variants = {
  conflict: '  final_valuation:\n    status: conflict\n    candidates:\n      - value: "2031-03-02"\n        status: primary\n        source: "supplement"\n      - value: "2031-03-03"\n        status: primary\n        source: "supplement"\n',
  unknown: "  final_valuation:\n    value: null\n    status: unknown\n",
  absent: "",
};
const scale = (v, num, den) => { const [w, f = ""] = String(v).split("."); const micro = BigInt(w + f.padEnd(6, "0")) * BigInt(num) / BigInt(den); const s = micro.toString().padStart(7, "0"); const i = s.slice(0, -6), d = s.slice(-6).replace(/0+$/, ""); return d ? `${i}.${d}` : i; };
for (const id of ["g01-called-first", "g02-called-second"]) {
  const yaml = readFileSync(`${ROOT}/fixtures/golden/${id}/terms.yaml`, "utf8");
  if (!yaml.includes(fv)) { console.log(id, "final term text not found"); process.exit(1); }
  for (const [name, text] of Object.entries(variants)) {
    const r = loadTerms(yaml.replace(fv, text), `${id}-${name}.yaml`);
    if (!r.ok) { console.log(id, name, "loads: false", JSON.stringify(r.errors)); continue; }
    const sched = observationSchedule(r.terms, cal);
    const dates = sched.entries.map((e) => e.date).filter((d) => d !== null);
    const closes = dates.flatMap((d) => r.terms.underlyings.members.map((m) => ({ ticker: m.ticker, date: d, value: scale(m.initial.value, 3, 5), source: "synthetic-close" })));
    const asOf = "2031-03-04";
    const ev = evaluateNote(r.terms, cal, closes, asOf);
    console.log(`${id} ${sched.kind} final ${name}: ${ev.kind} ${ev.status ?? ""} rows ${ev.rows?.length ?? "-"} of ${sched.entries.length} entries, next ${JSON.stringify(ev.next ?? null)}, payout ${ev.payoutCents ?? null}, reasons ${JSON.stringify(ev.reasons)}`);
  }
}
```

`contract-stress.mjs` (`be7df7d0…1472b`), run as `node contract-stress.mjs <clone>`:
```js
import { readFileSync } from "node:fs";
const ROOT = process.argv[2];
const { loadTerms, nyseRulesCalendar } = await import(`${ROOT}/packages/core/src/index.ts`);
const { evaluateNote, noteMetrics, finalPayout, payoutSchedule } = await import(`${ROOT}/packages/plugin-mln/src/index.ts`);
const cal = nyseRulesCalendar();
const load = (id) => { const r = loadTerms(readFileSync(`${ROOT}/fixtures/golden/${id}/terms.yaml`, "utf8"), `${id}.yaml`); if (!r.ok) throw Error(id); return r.terms; };
const asOfs = ["", "2026-02-30", "0000-01-01", "0001-01-01", "1900-02-29", "2026-09-01", "2031-03-03", "9999-12-31", "10000-01-01", " 2026-09-01", "2026-9-1"];
const values = ["0", "00", "1e5", "-1", "0.0000001", "9999999999.999999", "0.000001", "100.25", ""];
const dates = ["2026-09-01", "9999-12-31", "0000-01-01", "2026-13-01", ""];
const sources = ["synthetic-close", "", "A", "x".repeat(64), "x".repeat(65)];
const ratios = ["0/1", "1/0", "3/5", "1/1", "99999999999999999999999999999/1", "1/99999999999999999999999999", "", "0", "-1/2", "007/10"];
let calls = 0, throws = 0; const kinds = {};
const tally = (name, fn) => { calls += 1; try { const v = fn(); kinds[`${name}:${v.kind}`] = (kinds[`${name}:${v.kind}`] ?? 0) + 1; } catch (e) { throws += 1; if (throws <= 5) console.log("THROW", name, e.message); } };
for (const id of ["g01-called-first", "g02-called-second", "g05-final-fixed-par", "g11-estimated-stop"]) {
  const t = load(id);
  tally("payoutSchedule", () => payoutSchedule(t, cal));
  for (const r of ratios) tally("finalPayout", () => finalPayout(t, cal, r));
  for (const asOf of asOfs) for (const value of values) for (const date of dates) for (const source of sources) {
    const closes = t.underlyings.members.map((m, i) => ({ ticker: m.ticker, date: i === 0 ? date : "2026-09-01", value: i === 0 ? value : String(m.initial.value), source: i === 0 ? source : "synthetic-close" }));
    tally("evaluateNote", () => evaluateNote(t, cal, closes, asOf));
    tally("noteMetrics", () => noteMetrics(t, closes, asOf));
  }
}
console.log("calls", calls, "throws", throws); console.log(JSON.stringify(kinds));
process.exitCode = throws === 0 ? 0 : 1;
```

`item18-sweep.mjs` (`54db7f44…24d3a`): the PR body's `item18.mjs` up to, but not including, the line `const base0 =`, followed by:
```js
// Sweep: every asOf from 2026-03-01 to 2031-06-30, with and without closes, item 18 estimate and assumed.
const { addDaysIso } = await import(`${ROOT}/packages/core/src/index.ts`).catch(() => ({}));
const days = []; for (let d = new Date(Date.UTC(2026, 2, 1)); d <= new Date(Date.UTC(2031, 5, 30)); d.setUTCDate(d.getUTCDate() + 1)) days.push(d.toISOString().slice(0, 10));
const diffKeys = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
const tally = {};
for (const s of ["estimate", "assumed"]) {
  const t = make(s);
  for (const cl of [closes, []]) for (const asOf of days) {
    const a = evaluateNote(L0, cal, cl, asOf), b = evaluateNote(t, cal, cl, asOf);
    const key = a.kind === b.kind ? (a.kind === "evaluated" ? JSON.stringify(diffKeys(a, b)) : "same-kind " + a.kind + " equal " + (JSON.stringify(a) === JSON.stringify(b))) : "kind differs " + a.kind + "/" + b.kind;
    tally[key] = (tally[key] ?? 0) + 1;
  }
}
console.log("days", days.length, JSON.stringify(tally));
```

Nothing was pushed or merged, the PR is still a draft, and I opened nothing under `~/.config/keel/` or `~/.keel-spike/`. I'm stopping here.

## Records note (PM, 2026-11-13)

Written by the PM after the merge. Everything above this heading is the seat's chat message of 21:58:40 EST, read as data from its session transcript `140380d0-a4d1-40e6-bf4b-c075b1f9d6b0` with `brief-from-transcript.py` (appendix). The PM changed one line, the gate log's last row. Every assistant turn in that transcript names the model `claude-opus-5-5`. The PM did not check the effort level.

- **The seat's scripts.** The brief prints six of its seven scripts, each with a shortened SHA-256 and without its first line, a one-line comment. It describes the seventh, `item18-sweep.mjs`, instead of printing it. The appendix prints all seven files byte for byte, copied by the PM from the seat's scratch folder after the merge. Each copy's SHA-256 equals the one the seat's own `shasum -a 256` printed in its transcript, so the files did not change after the seat hashed them.
  - **Two shortened hashes are mis-copied.** In five of the seven, the shortened hash in the brief is the start and end of the full one. In two, the brief's last characters differ from the seat's `shasum` output. The brief is printed as sent:
    - `ac12-variants.py` ends `…076ca972`, where the brief gives `…71ca972`.
    - `ref-values.py` ends `…011f8d24`, where the brief gives `…d8f24`.

  The brief also points to three scripts printed in earlier records:
  - `tablecols.py`: `pr-32-pass-2.5.md` prints the same bytes (SHA-256 `57b8b74aacef7a70aff39a00fcf5a62b98a1f9fe0299fe484cc2c7876e95fd2a`).
  - `after-final.mjs` and `after-final.py`: `pr-38-pass-2.5.md` prints both under the same SHA-256 as the seat's copies.
- **The seat's questions.** The brief asks three. The seat's closing box at 21:57:23 EST asked the third again. Its transcript has one user turn, the PM's prompt at 21:46:09 EST, so Beni answered none of them there.
  - He pasted the seat's note into the PM's session at 22:06:04 EST.
  - The PM asked him there at 22:06:35 EST, joining the seat's first two questions into one.
  - He answered at 22:06:46 EST:
    - **"Merge, High open (Recommended)"**, to: "PR #40's Pass 2.5 gate says "would escalate": Pass 1's High (noteMetrics throws on a hole in closes) is open by your 17:43 "Fix in S03.1" ruling. S03.1's build can't start until this spec merges. Merge PR #40 at 831c337 with that High open, as PR #32 merged under ruling 6?"
    - **"Yes"**, to: "The Pass 2.5 seat asked you to confirm the rulings exactly as PR #40's Pass 0 and Pass 1.5 briefs quote them: 2026-11-12 14:29 check 2, and 2026-11-13 A and B (12:28), C (13:20), k (14:35), Follow-up PR (15:07), S03.1 and One spec PR (15:28), builder No (17:14), and Fix in S03.1 (17:43). Do you confirm them?"

  `p25-turns.py`, printed in `pr-38-pass-2.5.md` (SHA-256 `3029bc6e2a5c9a4683a48b30a8555ef9be35200c74924a1351b4c32250f07b8b`), prints the seat's one user turn and, from the PM's transcript, Beni's paste, the PM's questions and Beni's answers. It does not print the seat's closing box, which is a `mcp__ccd_turn__wrap_up` tool call. `tool-uses.py` (appendix) prints that call, at 21:57:23 EST. (Corrected on 2026-11-14 in records PR #41, after Codex's cold read. This sentence first said `p25-turns.py` "prints these turns from both transcripts", which was not true of the closing box.)
- **The handoff and the scan.** The PM gave Beni `private-scan-40.sh` and the pinned merge commands in `merge-40.sh`, both in the appendix.
  - **What the scan covers:**
    - PR #40's diff, commit messages, title and body;
    - its comments, reviews and inline comments;
    - both briefs on `docs/pr-40-records`, then at `659ee89`;
    - the squash message.
  - **How it was tested:** against synthetic lists only. It exits 2 on an empty list, 1 with a known hit, and 0 with no hit.
  - **The result:** at 23:45:59 EST Beni answered "Yes, merged" in the PM's session, to "Did the PR #40 scan end all zero before you merged?". He reported the outcome, not the counts.
- **The merge.** GitHub records it at 23:45:52 EST (`2026-11-14T04:45:52Z`), by `BeniCheni`, as squash `883bdd14f688603f191cf11973b087af0329668c` (`gh pr view 40 --repo BeniCheni/keel --json mergedAt,mergedBy,mergeCommit`).
- **For the gate-activation record.**
  - Shadow verdict: "would escalate".
  - Review verdict: "not mergeable", because Pass 1's High is open by Beni's ruling of 17:43 EST. Nothing else was owed at the head.
  - Beni's decision: merge at the reviewed head with that High open, as PR #32 merged under ruling 6. The merge ran from the PM's handoff, after the scan.
- **Post-merge checks.** The PM ran `post-merge-40.sh` (appendix) in a fresh clone of `main`, with `KEEL_DATA_DIR` set to one empty `mktemp -d` (0 entries after the runs):
  - **The commit and its base.** `git rev-parse origin/main` prints `883bdd14f688603f191cf11973b087af0329668c`, the commit GitHub records for the PR. Its one parent is `9ec6fd0284505d4f0653acc529f41b0ed7d940dd`. That is also `git merge-base 9ec6fd0 831c337`, so the base did not move during review. The script's line labelled `parents count` prints 2, because `git rev-list --parents -n1 883bdd1` lists the squash itself as well as its parent; `git show -s --format=%P 883bdd1 | wc -w` prints 1. (Annotated on 2026-11-14 in records PR #41, after Codex's cold read.)
  - **The tree.** `24ea43361d88514eab713ee1ee8e075af7e2c458` equals the reviewed head's tree, and `git diff --quiet 831c337 origin/main` exits 0. The squash changes three files: `docs/README.md`, `docs/specs/s03-payoff-engine.md` and `docs/specs/s03.1-reference-k.md`.
  - **The message.** `git log -1 --format=%B 883bdd1`, with trailing newlines trimmed, equals the subject and body in `merge-40.sh`, and the copy `private-scan-40.sh` scanned.
  - **The trailers.** `git log -1 --format='%(trailers:key=Co-authored-by)' 883bdd1` prints Claude and Codex in full. `git log --format='%an <%ae>' 9ec6fd0..831c337` gives 6 Claude commits, and Codex gave the review passes.
  - **Tag and branch.** No tag points at the squash (`git tag --points-at 883bdd1` prints nothing), as expected for a PR that is not a release. The branch `docs/s03.1-spec` is gone (`git ls-remote --heads origin docs/s03.1-spec` prints nothing).
  - **Install and verify.** `pnpm install --frozen-lockfile` and `pnpm verify` exit 0 on Node 24.22.2 and on 26.13.0. Core 178, plugin 210 and tooling 123 tests passed, and `git status --porcelain --untracked-files=all` prints nothing afterwards.
  - **Push CI.** Run 43558250064 on `883bdd1` succeeded on attempt 1, with all four cells and `verify` (`gh run view 43558250064 --repo BeniCheni/keel --json headSha,event,conclusion,attempt,jobs`).
  - **Pass M on `main`.** `python3 -I tools/reference/payoff.py fixtures/golden/` exits 0 with `cases 11, disagreements 0` (Python 3.9.6). PR #40 changed no code or fixture, so the reference and the golden bytes are those of `9ec6fd0`.
  - **The PR thread.** PR #40 has 0 reviews, 0 review threads and 4 comments. GitHub's edit history for the body (`userContentEdits`) has four entries, the last at 18:14 EST, so the body has not changed since before Codex's re-read.
- **Privacy.**
  - **Codex's last check.** Codex's last private-list check is in its re-read comment of 21:27:44 EST. It reports 0 on:
    - the fix diff and the commit message;
    - the PR title and body;
    - the issue comments, inline comments and review bodies;
    - the Pass 1.5 brief and its own comment.
  - **Three texts came later:** `659ee89` on the records branch (21:35:23 EST), the Pass 2.5 comment (21:57:04 EST) and the squash message. Beni's scan covered all three, and he reported it all zero.
  - **This records PR** adds new text: this file, the index row, its commit messages and its PR body. Codex's cold read runs the private-list check over them.
- **Where the open items go.**
  - **Pass 1's High** stays open on `main` until S03.1's build lands AC12's test. The index row says so.
  - **The S03.1 build** goes to Cursor on branch `s03.1/reference-k`, with the `AGENTS.md` default seats, by Beni's 17:14 EST ruling. It is a sensitive-path PR: Cursor touches `packages/plugin-mln/**` and `fixtures/golden/**`, and Codex's Pass 2 touches `tools/reference/**`. So Fable pins apply, fast-track is barred, and Beni merges.
  - **The next ordinary docs PR** carries the README quickstart and status line, and the ideas PR #38's records list.
  - **An `AGENTS.md` PR** takes PR #38's Pass 2.5 finding 6, the seat's name in the Seats and Workflow tables. `pr-38-pass-2.5.md` also suggested a row for Pass 2 on a Codex-authored PR. Since the 17:14 ruling, no slice needs one.

## Appendix: scripts

The seat's seven scripts are printed byte for byte, as its scratch folder held them after the merge. The PM's scripts follow. Each heading gives the file's SHA-256 (`shasum -a 256`).

### The seat's scripts

#### `tripwire-counts.mjs` (`2f634fcf014bc1b67df1780260128269e7c320ec3917de503ad7cf6c09e2fc86`)

```js
// Tripwire counts per class, never values. usage: node tripwire-counts.mjs <clone> [text files...]
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
const root = process.argv[2];
const src = pathToFileURL(join(root, "tools/tripwire/scan.mjs"));
const text = readFileSync(src, "utf8").replace(/from "(\.{1,2}\/[^"]+)"/g, (_, s) => `from "${new URL(s, src).href}"`);
const copy = join(mkdtempSync(join(tmpdir(), "tw-")), "scan-copy.mjs");
writeFileSync(copy, text + "\nexport { textHits, parseVendors };\n");
const m = await import(pathToFileURL(copy));
const CLASSES = ["cusip", "account", "ssn", "address", "email", "price", "local-only", "unscannable", "allowlist", "vendors"];
const count = (hits) => Object.fromEntries(CLASSES.map((c) => [c, hits.filter((h) => h.class === c).length]).concat([["other", hits.filter((h) => !CLASSES.includes(h.class)).length]]));
const repo = m.scanRepo(root);
if (repo.error) { console.error("scanRepo error:", repo.error); process.exit(2); }
console.log("repo", JSON.stringify(count(repo.hits)));
const vendors = m.parseVendors(readFileSync(join(root, "tools/tripwire/vendors.txt"), "utf8"));
for (const f of process.argv.slice(3)) {
  const hits = m.textHits(readFileSync(f, "utf8"), f, vendors.addresses);
  console.log(f.split("/").pop(), JSON.stringify(count(hits)));
}
```

#### `ac12-variants.py` (`6dbc52823608a396dc2f587394c52c1c7b7ae8a87fddcf7b1f98624a076ca972`)

```python
# Rewrites noteMetrics's loop over closes (engine.ts:410 at 9ec6fd0) as one variant. usage: python3 -I ac12-variants.py <engine.ts> <variant>
import sys
p, v = sys.argv[1], sys.argv[2]
old = "  for (const close of closes) {\n    if (!names.has(close.ticker) || close.date > asOf) continue;"
new = {
  "fix":    "  for (const close of closes) {\n    if (close === undefined) continue;\n    if (!names.has(close.ticker) || close.date > asOf) continue;",
  "break":  "  for (const close of closes) {\n    if (close === undefined) break;\n    if (!names.has(close.ticker) || close.date > asOf) continue;",
  "index0": "  for (const [i, close] of closes.entries()) {\n    if (i === 0 && close === undefined) continue;\n    if (!names.has(close.ticker) || close.date > asOf) continue;",
}[v]
t = open(p).read()
assert t.count(old) == 1
open(p, "w").write(t.replace(old, new))
```

#### `decision2-ref.py` (`533ec3433b19ef11d40089003618d4ae9d6000ae7cfb8419cf5d7086231d71b1`)

```python
# Writes a scratch copy of a payoff.py with Decision 2's one change. usage: python3 -I decision2-ref.py <payoff.py> <out.py>
import sys
t = open(sys.argv[1]).read()
a = '    for entry in schedule["entries"]:\n        index = entry["index"]\n        day = entry.get("date")\n'
b = ('    on_final = listed and final_date is not None and any(e.get("date") == final_date for e in schedule["entries"])\n' + a +
     '        if listed and final_date is not None and not on_final and day is not None and day > final_date:\n            continue\n')
assert t.count(a) == 1
open(sys.argv[2], "w").write(t.replace(a, b))
```

#### `ref-values.py` (`238bf62b2cc75139a2ecf1b5981bd22e29a82ad272394bcade1800d2011f8d24`)

```python
# Prints a given payoff.py's results on the candidate cases. usage: python3 -I ref-values.py <payoff.py> <cases.json>
import json, runpy, sys
ref = runpy.run_path(sys.argv[1])
for cid, case in json.load(open(sys.argv[2], encoding="utf-8")).items():
    d = case["data"]
    print(cid, "evaluation:", json.dumps(ref["evaluate"](d, []))[:200])
    print(cid, "payouts:   ", json.dumps(ref["payout_schedule"](d))[:200])
```

#### `runout.mjs` (`7a7916432b66a384332c2fca770f59e59d279041bcd2cf3e79d94e2ea796f350`)

```js
// Ruling A's run-out: which final-valuation states reach the end of runEvaluation? usage: node runout.mjs <clone>
import { readFileSync } from "node:fs";
const ROOT = process.argv[2];
const { loadTerms, nyseRulesCalendar, observationSchedule } = await import(`${ROOT}/packages/core/src/index.ts`);
const { evaluateNote } = await import(`${ROOT}/packages/plugin-mln/src/index.ts`);
const cal = nyseRulesCalendar();
const fv = '  final_valuation:\n    value: "2031-02-26"\n    status: primary\n    source: "supplement"\n';
const variants = {
  conflict: '  final_valuation:\n    status: conflict\n    candidates:\n      - value: "2031-03-02"\n        status: primary\n        source: "supplement"\n      - value: "2031-03-03"\n        status: primary\n        source: "supplement"\n',
  unknown: "  final_valuation:\n    value: null\n    status: unknown\n",
  absent: "",
};
const scale = (v, num, den) => { const [w, f = ""] = String(v).split("."); const micro = BigInt(w + f.padEnd(6, "0")) * BigInt(num) / BigInt(den); const s = micro.toString().padStart(7, "0"); const i = s.slice(0, -6), d = s.slice(-6).replace(/0+$/, ""); return d ? `${i}.${d}` : i; };
for (const id of ["g01-called-first", "g02-called-second"]) {
  const yaml = readFileSync(`${ROOT}/fixtures/golden/${id}/terms.yaml`, "utf8");
  if (!yaml.includes(fv)) { console.log(id, "final term text not found"); process.exit(1); }
  for (const [name, text] of Object.entries(variants)) {
    const r = loadTerms(yaml.replace(fv, text), `${id}-${name}.yaml`);
    if (!r.ok) { console.log(id, name, "loads: false", JSON.stringify(r.errors)); continue; }
    const sched = observationSchedule(r.terms, cal);
    const dates = sched.entries.map((e) => e.date).filter((d) => d !== null);
    const closes = dates.flatMap((d) => r.terms.underlyings.members.map((m) => ({ ticker: m.ticker, date: d, value: scale(m.initial.value, 3, 5), source: "synthetic-close" })));
    const asOf = "2031-03-04";
    const ev = evaluateNote(r.terms, cal, closes, asOf);
    console.log(`${id} ${sched.kind} final ${name}: ${ev.kind} ${ev.status ?? ""} rows ${ev.rows?.length ?? "-"} of ${sched.entries.length} entries, next ${JSON.stringify(ev.next ?? null)}, payout ${ev.payoutCents ?? null}, reasons ${JSON.stringify(ev.reasons)}`);
  }
}
```

#### `contract-stress.mjs` (`be7df7d024654aaf17f9169da504fe11cc2101a671716002f7a3a91bd191472b`)

```js
// Stress the S03 input contract with type-valid dense inputs on loaded B and L; count throws. usage: node contract-stress.mjs <clone>
import { readFileSync } from "node:fs";
const ROOT = process.argv[2];
const { loadTerms, nyseRulesCalendar } = await import(`${ROOT}/packages/core/src/index.ts`);
const { evaluateNote, noteMetrics, finalPayout, payoutSchedule } = await import(`${ROOT}/packages/plugin-mln/src/index.ts`);
const cal = nyseRulesCalendar();
const load = (id) => { const r = loadTerms(readFileSync(`${ROOT}/fixtures/golden/${id}/terms.yaml`, "utf8"), `${id}.yaml`); if (!r.ok) throw Error(id); return r.terms; };
const asOfs = ["", "2026-02-30", "0000-01-01", "0001-01-01", "1900-02-29", "2026-09-01", "2031-03-03", "9999-12-31", "10000-01-01", " 2026-09-01", "2026-9-1"];
const values = ["0", "00", "1e5", "-1", "0.0000001", "9999999999.999999", "0.000001", "100.25", ""];
const dates = ["2026-09-01", "9999-12-31", "0000-01-01", "2026-13-01", ""];
const sources = ["synthetic-close", "", "A", "x".repeat(64), "x".repeat(65)];
const ratios = ["0/1", "1/0", "3/5", "1/1", "99999999999999999999999999999/1", "1/99999999999999999999999999", "", "0", "-1/2", "007/10"];
let calls = 0, throws = 0; const kinds = {};
const tally = (name, fn) => { calls += 1; try { const v = fn(); kinds[`${name}:${v.kind}`] = (kinds[`${name}:${v.kind}`] ?? 0) + 1; } catch (e) { throws += 1; if (throws <= 5) console.log("THROW", name, e.message); } };
for (const id of ["g01-called-first", "g02-called-second", "g05-final-fixed-par", "g11-estimated-stop"]) {
  const t = load(id);
  tally("payoutSchedule", () => payoutSchedule(t, cal));
  for (const r of ratios) tally("finalPayout", () => finalPayout(t, cal, r));
  for (const asOf of asOfs) for (const value of values) for (const date of dates) for (const source of sources) {
    const closes = t.underlyings.members.map((m, i) => ({ ticker: m.ticker, date: i === 0 ? date : "2026-09-01", value: i === 0 ? value : String(m.initial.value), source: i === 0 ? source : "synthetic-close" }));
    tally("evaluateNote", () => evaluateNote(t, cal, closes, asOf));
    tally("noteMetrics", () => noteMetrics(t, closes, asOf));
  }
}
console.log("calls", calls, "throws", throws); console.log(JSON.stringify(kinds));
process.exitCode = throws === 0 ? 0 : 1;
```

#### `item18-sweep.mjs` (`54db7f44f1e9acf8c6e2f9535f20424b60734cb000ab9902683acfcefcd24d3a`)

```js
// L, and L with item 18 (dated on the final valuation date) marked estimate or assumed: evaluateNote and payoutSchedule.
// usage: node item18.mjs <clone>
const ROOT = process.argv[2];
const { readFileSync } = await import("node:fs");
const { loadTerms, nyseRulesCalendar, observationSchedule } = await import(`${ROOT}/packages/core/src/index.ts`);
const { evaluateNote, payoutSchedule } = await import(`${ROOT}/packages/plugin-mln/src/index.ts`);
const cal = nyseRulesCalendar();
const base = readFileSync(`${ROOT}/fixtures/synthetic/terms/valid/minimal.yaml`, "utf8").replace("mln-terms/0.1", "mln-terms/0.2");
const fv = "  final_valuation:\n    value: 2031-02-26\n    status: primary\n    source: supplement\n";
const B = loadTerms(base.replace("underlyings:\n", `${fv}underlyings:\n`), "b.yaml");
if (!B.ok) { console.log("B fails", JSON.stringify(B.errors)); process.exit(1); }
const dates = observationSchedule(B.terms, cal).entries.slice(0, 18).map((e) => e.date).concat(["2031-02-26"]);
const make = (status18) => {
  const item = (d, i) => i === 18 && status18 !== "primary"
    ? `    - value: ${d}\n      status: ${status18}\n` + (status18 === "estimate" ? "      rule: stated\n" : "      note: stated\n")
    : `    - value: ${d}\n      status: primary\n      source: supplement\n`;
  const extra = fv + "  observation_schedule:\n" + dates.map(item).join("");
  const r = loadTerms(base.replace("underlyings:\n", `${extra}underlyings:\n`), `l-${status18}.yaml`);
  if (!r.ok) { console.log("L fails", status18, JSON.stringify(r.errors)); process.exit(1); }
  return r.terms;
};
const members = { ALFA: "100.25", BRVO: "80.5", CHRL: "120", DLTA: "95.125" };
const scale = (v, num, den) => { const [w, f = ""] = v.split("."); const micro = BigInt(w + f.padEnd(6, "0")) * BigInt(num) / BigInt(den); const s = micro.toString().padStart(7, "0"); const i = s.slice(0, -6), d = s.slice(-6).replace(/0+$/, ""); return d ? `${i}.${d}` : i; };
const L0 = make("primary");
const initials = Object.fromEntries(L0.underlyings.members.map((m) => [m.ticker, m.initial.value]));
const closes = dates.flatMap((d, i) => Object.entries(initials).map(([ticker, init]) => ({ ticker, date: d, value: scale(String(init), i === 18 ? 19 : 3, i === 18 ? 20 : 5), source: "synthetic-close" })));

// Sweep: every asOf from 2026-03-01 to 2031-06-30, with and without closes, item 18 estimate and assumed.
const { addDaysIso } = await import(`${ROOT}/packages/core/src/index.ts`).catch(() => ({}));
const days = []; for (let d = new Date(Date.UTC(2026, 2, 1)); d <= new Date(Date.UTC(2031, 5, 30)); d.setUTCDate(d.getUTCDate() + 1)) days.push(d.toISOString().slice(0, 10));
const diffKeys = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
const tally = {};
for (const s of ["estimate", "assumed"]) {
  const t = make(s);
  for (const cl of [closes, []]) for (const asOf of days) {
    const a = evaluateNote(L0, cal, cl, asOf), b = evaluateNote(t, cal, cl, asOf);
    const key = a.kind === b.kind ? (a.kind === "evaluated" ? JSON.stringify(diffKeys(a, b)) : "same-kind " + a.kind + " equal " + (JSON.stringify(a) === JSON.stringify(b))) : "kind differs " + a.kind + "/" + b.kind;
    tally[key] = (tally[key] ?? 0) + 1;
  }
}
console.log("days", days.length, JSON.stringify(tally));
```

### The PM's scripts

#### `private-scan-40.sh`, the private-list scan for Beni to run (`da3ee751e63844d82716e2d45926f8c54cf823d78d5d0a383949cbed85d30ba7`)

```sh
bash <<'SCRIPT'
set -u
F="${KEEL_PRIVATE_LIST:-$HOME/.config/keel/private-terms.txt}"
R=BeniCheni/keel
N=40
{ test -r "$F" && test -s "$F"; } || { echo "list unreadable or empty"; exit 2; }
W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT
grep -v '^[[:space:]]*$' "$F" > "$W/p" || { echo "list has no patterns"; exit 2; }
head -n 1 "$W/p" > "$W/control"
c="$(grep -F -i -c -f "$W/p" "$W/control")"
[ "$c" = 1 ] || { echo "control failed"; exit 2; }
echo "control: ok"
gh pr diff $N --repo $R > "$W/diff" < /dev/null || { echo "diff fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/commits --jq '.[].commit.message' > "$W/commits" < /dev/null || { echo "commits fetch failed"; exit 2; }
gh pr view $N --repo $R --json title,body --jq '.title, .body' > "$W/title-body" < /dev/null || { echo "PR fetch failed"; exit 2; }
gh api --paginate repos/$R/issues/$N/comments --jq '.[].body' > "$W/comments" < /dev/null || { echo "comments fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/reviews --jq '.[].body' > "$W/reviews" < /dev/null || { echo "reviews fetch failed"; exit 2; }
gh api --paginate repos/$R/pulls/$N/comments --jq '.[].body' > "$W/review-comments" < /dev/null || { echo "review comments fetch failed"; exit 2; }
for b in pass-0 pass-1.5; do
  gh api -H 'Accept: application/vnd.github.raw' "repos/$R/contents/docs/reviews/pr-$N-$b.md?ref=docs/pr-$N-records" > "$W/brief-$b" < /dev/null || { echo "brief $b fetch failed"; exit 2; }
done
cat > "$W/squash" <<'MSG'
docs(specs): S03.1 spec, and S03 amended after its build review (#40)

Adds the S03.1 spec (docs/specs/s03.1-reference-k.md). Cursor adds two golden cases (g12, a listed item dated after the final valuation date; g13, the year-10000 slot), the generator's two guards and a hole skip in noteMetrics. Codex amends the reference's k rule at Pass 2. Amends the S03 spec from PR #38's review: rulings A, B and C and the k ruling of 2026-11-13, check 2's order of 2026-11-12, an input contract, and the wording for L's item 18. Adds one index row. No code changes.

Review: every commit is Claude-authored. Codex gave the plan challenge, Pass 2 and a re-read. One High stays open by owner ruling of 2026-11-13 ("Fix in S03.1 (Recommended)"): noteMetrics throws on a hole in closes. It closes when the S03.1 build lands AC12's test. Pass 2.5 ran on Opus 5.5 High. Shadow gate: would escalate. Reviewed head 831c337789f354458169c0913f38c658d7be0768.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
MSG
echo "comments on PR #$N now: $(gh api repos/$R/issues/$N --jq .comments < /dev/null)"
status=0
for s in diff commits title-body comments reviews review-comments brief-pass-0 brief-pass-1.5 squash; do
  f="$W/$s"
  test -s "$f" || [ "$s" = reviews ] || [ "$s" = review-comments ] || { echo "$s: empty, scan failed"; status=2; continue; }
  n="$(grep -F -i -c -f "$W/p" "$f")"; rc=$?
  if [ "$rc" -gt 1 ]; then echo "$s: scan failed"; status=2
  else echo "$s: $n matching lines"; [ "$n" = 0 ] || { [ "$status" = 2 ] || status=1; }
  fi
done
echo "exit $status"
exit $status
SCRIPT
```

#### `merge-40.sh`, the merge commands as given to Beni (PR #40 is merged, so they now fail) (`c82b9c383da33306735923e89cebd323e8d36ef02a825cc0ce562287e3ed4a48`)

```sh
gh pr ready 40 --repo BeniCheni/keel
gh pr merge 40 --repo BeniCheni/keel --squash --match-head-commit 831c337789f354458169c0913f38c658d7be0768 --subject "docs(specs): S03.1 spec, and S03 amended after its build review (#40)" --body-file - <<'EOF'
Adds the S03.1 spec (docs/specs/s03.1-reference-k.md). Cursor adds two golden cases (g12, a listed item dated after the final valuation date; g13, the year-10000 slot), the generator's two guards and a hole skip in noteMetrics. Codex amends the reference's k rule at Pass 2. Amends the S03 spec from PR #38's review: rulings A, B and C and the k ruling of 2026-11-13, check 2's order of 2026-11-12, an input contract, and the wording for L's item 18. Adds one index row. No code changes.

Review: every commit is Claude-authored. Codex gave the plan challenge, Pass 2 and a re-read. One High stays open by owner ruling of 2026-11-13 ("Fix in S03.1 (Recommended)"): noteMetrics throws on a hole in closes. It closes when the S03.1 build lands AC12's test. Pass 2.5 ran on Opus 5.5 High. Shadow gate: would escalate. Reviewed head 831c337789f354458169c0913f38c658d7be0768.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
EOF
```

#### `post-merge-40.sh`, the post-merge checks (`bda0f3f001500efd825c136ef21af1c22c40be64a5b1db232b3af99f10bdc845`)

```sh
#!/bin/bash
# Post-merge checks for PR #40, in a fresh clone of main.
SP=/private/tmp/claude-501/-Users-benicheni-code-keel-pm/225b8049-5222-43ea-a7be-10c973d89ac6/scratchpad/rec40
D=$SP/post-merge
SQ=883bdd14f688603f191cf11973b087af0329668c
HEAD_SHA=831c337789f354458169c0913f38c658d7be0768
BASE=9ec6fd0284505d4f0653acc529f41b0ed7d940dd
if [ -e "$D" ]; then echo "exists: $D"; exit 2; fi
export KEEL_DATA_DIR="$(mktemp -d)"
gh repo clone BeniCheni/keel "$D" -- -q < /dev/null || { echo "clone failed"; exit 3; }
cd "$D" || exit 3
git fetch -q origin pull/40/head:pr40-head || { echo "fetch head failed"; exit 3; }
echo "pr merge commit  $(gh pr view 40 --repo BeniCheni/keel --json mergeCommit -q .mergeCommit.oid < /dev/null)"
echo "merged at        $(gh pr view 40 --repo BeniCheni/keel --json mergedAt,mergedBy -q '.mergedAt + " by " + .mergedBy.login' < /dev/null)"
echo "origin/main      $(git rev-parse origin/main)"
echo "parent           $(git rev-parse $SQ^)"
echo "parents count    $(git rev-list --parents -n1 $SQ | wc -w | tr -d ' ')"
echo "merge-base       $(git merge-base $BASE $HEAD_SHA)"
echo "pr head ref      $(git rev-parse pr40-head)"
echo "tree squash      $(git rev-parse "$SQ^{tree}")"
echo "tree head        $(git rev-parse "$HEAD_SHA^{tree}")"
git diff --quiet $HEAD_SHA origin/main; echo "diff head main exit $?"
echo "files changed    $(git diff --name-only $BASE $SQ | tr '\n' ' ')"
echo "tags at squash   [$(git tag --points-at $SQ | tr '\n' ' ')]"
echo "branch on origin [$(git ls-remote --heads origin docs/s03.1-spec)]"
echo "author           $(git log -1 --format='%an <%ae>' $SQ)"
echo "committer        $(git log -1 --format='%cn <%ce> %cI' $SQ)"
git log -1 --format=%B $SQ > $SP/squash-msg.txt
echo "squash message sha256 $(shasum -a 256 < $SP/squash-msg.txt | cut -c1-64)"
echo "--- trailers"
git log -1 --format='%(trailers:key=Co-authored-by)' $SQ
echo "--- authors on the PR"
git log --format='%an <%ae>' $BASE..$HEAD_SHA | sort | uniq -c
echo "--- PR thread"
gh api graphql -f query='{repository(owner:"BeniCheni",name:"keel"){pullRequest(number:40){userContentEdits{totalCount} reviews{totalCount} reviewThreads{totalCount} comments{totalCount}}}}' --jq '.data.repository.pullRequest | "body edits \(.userContentEdits.totalCount), reviews \(.reviews.totalCount), review threads \(.reviewThreads.totalCount), comments \(.comments.totalCount)"' < /dev/null
for v in 24.22.2 26.13.0; do
  echo "== node v$v"
  ( export PATH="$HOME/.nvm/versions/node/v$v/bin:$PATH"; echo "node $(node -v)";
    pnpm install --frozen-lockfile > $SP/pm-install-v$v.log 2>&1; echo "install exit $?"
    pnpm verify > $SP/pm-verify-v$v.log 2>&1; echo "verify exit $?"
    grep -E '^\s+Tests\s' $SP/pm-verify-v$v.log | sed 's/\x1b\[[0-9;]*m//g'
    echo "status lines: $(git status --porcelain --untracked-files=all | wc -l | tr -d ' ')" )
done
echo "== Pass M on main ($(python3 --version 2>&1))"
python3 -I tools/reference/payoff.py fixtures/golden/ | tail -1; echo "pass m exit ${PIPESTATUS[0]}"
echo "KEEL_DATA_DIR entries: $(ls -A "$KEEL_DATA_DIR" | wc -l | tr -d ' ')"
```

The line labelled `parents count` prints 2 for one parent: `git rev-list --parents -n1` lists the commit itself as well as its parents. `git show -s --format=%P 883bdd1 | wc -w` prints 1. (Annotated on 2026-11-14 in records PR #41, after Codex's cold read.)

#### `brief-from-transcript.py`, the seat's brief from its transcript (`20373071784e26c95c68714efbb525873133d18fcf7aedeffb1c96b928a8d6e4`)

```python
# Save the last assistant text block that opens with a given heading from a Claude Code transcript, as data.
# usage: python3 -I brief-from-transcript.py <transcript.jsonl> <heading prefix> <out.md>
import json, sys
out = None
for line in open(sys.argv[1], encoding="utf-8"):
    r = json.loads(line)
    if r.get("type") != "assistant": continue
    for b in (r.get("message") or {}).get("content") or []:
        if b.get("type") == "text" and b["text"].startswith(sys.argv[2]):
            out = (r["timestamp"], r.get("uuid"), b["text"])
if out is None: print("not found"); sys.exit(1)
open(sys.argv[3], "w", encoding="utf-8").write(out[2])
print(out[0], out[1], len(out[2]))
```

#### `tool-uses.py`, the seat's closing box from its transcript (added on 2026-11-14 in records PR #41) (`bad3d23645fa7cba4cf7af40f1c82b3126e8aa1469f22b3bd0c2f9a66a592350`)

```python
# Print a Claude Code transcript's tool calls of one name, with EST times and their input, as data. Executes nothing it reads.
# usage: python3 -I tool-uses.py <transcript.jsonl> <tool name>
import json, sys, datetime
EST = datetime.timezone(datetime.timedelta(hours=-5))
for line in open(sys.argv[1], encoding="utf-8"):
    r = json.loads(line)
    if r.get("type") != "assistant": continue
    for b in (r.get("message") or {}).get("content") or []:
        if b.get("type") == "tool_use" and b.get("name") == sys.argv[2]:
            t = datetime.datetime.fromisoformat(r["timestamp"].replace("Z", "+00:00")).astimezone(EST)
            print(t.strftime("%H:%M:%S EST"), json.dumps(b["input"])[:600])
```
