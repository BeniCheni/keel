import { expect, test } from "vitest";
import { nyseRulesCalendar } from "../index.ts";

declare const crypto: {
  subtle: {
    digest(algorithm: "SHA-256", data: Uint8Array): Promise<ArrayBuffer>;
  };
};

async function sha256Hex(text: string): Promise<string> {
  const bytes = new Uint8Array(text.length);
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    bytes[index] = code;
  }
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

const FROZEN_HASH = "e438df993de99cc780739a56901ea276353bc094675a0800cf1ac500a28d5fd5";

const YEARS: Record<string, string> = {
  "2026": "01-01 01-19 02-16 04-03 05-25 06-19 07-03 09-07 11-26 12-25",
  "2027": "01-01 01-18 02-15 03-26 05-31 06-18 07-05 09-06 11-25 12-24",
  "2028": "01-17 02-21 04-14 05-29 06-19 07-04 09-04 11-23 12-25",
  "2029": "01-01 01-15 02-19 03-30 05-28 06-19 07-04 09-03 11-22 12-25",
  "2034": "01-02 01-16 02-20 04-07 05-29 06-19 07-04 09-04 11-23 12-25",
  "2035": "01-01 01-15 02-19 03-23 05-28 06-19 07-04 09-03 11-22 12-25",
  "2038": "01-01 01-18 02-15 04-23 05-31 06-18 07-05 09-06 11-25 12-24",
  "2060": "01-01 01-19 02-16 04-16 05-31 06-18 07-05 09-06 11-25 12-24",
};

test("nyseRulesCalendar matches the frozen closures", async () => {
  const calendar = nyseRulesCalendar();
  expect(calendar.id).toBe("nyse-rules-1");
  expect(calendar.fromYear).toBe(2026);
  expect(calendar.toYear).toBe(2060);
  expect(calendar.closures).toHaveLength(345);
  const text = calendar.closures.map((closure) => `${closure.date} ${closure.name}\n`).join("");
  expect(await sha256Hex(text)).toBe(FROZEN_HASH);
  for (const [year, expected] of Object.entries(YEARS)) {
    const got = calendar.closures
      .filter((closure) => closure.date.startsWith(`${year}-`))
      .map((closure) => closure.date.slice(5))
      .join(" ");
    expect(got, year).toBe(expected);
  }
  const seen = new Set<string>();
  let previous = "";
  for (const closure of calendar.closures) {
    expect(seen.has(closure.date), closure.date).toBe(false);
    seen.add(closure.date);
    expect(closure.date > previous, closure.date).toBe(true);
    previous = closure.date;
    const [year, month, day] = closure.date.split("-").map(Number);
    const dow = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)).getUTCDay();
    expect(dow, closure.date).toBeGreaterThan(0);
    expect(dow, closure.date).toBeLessThan(6);
  }
});

test("a Saturday New Year does not close the Friday before", () => {
  const dates = nyseRulesCalendar().closures.map((closure) => closure.date);
  expect(dates).not.toContain("2027-12-31");
  expect(dates).not.toContain("2028-01-01");
});

test("a Sunday holiday is observed on the Monday after", () => {
  const closures = nyseRulesCalendar().closures;
  expect(closures).toContainEqual({ date: "2027-07-05", name: "Independence Day" });
  expect(closures.map((closure) => closure.date)).not.toContain("2027-07-02");
  expect(closures.map((closure) => closure.date)).not.toContain("2027-07-04");
});

test("Good Friday is two days before Easter Sunday", () => {
  const dates = new Set(nyseRulesCalendar().closures.map((closure) => closure.date));
  for (const date of ["2026-04-03", "2027-03-26", "2028-04-14", "2029-03-30", "2034-04-07", "2035-03-23", "2038-04-23", "2060-04-16"]) {
    expect(dates.has(date), date).toBe(true);
  }
  expect(dates.has("2026-04-02")).toBe(false);
  expect(dates.has("2026-04-04")).toBe(false);
});

test("Memorial Day is the last Monday of May", () => {
  const dates = nyseRulesCalendar().closures.map((closure) => closure.date);
  expect(dates).toContain("2027-05-31");
  expect(dates).not.toContain("2027-05-24");
});

test("Thanksgiving in 2029 is the fourth Thursday of November", () => {
  const dates = nyseRulesCalendar().closures.map((closure) => closure.date);
  expect(dates).toContain("2029-11-22");
  expect(dates).not.toContain("2029-11-29");
});
