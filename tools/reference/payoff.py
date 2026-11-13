#!/usr/bin/env python3
"""Independent S03 reference for the precomputed schedules in golden inputs."""

import json
import re
import sys
from calendar import monthrange
from datetime import date
from fractions import Fraction
from pathlib import Path


PRINCIPAL = 100_000
EVIDENCED = {"primary", "document", "advisor", "user"}
UNRESOLVED = {"unknown", "conflict"}
STEPS = {"monthly": 1, "quarterly": 3, "semiannual": 6, "annual": 12}
DATE_PATHS = (
    "dates.trade", "dates.settlement", "dates.maturity",
    "dates.first_call_observation",
)
TERM_PATHS = (
    "underlyings.performance_rounding", "call.level", "call.non_call_months",
    "call.frequency", "premium.rate_per_year", "premium.accrual",
    "barrier.level", "barrier.observation", "barrier.below_barrier",
)
METRIC_PATHS = ("underlyings.performance_rounding", "call.level", "barrier.level")
DECIMAL = re.compile(r"(0|[1-9][0-9]{0,9})(\.[0-9]{1,6})?")
SOURCE = re.compile(r"[a-z0-9][a-z0-9-]{0,63}")
DATE = re.compile(r"[0-9]{4}-[0-9]{2}-[0-9]{2}")


def reason(code, **fields):
    return {"code": code, **fields}


def unavailable(reasons):
    return {"kind": "unavailable", "reasons": reasons}


def term(terms, path):
    group, field = path.split(".")
    return terms[group][field]


def value(terms, path):
    return term(terms, path)["value"]


def valid_date(text):
    if not DATE.fullmatch(text):
        return False
    try:
        date.fromisoformat(text)
    except ValueError:
        return False
    return True


def readable_closes(data):
    tickers = {member["ticker"] for member in data["terms"]["underlyings"]["members"]}
    return [
        (index, close) for index, close in enumerate(data["closes"])
        if close["ticker"] in tickers and close["date"] <= data["asOf"]
    ]


def close_findings(as_of, closes):
    findings = [] if valid_date(as_of) else [reason("as-of-invalid")]
    for index, close in closes:
        if (
            not valid_date(close["date"])
            or not DECIMAL.fullmatch(close["value"])
            or not Fraction(close["value"])
            or not SOURCE.fullmatch(close["source"])
        ):
            findings.append(reason("close-invalid", index=index))
    return findings


def term_findings(terms, paths):
    findings = []
    for path in paths:
        status = term(terms, path)["status"]
        if status in UNRESOLVED:
            findings.append(reason("input-" + status, path=path))
        elif path in DATE_PATHS and status not in EVIDENCED:
            findings.append(reason("input-unevidenced", path=path))
    return findings


def variant_findings(terms):
    variants = (
        ("premium.accrual", "compound", "accrual-compound"),
        ("barrier.observation", "daily-close", "barrier-daily-close"),
        ("barrier.observation", "continuous", "barrier-continuous"),
        ("barrier.below_barrier", "physical-delivery", "below-barrier-physical-delivery"),
    )
    return [
        reason(code, path=path) for path, variant, code in variants
        if value(terms, path) == variant
    ]


def ratio_text(value):
    return f"{value.numerator}/{value.denominator}"


def half_up(value):
    return (value + Fraction(1, 2)) // 1


def rounded(value, rule):
    if rule == "none":
        return value
    method, places = rule.rsplit("-", 1)
    scale = 10 ** int(places[:-2])
    scaled = value * scale
    if method == "half-up":
        integer = half_up(scaled)
    elif method == "half-even":
        integer = round(scaled)
    else:
        integer = scaled // 1
    return Fraction(integer, scale)


def add_months(start, months):
    year, month = divmod(start.year * 12 + start.month - 1 + months, 12)
    month += 1
    return date(year, month, min(start.day, monthrange(year, month)[1]))


def nearest_slot(anchor, target, step):
    anchor = date.fromisoformat(anchor)
    target = date.fromisoformat(target)
    months = (target.year - anchor.year) * 12 + target.month - anchor.month
    center = max(0, months // step)
    candidates = range(max(0, center - 1), center + 2)
    distances = sorted(
        (abs((target - add_months(anchor, slot * step)).days), slot)
        for slot in candidates if anchor.year * 12 + anchor.month - 1 + slot * step < 120_000
    )
    best_distance, best_slot = distances[0]
    if len(distances) > 1 and distances[1][0] == best_distance:
        return None
    return best_slot


def premium_payout(terms, months):
    rate = value(terms, "premium.rate_per_year")
    return PRINCIPAL + half_up(Fraction(PRINCIPAL * rate * months, 120_000))


def levels(terms):
    return (
        Fraction(value(terms, "call.level"), 10_000),
        Fraction(value(terms, "barrier.level"), 10_000),
    )


def final_outcome(terms, ratio, months):
    call, barrier = levels(terms)
    if ratio >= call:
        return "final-above-call", premium_payout(terms, months)
    if ratio >= barrier:
        return "final-at-or-above-barrier", PRINCIPAL
    return "final-below-barrier", half_up(PRINCIPAL * ratio)


def final_reason(final_term):
    status = final_term["status"] if final_term is not None else "absent"
    return reason("final-valuation-" + status)


def observation_events(terms, schedule):
    final_term = terms["dates"].get("final_valuation")
    final_date = final_term.get("value") if final_term else None
    listed = schedule["kind"] == "listed"
    step = STEPS[value(terms, "call.frequency")]
    base = value(terms, "call.non_call_months")
    events = []
    left_out = 0
    evidence_after = False
    later_evidenced = set()
    if listed:
        for entry in reversed(schedule["entries"]):
            if evidence_after:
                later_evidenced.add(entry["index"])
            if entry.get("date") and entry["term"]["status"] in EVIDENCED:
                evidence_after = True
    for entry in schedule["entries"]:
        index = entry["index"]
        day = entry.get("date")
        origin = "listed" if listed else entry["origin"]
        status = entry["term"]["status"] if listed else entry["status"]
        kind = "call"
        if final_date is not None:
            if day == final_date:
                if listed:
                    break
                continue
            if not listed and day > final_date:
                left_out += 1
                continue
        elif final_term and final_term["status"] == "conflict":
            if day is None or any(day >= item["value"] for item in final_term["candidates"]):
                kind = "observation"
        elif index not in later_evidenced:
            kind = "observation"
        events.append({
            "kind": kind, "scheduleIndex": index, "date": day, "dateOrigin": origin,
            "dateStatus": status, "premiumMonths": base + index * step,
            "evidenced": day is not None and origin != "generated" and status in EVIDENCED,
        })
    if final_date is not None:
        events.append({
            "kind": "final", "scheduleIndex": None, "date": final_date,
            "dateOrigin": "final-valuation", "dateStatus": final_term["status"],
            "premiumMonths": base + len(events) * step,
            "evidenced": final_term["status"] in EVIDENCED,
        })
    return events, left_out


def mapping_findings(terms, schedule, events, require_final):
    trade, settlement, maturity, first = (value(terms, path) for path in DATE_PATHS)
    step = STEPS[value(terms, "call.frequency")]
    final = events[-1] if events and events[-1]["kind"] == "final" else None
    dated = [
        (entry["index"], entry["date"]) for entry in schedule["entries"]
        if entry.get("date") is not None
    ] if schedule["kind"] == "listed" else []
    findings = []
    if settlement < trade:
        findings.append(reason("settlement-before-trade"))
    if first <= settlement:
        findings.append(reason("first-call-before-settlement"))
    if final:
        if final["date"] < first:
            findings.append(reason("final-valuation-before-first-call"))
        if final["date"] > maturity:
            findings.append(reason("final-valuation-after-maturity"))
    for index, day in dated:
        if day < first:
            findings.append(reason("observation-before-first-call", index=index))
    for index, day in dated:
        if day > maturity:
            findings.append(reason("listed-after-maturity", index=index))
    if final and schedule["kind"] == "listed":
        seen_final = False
        for entry in schedule["entries"]:
            day = entry.get("date")
            if seen_final or (day is not None and day > final["date"]):
                findings.append(reason("listed-after-final-valuation", index=entry["index"]))
            if day == final["date"]:
                seen_final = True
    if nearest_slot(settlement, first, 1) != value(terms, "call.non_call_months"):
        findings.append(reason("non-call-months-mismatch"))
    for index, day in dated:
        if nearest_slot(first, day, step) != index:
            findings.append(reason("listed-off-cycle", index=index))
    if final and nearest_slot(first, final["date"], step) != len(events) - 1:
        findings.append(reason("final-valuation-off-cycle"))
    if not final and require_final:
        findings.append(final_reason(terms["dates"].get("final_valuation")))
    return findings


def prepare(terms, schedule, require_final):
    findings = term_findings(terms, DATE_PATHS + TERM_PATHS)
    if findings:
        return unavailable(findings), [], 0
    findings = variant_findings(terms)
    if findings:
        return {"kind": "unsupported", "reasons": findings}, [], 0
    if schedule["kind"] == "unavailable":
        return unavailable([reason("schedule-unavailable", reasons=schedule["reasons"])]), [], 0
    events, left_out = observation_events(terms, schedule)
    findings = mapping_findings(terms, schedule, events, require_final)
    return (unavailable(findings) if findings else None), events, left_out


def provenance(terms, *, metrics=False, member_levels=True):
    paths = []
    if not metrics:
        paths.extend(
            path for path in DATE_PATHS if term(terms, path)["status"] != "primary"
        )
        dates = terms["dates"]
        if dates.get("final_valuation", {}).get("status") != "primary":
            paths.append("dates.final_valuation")
        listed = dates.get("observation_schedule")
        if not listed or any(item["status"] != "primary" for item in listed):
            paths.append("dates.observation_schedule")
    if member_levels:
        paths.extend(
            f"underlyings.members[{index}].initial"
            for index, member in enumerate(terms["underlyings"]["members"])
            if member["initial"]["status"] != "primary"
        )
    paths.extend(
        path for path in (METRIC_PATHS if metrics else TERM_PATHS)
        if term(terms, path)["status"] != "primary"
    )
    return {"unverified": paths, "provisional": bool(paths)}


def assumptions(events, left_out):
    result = [
        reason("per-1000-principal"), reason("cents-half-up"),
        reason("premium-months-by-index"),
    ]
    if events and events[-1]["kind"] == "final":
        result.append(reason("final-call-then-barrier"))
    if left_out:
        result.append(reason("estimated-after-final-valuation-left-out", count=left_out))
    return result


def member_trace(terms, closes, day):
    members = []
    reasons = []
    rounding = value(terms, "underlyings.performance_rounding")
    for member in terms["underlyings"]["members"]:
        ticker = member["ticker"]
        initial = member["initial"]
        matching = [
            close for _, close in closes
            if close["ticker"] == ticker and close["date"] == day
        ]
        distinct = {}
        for close in matching:
            distinct.setdefault(Fraction(close["value"]), close["value"])
        spelling = next(iter(distinct.values())) if len(distinct) == 1 else None
        ratio = None
        if initial["status"] in UNRESOLVED:
            reasons.append(reason("initial-" + initial["status"], ticker=ticker))
        elif not distinct:
            reasons.append(reason("close-missing", ticker=ticker))
        elif len(distinct) > 1:
            reasons.append(reason("close-conflict", ticker=ticker, values=list(distinct.values())))
        else:
            ratio = ratio_text(rounded(Fraction(spelling) / Fraction(initial["value"]), rounding))
        members.append({
            "ticker": ticker, "close": spelling,
            "sources": [close["source"] for close in matching], "ratio": ratio,
        })
    if reasons:
        return members, reasons, None
    worst = min(members, key=lambda member: Fraction(member["ratio"]))
    return members, reasons, {"ticker": worst["ticker"], "ratio": worst["ratio"]}


def observe(terms, closes, event, index):
    members, reasons, worst = member_trace(terms, closes, event["date"])
    payout = None
    if reasons:
        outcome = "unknown"
    else:
        ratio = Fraction(worst["ratio"])
        if event["kind"] == "final":
            outcome, payout = final_outcome(terms, ratio, event["premiumMonths"])
        elif ratio >= levels(terms)[0]:
            outcome, payout = "called", premium_payout(terms, event["premiumMonths"])
        else:
            outcome = "not-called"
    row = {key: item for key, item in event.items() if key != "evidenced"}
    return {
        **row, "index": index, "members": members, "worst": worst,
        "outcome": outcome, "payoutCents": payout, "reasons": reasons,
    }


def next_event(event):
    return {key: event[key] for key in ("kind", "scheduleIndex", "date", "evidenced")}


def walk(terms, events, closes, as_of):
    rows = []
    final_term = terms["dates"].get("final_valuation")
    for event in events:
        day = event["date"]
        index = event["scheduleIndex"]
        if day is None:
            lower_bound = rows[-1]["date"] if rows else value(terms, "dates.settlement")
            if as_of <= lower_bound:
                return rows, "live", next_event(event), []
            return rows, "unknown", None, [reason("date-unknown", index=index)]
        if day > as_of:
            return rows, "live", next_event(event), []
        if event["kind"] == "observation":
            return rows, "unknown", None, [final_reason(final_term)]
        if not event["evidenced"]:
            return rows, "unknown", None, [reason("estimated-date", scheduleIndex=index, date=day)]
        row = observe(terms, closes, event, len(rows))
        rows.append(row)
        if row["outcome"] in {"called", "unknown"}:
            return rows, row["outcome"], None, row["reasons"]
        if row["kind"] == "final":
            maturity = terms["dates"]["maturity"]
            if as_of >= maturity["value"]:
                return rows, "matured", None, []
            following = {
                "kind": "maturity", "scheduleIndex": None, "date": maturity["value"],
                "evidenced": maturity["status"] in EVIDENCED,
            }
            return rows, "final-fixed", following, []
    return rows, "unknown", None, [final_reason(final_term)]


def evaluate(data, closes):
    terms, schedule, as_of = data["terms"], data["schedule"], data["asOf"]
    findings = close_findings(as_of, closes)
    if findings:
        return unavailable(findings)
    stopped, events, left_out = prepare(terms, schedule, require_final=False)
    if stopped:
        return stopped
    rows, status, following, reasons = walk(terms, events, closes, as_of)
    payout = rows[-1]["payoutCents"] if status in {"called", "final-fixed", "matured"} else None
    return {
        "kind": "evaluated", "asOf": as_of, "calendar": data["calendar"],
        "schedule": schedule["kind"], "status": status, "rows": rows, "next": following,
        "payoutCents": payout, "reasons": reasons, **provenance(terms),
        "assumptions": assumptions(events, left_out),
    }


def payout_schedule(data):
    terms, schedule = data["terms"], data["schedule"]
    stopped, events, left_out = prepare(terms, schedule, require_final=True)
    if stopped:
        return stopped
    calls = [
        {
            **{key: event[key] for key in ("scheduleIndex", "date", "evidenced", "premiumMonths")},
            "payoutCents": premium_payout(terms, event["premiumMonths"]),
        }
        for event in events[:-1]
    ]
    final = events[-1]
    return {
        "kind": "payouts", "calendar": data["calendar"], "schedule": schedule["kind"],
        "calls": calls, "final": {
            "date": final["date"], "evidenced": final["evidenced"],
            "premiumMonths": final["premiumMonths"],
            "aboveCallCents": premium_payout(terms, final["premiumMonths"]),
            "atOrAboveBarrierCents": PRINCIPAL,
        },
        **provenance(terms, member_levels=False), "assumptions": assumptions(events, left_out),
    }


def metrics(data, closes):
    terms, as_of = data["terms"], data["asOf"]
    findings = close_findings(as_of, closes) or term_findings(terms, METRIC_PATHS)
    if findings:
        return unavailable(findings)
    if not closes:
        return unavailable([reason("no-close")])
    day = max(close["date"] for _, close in closes)
    members, findings, worst = member_trace(terms, closes, day)
    if findings:
        return unavailable(findings)
    ratio = Fraction(worst["ratio"])
    call, barrier = levels(terms)
    to_call = ratio_text(max(call / ratio - 1, Fraction(0))) if ratio else None
    return {
        "kind": "metrics", "asOf": as_of, "date": day, "members": members, "worst": worst,
        "toBarrier": ratio_text(1 - barrier / ratio) if ratio > barrier else "0/1",
        "toCall": to_call,
        "belowBarrier": ratio < barrier, "atOrAboveCall": ratio >= call,
        **provenance(terms, metrics=True),
    }


def first_difference(actual, expected, path="$"):
    if type(actual) is not type(expected):
        return path
    if isinstance(actual, dict):
        for key in dict.fromkeys([*expected, *actual]):
            field = f"{path}.{key}"
            if key not in actual or key not in expected:
                return field
            difference = first_difference(actual[key], expected[key], field)
            if difference is not None:
                return difference
    elif isinstance(actual, list):
        for index, (actual_item, expected_item) in enumerate(zip(actual, expected)):
            difference = first_difference(actual_item, expected_item, f"{path}[{index}]")
            if difference is not None:
                return difference
        if len(actual) != len(expected):
            return f"{path}[{min(len(actual), len(expected))}]"
    elif actual != expected:
        return path
    return None


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def compare(root):
    disagreements = 0
    cases = sorted(folder for folder in root.iterdir() if folder.is_dir())
    for case in cases:
        data = read_json(case / "input.json")
        closes = readable_closes(data)
        actual = {
            "synthetic": True, "case": case.name,
            "evaluation": evaluate(data, closes), "payouts": payout_schedule(data),
            "metrics": metrics(data, closes),
        }
        expected = read_json(case / "expected" / "result.json")
        difference = first_difference(actual, expected)
        if difference is None:
            print(f"{case.name}: agree")
        else:
            print(f"{case.name}: disagree {difference}")
            disagreements += 1
    print(f"cases {len(cases)}, disagreements {disagreements}")
    return int(disagreements != 0 or len(cases) < 11)


def main():
    if len(sys.argv) != 2:
        print("usage: payoff.py GOLDEN_FOLDER", file=sys.stderr)
        return 2
    try:
        return compare(Path(sys.argv[1]))
    except (OSError, ValueError, KeyError, TypeError, ArithmeticError) as error:
        print(f"Cannot read golden cases: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
