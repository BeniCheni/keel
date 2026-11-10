import { expect, test } from "vitest";
import { nyseRulesCalendar, observationSchedule, scheduleDateFlags } from "../index.ts";
import type { Term, Terms } from "../terms/types.ts";
import { loadMinimal } from "./samples.ts";
import type { ScheduleResult } from "./types.ts";

const ATTEMPTS = 1200;
const SEED = 20261108;

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function iso(year: number, month: number, day: number): string {
  const two = (value: number) => (value < 10 ? `0${value}` : `${value}`);
  return `${year}-${two(month)}-${two(day)}`;
}

function setValued(term: Term<string>, value: string): void {
  if (term.status === "unknown" || term.status === "conflict") throw new Error("valued term required");
  term.value = value;
}

interface Trial {
  maturity: string;
  result: ScheduleResult;
}

function trials(seed: number): Trial[] {
  const base = loadMinimal();
  const calendar = nyseRulesCalendar();
  const rng = mulberry32(seed);
  const frequencies = ["monthly", "quarterly", "semiannual", "annual"] as const;
  const out: Trial[] = [];
  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    const terms: Terms = structuredClone(base);
    const year = 2026 + Math.floor(rng() * 32);
    const month = 1 + Math.floor(rng() * 12);
    const day = 1 + Math.floor(rng() * 28);
    const maturity = iso(year + 2, month, day);
    const frequency = frequencies[Math.floor(rng() * frequencies.length)] ?? "monthly";
    setValued(terms.dates.first_call_observation, iso(year, month, day));
    setValued(terms.dates.maturity, maturity);
    setValued(terms.call.frequency, frequency);
    const result = observationSchedule(terms, calendar);
    if (result.kind === "estimated") {
      let previous = "";
      result.entries.forEach((entry, index) => {
        expect(entry.index, `${attempt}:${index}`).toBe(index);
        if (index > 0) expect(entry.date > previous, `${attempt}:${entry.date}`).toBe(true);
        previous = entry.date;
        if (entry.origin === "generated") {
          expect(entry.date <= maturity, entry.date).toBe(true);
          expect(scheduleDateFlags(entry.date, calendar), entry.date).toEqual([]);
        }
      });
    }
    out.push({ maturity, result });
  }
  return out;
}

test("fixed-seed schedules are deterministic and well formed", () => {
  const first = trials(SEED);
  const second = trials(SEED);
  expect(second).toEqual(first);
  const estimated = first.filter((trial) => trial.result.kind === "estimated" && trial.result.entries.length > 1);
  expect(estimated.length).toBeGreaterThanOrEqual(1000);
});
