export const PRINCIPAL_CENTS = 100000;

const DECIMAL = /^(0|[1-9][0-9]{0,9})(\.[0-9]{1,6})?$/;
const RATIO = /^(0|[1-9][0-9]*)\/([1-9][0-9]*)$/;
const ROUNDING = /^(none|(half-up|half-even|truncate)-([0-6])dp)$/;

export interface Frac {
  p: bigint;
  q: bigint;
}

export type Rounding =
  | { mode: "none" }
  | { mode: "half-up" | "half-even" | "truncate"; places: number };

export function gcd(left: bigint, right: bigint): bigint {
  let a = left < 0n ? -left : left;
  let b = right < 0n ? -right : right;
  while (b !== 0n) {
    const next = a % b;
    a = b;
    b = next;
  }
  return a;
}

export function reduce(p: bigint, q: bigint): Frac {
  if (q < 0n) {
    p = -p;
    q = -q;
  }
  if (p < 0n) p = -p;
  const divisor = gcd(p, q);
  return { p: p / divisor, q: q / divisor };
}

export function parseDecimal(text: string): Frac | null {
  if (!DECIMAL.test(text)) return null;
  const dot = text.indexOf(".");
  const whole = dot === -1 ? text : text.slice(0, dot);
  const frac = dot === -1 ? "" : text.slice(dot + 1);
  const digits = `${whole}${frac}`;
  const scale = 10n ** BigInt(frac.length);
  return reduce(BigInt(digits), scale);
}

export function parseRatio(text: string): Frac | null {
  const match = RATIO.exec(text);
  if (match === null) return null;
  const num = match[1];
  const den = match[2];
  if (num === undefined || den === undefined) return null;
  return reduce(BigInt(num), BigInt(den));
}

export function formatRatio(frac: Frac): string {
  const reduced = reduce(frac.p, frac.q);
  return `${reduced.p.toString()}/${reduced.q.toString()}`;
}

export function parseRounding(text: string): Rounding | null {
  const match = ROUNDING.exec(text);
  if (match === null) return null;
  if (match[1] === "none") return { mode: "none" };
  const mode = match[2];
  const places = match[3];
  if (mode !== "half-up" && mode !== "half-even" && mode !== "truncate") return null;
  if (places === undefined) return null;
  return { mode, places: Number(places) };
}

export function cmpFrac(left: Frac, right: Frac): number {
  const diff = left.p * right.q - right.p * left.q;
  if (diff < 0n) return -1;
  if (diff > 0n) return 1;
  return 0;
}

export function isZero(frac: Frac): boolean {
  return frac.p === 0n;
}

export function addFrac(left: Frac, right: Frac): Frac {
  return reduce(left.p * right.q + right.p * left.q, left.q * right.q);
}

export function subFrac(left: Frac, right: Frac): Frac {
  return reduce(left.p * right.q - right.p * left.q, left.q * right.q);
}

export function mulFrac(left: Frac, right: Frac): Frac {
  return reduce(left.p * right.p, left.q * right.q);
}

export function divFrac(left: Frac, right: Frac): Frac {
  if (right.p === 0n) throw new Error("zero divisor");
  return reduce(left.p * right.q, left.q * right.p);
}

function floorDiv(num: bigint, den: bigint): bigint {
  return num / den;
}

/** Round a non-negative scaled ratio num/den to an integer. */
export function roundScaled(num: bigint, den: bigint, mode: "truncate" | "half-up" | "half-even"): bigint {
  if (mode === "truncate") return floorDiv(num, den);
  if (mode === "half-up") return floorDiv(num * 2n + den, den * 2n);
  const quot = floorDiv(num, den);
  const rem = num % den;
  const twice = rem * 2n;
  if (twice < den) return quot;
  if (twice > den) return quot + 1n;
  if (quot % 2n === 0n) return quot;
  return quot + 1n;
}

export function roundRatio(frac: Frac, rounding: Rounding): Frac {
  if (rounding.mode === "none") return reduce(frac.p, frac.q);
  const scale = 10n ** BigInt(rounding.places);
  const rounded = roundScaled(frac.p * scale, frac.q, rounding.mode);
  return reduce(rounded, scale);
}

/** Half up, once, to an integer cent. */
export function centsHalfUp(amount: Frac): number {
  const rounded = floorDiv(amount.p * 2n + amount.q, amount.q * 2n);
  const asNumber = Number(rounded);
  if (BigInt(asNumber) !== rounded) throw new Error("cent magnitude");
  return asNumber;
}

export function premiumCents(rate: number, months: number): number {
  const amount = {
    p: BigInt(PRINCIPAL_CENTS) * BigInt(rate) * BigInt(months),
    q: 120000n,
  };
  return centsHalfUp(amount);
}

export function principalPlusPremium(rate: number, months: number): number {
  return PRINCIPAL_CENTS + premiumCents(rate, months);
}

export function oneForOneCents(ratio: Frac): number {
  return centsHalfUp(mulFrac({ p: BigInt(PRINCIPAL_CENTS), q: 1n }, ratio));
}

export function levelRatio(basisPoints: number): Frac {
  return reduce(BigInt(basisPoints), 10000n);
}

export function ratiosEqual(left: Frac, right: Frac): boolean {
  return cmpFrac(left, right) === 0;
}

/** Half up to `places` decimal places, without trailing zeros. */
export function formatDecimal(frac: Frac, places: number): string {
  const scale = 10n ** BigInt(places);
  const rounded = roundScaled(frac.p * scale, frac.q, "half-up");
  const digits = rounded.toString().padStart(places + 1, "0");
  const whole = digits.slice(0, digits.length - places).replace(/^0+(?=\d)/, "");
  const fraction = digits.slice(digits.length - places).replace(/0+$/, "");
  return fraction.length === 0 ? whole : `${whole}.${fraction}`;
}
