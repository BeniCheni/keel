import type { Term, Terms } from "@keel/core";

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function primary<T>(value: T): Term<T> {
  return { value, status: "primary", source: "supplement" };
}

export function sourced<T>(value: T, status: "primary" | "document" | "advisor"): Term<T> {
  return { value, status, source: "supplement" };
}

export function estimate<T>(value: T): Term<T> {
  return { value, status: "estimate", rule: "stated" };
}

export function assumed<T>(value: T): Term<T> {
  return { value, status: "assumed", note: "stated" };
}

export function unknownTerm(): { value: null; status: "unknown" } {
  return { value: null, status: "unknown" };
}

export function conflictTerm<T>(left: T, right: T): Term<T> {
  return {
    status: "conflict",
    candidates: [
      { value: left, status: "primary", source: "supplement" },
      { value: right, status: "primary", source: "supplement" },
    ],
  };
}

export function dropFinal(terms: Terms): Terms {
  const next = clone(terms);
  delete next.dates.final_valuation;
  return next;
}
