import { loadTerms, observationSchedule } from "@keel/core";
import { expect, test } from "vitest";
import { evaluateNote, noteMetrics, payoutSchedule } from "./index.ts";
import { calendar, goldenIds, readGolden } from "./test-support/access.test.ts";
import type { Evaluation } from "./types.ts";

interface ListedDirent {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
}

// @ts-expect-error TS2591
import { readdirSync as readDirectory } from "node:fs";

const readdirSync = readDirectory as (path: string, options: { withFileTypes: true }) => ListedDirent[];

const IDS = [
  "g01-called-first",
  "g02-called-second",
  "g03-live",
  "g04-final-above-call",
  "g05-final-fixed-par",
  "g06-final-below-boundary",
  "g07-final-deep",
  "g08-unknown-missing",
  "g09-unknown-conflict",
  "g10-truncate-provisional",
  "g11-estimated-stop",
];

function belowCall(ratio: string): boolean {
  const [p, q] = ratio.split("/").map((part) => BigInt(part));
  if (p === undefined || q === undefined) return false;
  return p * 20n < q * 19n;
}

function assertTable(id: string, result: Evaluation): void {
  if (id === "g01-called-first") {
    expect(result.status).toBe("called");
    expect(result.rows).toHaveLength(1);
    expect(result.payoutCents).toBe(104250);
    expect(result.unverified).toEqual(["dates.observation_schedule"]);
    expect(result.rows[0]?.worst).toEqual({ ticker: "BRVO", ratio: "19/20" });
  } else if (id === "g02-called-second") {
    expect(result.status).toBe("called");
    expect(result.rows).toHaveLength(2);
    expect(result.rows[1]?.date).toBe("2026-12-01");
    expect(result.payoutCents).toBe(106375);
    expect(result.rows[0]?.worst).toEqual({ ticker: "CHRL", ratio: "9499/10000" });
    expect(result.rows[1]?.worst).toEqual({ ticker: "DLTA", ratio: "1289/1250" });
  } else if (id === "g03-live") {
    expect(result.status).toBe("live");
    expect(result.rows).toHaveLength(6);
    expect(result.payoutCents).toBeNull();
    expect(result.next).toEqual({ kind: "call", scheduleIndex: 6, date: "2028-03-01", evidenced: true });
    expect(result.rows.every((row) => row.worst !== null && belowCall(row.worst.ratio))).toBe(true);
  } else if (id === "g04-final-above-call") {
    expect(result.status).toBe("matured");
    expect(result.rows).toHaveLength(19);
    expect(result.rows[18]?.outcome).toBe("final-above-call");
    expect(result.rows[18]?.premiumMonths).toBe(60);
    expect(result.payoutCents).toBe(142500);
  } else if (id === "g05-final-fixed-par") {
    expect(result.status).toBe("final-fixed");
    expect(result.rows).toHaveLength(19);
    expect(result.rows[18]?.outcome).toBe("final-at-or-above-barrier");
    expect(result.payoutCents).toBe(100000);
    expect(result.next).toEqual({ kind: "maturity", scheduleIndex: null, date: "2031-03-03", evidenced: true });
  } else if (id === "g06-final-below-boundary") {
    expect(result.status).toBe("matured");
    expect(result.rows[18]?.outcome).toBe("final-below-barrier");
    expect(result.payoutCents).toBe(59990);
  } else if (id === "g07-final-deep") {
    expect(result.status).toBe("matured");
    expect(result.rows[18]?.outcome).toBe("final-below-barrier");
    expect(result.payoutCents).toBe(31420);
  } else if (id === "g08-unknown-missing") {
    expect(result.status).toBe("unknown");
    expect(result.rows).toHaveLength(4);
    expect(result.rows[3]?.date).toBe("2027-06-01");
    expect(result.reasons).toEqual([{ code: "close-missing", ticker: "BRVO" }]);
    expect(result.payoutCents).toBeNull();
  } else if (id === "g09-unknown-conflict") {
    expect(result.status).toBe("unknown");
    expect(result.rows).toHaveLength(3);
    expect(result.reasons).toEqual([{ code: "close-conflict", ticker: "CHRL", values: ["116.4", "111.6"] }]);
    expect(result.rows[2]?.members.find((member) => member.ticker === "CHRL")).toMatchObject({
      close: null,
      sources: ["synthetic-a", "synthetic-b"],
    });
  } else if (id === "g10-truncate-provisional") {
    expect(result.status).toBe("called");
    expect(result.payoutCents).toBe(106375);
    expect(result.unverified).toEqual(["underlyings.members[3].initial"]);
    expect(result.rows[0]?.worst).toEqual({ ticker: "BRVO", ratio: "9499/10000" });
    expect(result.rows[1]?.worst).toEqual({ ticker: "ALFA", ratio: "19/20" });
  } else if (id === "g11-estimated-stop") {
    expect(result.status).toBe("unknown");
    expect(result.rows).toHaveLength(1);
    expect(result.reasons).toEqual([{ code: "estimated-date", scheduleIndex: 1, date: "2026-12-01" }]);
    expect(result.payoutCents).toBeNull();
  }
}

test("golden fixtures match the frozen cases", () => {
  const root = `${new URL("../../../fixtures/golden/", import.meta.url).pathname}`;
  expect(goldenIds()).toEqual(IDS);
  const nyse = calendar();
  for (const id of IDS) {
    const names = readdirSync(`${root}${id}`, { withFileTypes: true }).map((entry) => entry.name).sort();
    expect(names, id).toEqual(["expected", "input.json", "terms.yaml"]);
    const expectedNames = readdirSync(`${root}${id}/expected`, { withFileTypes: true }).map((entry) => entry.name);
    expect(expectedNames, id).toEqual(["result.json"]);
    const { yaml, input, expectedText } = readGolden(id);
    expect(yaml.startsWith("schema: mln-terms/0.2\n"), id).toBe(true);
    expect(yaml.includes("identifiers"), id).toBe(false);
    expect(input.synthetic, id).toBe(true);
    expect(input.calendar, id).toBe("nyse-rules-1");
    const loaded = loadTerms(yaml, "terms.yaml");
    expect(loaded.ok, id).toBe(true);
    if (!loaded.ok) continue;
    expect(JSON.stringify(loaded.terms), id).toBe(JSON.stringify(input.terms));
    expect(JSON.stringify(observationSchedule(loaded.terms, nyse)), id).toBe(JSON.stringify(input.schedule));
    const evaluation = evaluateNote(input.terms, nyse, input.closes, input.asOf);
    const payouts = payoutSchedule(input.terms, nyse);
    const metrics = noteMetrics(input.terms, input.closes, input.asOf);
    const text = `${JSON.stringify({ synthetic: true, case: id, evaluation, payouts, metrics }, null, 2)}\n`;
    expect(text, id).toBe(expectedText);
    expect(evaluation.kind, id).toBe("evaluated");
    if (evaluation.kind === "evaluated") assertTable(id, evaluation);
    const parsed = JSON.parse(expectedText) as { synthetic: boolean };
    expect(parsed.synthetic, id).toBe(true);
  }
});
