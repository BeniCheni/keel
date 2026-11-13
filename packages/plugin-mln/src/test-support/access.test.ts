import { loadTerms, nyseRulesCalendar, observationSchedule, type Terms } from "@keel/core";
import { expect, test } from "vitest";
import type { Close } from "../types.ts";
import { clone, primary } from "./edit.ts";

interface ListedDirent {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
}

// packages/plugin-mln keeps `types` empty, so the node builtin has no declarations.
// @ts-expect-error TS2591
import { readdirSync as readDirectory, readFileSync as readText } from "node:fs";

const readdirSync = readDirectory as (path: string, options: { withFileTypes: true }) => ListedDirent[];
const readFileSync = readText as (path: string, encoding: "utf8") => string;

function here(): string {
  const url = import.meta.url;
  if (!url.startsWith("file://")) throw new Error("loader is not a file URL");
  return decodeURIComponent(url.slice("file://".length)).replace(/\/[^/]*$/, "");
}

export function repoRoot(): string {
  return `${here()}/../../../..`;
}

function loadOnce(): Terms {
  const text = readFileSync(`${repoRoot()}/fixtures/synthetic/terms/valid/minimal.yaml`, "utf8").replace(
    "schema: mln-terms/0.1",
    "schema: mln-terms/0.2",
  );
  const loaded = loadTerms(text, "minimal.yaml");
  if (!loaded.ok) throw new Error("minimal terms did not load");
  const terms = loaded.terms;
  terms.dates.final_valuation = primary("2031-02-26");
  return terms;
}

const cached = loadOnce();

export function calendar() {
  return nyseRulesCalendar();
}

export function baseTerms(): Terms {
  return clone(cached);
}

export function entryDates(terms: Terms = cached): string[] {
  const schedule = observationSchedule(terms, calendar());
  if (schedule.kind !== "estimated") throw new Error("estimated schedule");
  return schedule.entries.map((entry) => entry.date);
}

export function listedTerms(): Terms {
  const terms = baseTerms();
  const dates = entryDates().slice(0, 18);
  terms.dates.observation_schedule = dates.map((date) => primary(date));
  terms.dates.observation_schedule.push(primary("2031-02-26"));
  return terms;
}

export interface GoldenInput {
  synthetic: boolean;
  case: string;
  asOf: string;
  calendar: string;
  terms: Terms;
  schedule: unknown;
  closes: Close[];
}

export function goldenIds(): string[] {
  const root = `${repoRoot()}/fixtures/golden`;
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function readGolden(id: string): { yaml: string; input: GoldenInput; expectedText: string } {
  const dir = `${repoRoot()}/fixtures/golden/${id}`;
  const yaml = readFileSync(`${dir}/terms.yaml`, "utf8");
  const input = JSON.parse(readFileSync(`${dir}/input.json`, "utf8")) as GoldenInput;
  const expectedText = readFileSync(`${dir}/expected/result.json`, "utf8");
  return { yaml, input, expectedText };
}

test("base terms load at schema 0.2", () => {
  const terms = baseTerms();
  expect(terms.schema).toBe("mln-terms/0.2");
  expect(terms.dates.final_valuation?.status).toBe("primary");
  expect(listedTerms().dates.observation_schedule).toHaveLength(19);
});
