// @ts-expect-error TS2591
import { cpSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
// @ts-expect-error TS2591
import { tmpdir } from "node:os";
// @ts-expect-error TS2591
import { join } from "node:path";
import { expect, test } from "vitest";
// @ts-expect-error TS7016
import { cusipCheckDigit } from "../../../tools/tripwire/scan.mjs";
// @ts-expect-error TS7016
import { assertScanClean, drawAllowed, drawSeededClose, regen, scanTree, seededValueRejected } from "../../../tools/generators/golden/generate.mjs";
import { repoRoot } from "./test-support/access.test.ts";

function plantedCusip(): string {
  const body = `${"0".repeat(7)}A`;
  return `${body}${cusipCheckDigit(body)}`;
}

test("a seeded CUSIP is rejected and stops after 64 draws", () => {
  const token = plantedCusip();
  expect(seededValueRejected(token)).toBe("cusip");
  expect(seededValueRejected(`1${"0".repeat(8)}`)).toBe("digits");
  expect(seededValueRejected("1.25")).toBeNull();
  expect(drawAllowed("g-clean", () => "1.25")).toBe("1.25");
  expect(() => drawAllowed("g-planted", () => token)).toThrow(/g-planted/);
});

test("a rejected value is drawn again, 64 times at most", () => {
  const token = plantedCusip();
  let draws = 0;
  expect(() =>
    drawAllowed("g-planted", () => {
      draws += 1;
      return token;
    }),
  ).toThrow(/g-planted/);
  expect(draws).toBe(64);
  const queue = [token, token, "1.25"];
  let taken = 0;
  const value = drawAllowed("g-second", () => {
    taken += 1;
    return queue.shift();
  });
  expect(value).toBe("1.25");
  expect(taken).toBe(3);
});

test("a scan error is an error", () => {
  expect(() => assertScanClean({ error: "origin/main unavailable", hits: [] })).toThrow(/tripwire error/);
});

test("a planted token is a hit only after the new file is committed", () => {
  const dir = mkdtempSync(join(tmpdir(), "keel-plant-"));
  writeFileSync(join(dir, "planted.txt"), `${plantedCusip()}\n`);
  let message = "";
  try {
    scanTree(dir, repoRoot());
  } catch (error) {
    message = error instanceof Error ? error.message : "";
  }
  expect(message).toMatch(/cusip/);
});

/** A root holding only what the generator reads: the base terms and the tripwire's two policy files. */
function generatorRoot(allowlist: string | null): string {
  const root = mkdtempSync(join(tmpdir(), "keel-regen-")) as string;
  mkdirSync(join(root, "fixtures/synthetic/terms/valid"), { recursive: true });
  mkdirSync(join(root, "tools/tripwire"), { recursive: true });
  cpSync(join(repoRoot(), "fixtures/synthetic/terms/valid/minimal.yaml"), join(root, "fixtures/synthetic/terms/valid/minimal.yaml"));
  cpSync(join(repoRoot(), "tools/tripwire/vendors.txt"), join(root, "tools/tripwire/vendors.txt"));
  if (allowlist === null) cpSync(join(repoRoot(), "tools/tripwire/allowlist.txt"), join(root, "tools/tripwire/allowlist.txt"));
  else writeFileSync(join(root, "tools/tripwire/allowlist.txt"), allowlist);
  return root;
}

test("regen scans what it wrote, and a hit stops it", () => {
  const clean = generatorRoot(null);
  const flagged = generatorRoot("not an allowlist line\n");
  try {
    regen(clean);
    expect((readdirSync(join(clean, "fixtures/golden")) as string[]).sort()).toHaveLength(11);
    let message = "";
    try {
      regen(flagged);
    } catch (error) {
      message = error instanceof Error ? error.message : "";
    }
    expect(message).toMatch(/^tripwire hit: tools\/tripwire\/allowlist\.txt allowlist$/);
  } finally {
    rmSync(clean, { recursive: true, force: true });
    rmSync(flagged, { recursive: true, force: true });
  }
}, 60_000);

test("the seeded close uses the ratio from a new draw after rejection", () => {
  const tooLarge = { p: 1n, q: 1n };
  const accepted = { p: 1n, q: 2n };
  let draws = 0;
  const result = drawSeededClose("g-redraw", "100000000", { mode: "none" }, () => {
    draws += 1;
    return draws === 1 ? tooLarge : accepted;
  });
  expect(result).toEqual({ value: "50000000", ratio: accepted });
  expect(draws).toBe(2);
});
