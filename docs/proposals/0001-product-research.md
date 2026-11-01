# Proposal 0001: Product research for Milestone 1 (scrubbed)

- Status: scrubbed copy, 2026-10-31. The original research report (2026-10-29) stays private because it describes the owner's real holding.
- What was removed: every detail of the owner's holding and accounts (identifiers, issuer, broker, adviser, amounts, dates, underlyings and document references) and every figure derived from them. Worked numbers are restated per $1,000 of notional under illustrative terms, and underlyings use the synthetic tickers ALFA, BRVO, CHRL and DLTA.
- What is here: Sections 1 to 4, 8 and 11 of the original, with their numbering kept, because specs cite story IDs (such as 11.3) and alert IDs (such as A3) from them.
- What is not here: Sections 5 (data and integration feasibility), 6 (architecture options), 7 (open-source plan), 9 (landscape) and 10 (risks and open questions). Section 6's decisions are recorded as ADR-0001 to 0008 in `docs/adr/`; provider research is redone per connector in `docs/providers/`. Cross-references to those sections below point to the private original.
- Authority: the slice specs in `docs/specs/` are the build authority. Where this proposal and a spec differ, the spec wins. This document explains mechanics only and recommends nothing.

## 1. Personas and jobs-to-be-done
Five personas, one anti-persona. P1 is the design partner and the Milestone 1 tiebreaker: when personas conflict, P1's need for honest downside clarity wins over P4's appetite for features. All personas below are ESTIMATE (design hypotheses). P1 is modelled on the project owner's needs, without any of the owner's holdings.

| Persona | Who | Core job (When... I want... so I can...) | Anxieties | What good looks like |
| --- | --- | --- | --- | --- |
| P1 Self-directed investor with adviser-sold products | Technical, plans withdrawals with an adviser and a tax professional; holds a structured note alongside funds and annuities with riders | When I open the app weekly, I want to see in 30 seconds whether anything needs a decision or a call to my advisor, so I can stay disciplined and never be surprised by a date or a barrier | A barrier breach or call happening without a notice; fake precision (a made-up mark); sensitive data leaking from a public repo; being nudged into market-timing | Quiet when nothing changed; every number shows its provenance; the next dated event is always visible; one click to the source document |
| P2 Advisor-assisted investor | Less technical household member or retiree whose advisor picks products | When my advisor proposes or I receive a statement, I want a plain-language picture of what I own and what could go wrong, so I can ask better questions | Jargon; not knowing what to ask; feeling sold to; setup that needs a terminal | File-drop onboarding; a per-holding "how this pays" card; an exportable "questions for my advisor" list |
| P3 Hobbyist contributor | Engineer who found the repo via a LinkedIn post | When I clone the repo, I want it running with synthetic data in under 5 minutes and a clear place to add an instrument or connector, so I can contribute something real in an evening | Accidentally committing real data; unclear scope; legal exposure for "advice"; a review process that ignores PRs | One-command start; fixtures that look real but are fake; ADRs and a plugin contract; labelled good-first-issues |
| P4 Technical power user | Self-hoster, quant-curious, scripts everything | When I want to stress a position my own way, I want the terms file, the engine and the simulator to be scriptable and reproducible, so I can audit every number | Black-box math; vendor lock-in; data I cannot export | YAML/JSON terms with a schema; seeded, deterministic runs; a CLI and headless alert runner; plain-file export |
| P5 Household successor | Spouse or executor who may inherit the monitoring | When I have to take over, I want a one-page summary of each holding, its dates, contacts and documents, so I can act without reconstructing the plan | Not knowing what exists or who to call; deadlines passing unnoticed | A printable "household binder" export; read-only mode; contacts and documents attached to each holding |
| Anti-persona: the trader | Wants signals, intraday alerts, buy or sell calls | Not served | — | The product declines this job by design: no trade buttons, no price-direction alerts, no recommendations |

Why P5 matters (ESTIMATE): structured notes, FIAs and VAs carry dates, riders and contacts that live in one person's head and inbox. Continuity is a retiree job that no tracker in Section 9 treats as first-class, and it costs little to build because it reuses the document store and the export path.

## 2. User stories
65 stories in 12 epics; 48 are Milestone 1 (M1) Musts or Shoulds (35 Musts and 13 Shoulds). The M1 cut is driven by one rule: every M1 story either keeps you from being surprised by a date, a barrier or a call, or keeps the app honest about what it does not know. Priority uses MoSCoW (Must, Should, Could, Won't-for-now). Label is M1, Later, or Cat (category-specific, after M1). Personas are from Section 1.

### E1 Onboarding

| ID | Story | Acceptance criteria | Priority |
| --- | --- | --- | --- |
| 1.1 | As P1, I want first run to create a local data folder and say nothing leaves my machine, so that I trust the app before entering anything. | Shows data path, "no connectors enabled" and the not-advice notice. A test proves zero outbound requests until a connector is enabled. | Must · M1 |
| 1.2 | As P1, I want to add a holding by CUSIP and choose "Market-linked note", so that I start from the identifier on my confirm. | CUSIP check digit validated. Category template loads with every field "unknown". Instrument page reachable in 3 steps or fewer. | Must · M1 |
| 1.3 | As P3, I want a demo mode with a synthetic note and synthetic prices, so that I can see everything without real data. | One command or click. Fictional issuer, CUSIP that is fake by design, persistent "Synthetic data" banner. | Must · M1 |
| 1.4 | As P2, I want to drop my trade confirmation and have the app propose the position, so that I don't type terms by hand. | Parsed on-device. Each extracted field shown beside its source text; I confirm each one. | Should · M1 |
| 1.5 | As P2, I want a plain-language "how this note pays" card generated from the terms, so that I understand what I own. | Card states call rule, premium, barrier and the 60% cliff in under 120 words, with unverified terms flagged inline. | Should · M1 |

### E2 Data import

| ID | Story | Acceptance criteria | Priority |
| --- | --- | --- | --- |
| 2.1 | As P1, I want to import daily closes for the four underlyings from CSV files, so that the app works with zero paid data. | Accepts Date + Close (not Adj Close). Flags any overnight move over 40% as a possible split. Stores source and import time per row. | Must · M1 |
| 2.2 | As P4, I want to plug in my own price API key, so that closes update daily. | Key held in the OS keychain. Connector shows its terms summary and "personal use only" label. CSV path keeps working. | Should · M1 |
| 2.3 | As P1, I want to log a statement price, dealer bid, trade print or estimated value with date and source, so that the value history is honest. | Source type is required. Entry appears on the evidence-of-value timeline (Section 3). | Must · M1 |
| 2.4 | As P1, I want quantity, price, dates, CUSIP and maturity extracted from my broker's trade confirmation PDF on-device, so that the position comes from a document. | Works offline. Account numbers, names and addresses are detected and never persisted. Extraction confidence shown per field. | Should · M1 |
| 2.5 | As P2, I want to import monthly statements to reconcile quantity and catch a holding that disappeared, so that I notice a call even without a notice. | Missing position after an observation date raises the call-reconciliation alert. | Could · Later |

### E3 Terms entry and verification

| ID | Story | Acceptance criteria | Priority |
| --- | --- | --- | --- |
| 3.1 | As P1, I want every term to carry a provenance status, so that I always know what is assumed. | Badge on every field (Section 6 lists the statuses). Header shows "N of M terms verified". Filter "show unverified". | Must · M1 |
| 3.2 | As P1, I want conflicting values kept side by side, so that a discrepancy is surfaced, not overwritten. | When two sources disagree, both values show side by side with their sources until one is chosen with a document. Example: a maturity date that differs between the trade confirmation and an adviser screenshot is resolved to the confirmation's date, with the screenshot's kept as a superseded entry in the change log. A field in conflict can never be "verified". | Must · M1 |
| 3.3 | As P4, I want terms in a versioned YAML file validated by a published JSON Schema, so that I can edit and diff them. | Schema version in the file. Validation errors point to the line. App reloads on save. | Must · M1 |
| 3.4 | As P1, I want estimated observation dates generated from the stated rule until the official schedule arrives, so that I can plan now. | Each generated date tagged ESTIMATE. Replaced in one step when the official list is entered, with a diff. | Must · M1 |
| 3.5 | As P1, I want date sanity checks, so that typos surface. | Weekend and exchange-holiday dates are flagged on entry. | Must · M1 |
| 3.6 | As P1, I want a change log for terms, so that I can audit how any number changed. | Every edit records old value, new value, source, timestamp. | Should · M1 |

### E4 Monitoring

| ID | Story | Acceptance criteria | Priority |
| --- | --- | --- | --- |
| 4.1 | As P1, I want one lifecycle status (Live, not called / Called / Matured / Unknown), so that I know where the note stands. | Derived from observations. "Unknown" whenever an observation date lacks data. | Must · M1 |
| 4.2 | As P1, I want the worst-of level, the worst name, the drop that would breach 60% and the rise needed to reach 95%, so that distance is concrete. | Closing prices only. As-of date shown. Labelled provisional while initial levels are unverified. | Must · M1 |
| 4.3 | As P1, I want an observation log, so that I can verify each call decision myself. | One row per observation: date, four levels, worst, outcome, data source. | Must · M1 |
| 4.4 | As P1, I want the value slot to say "No verified mark" with the evidence I have, so that I am never shown an invented number. | No dollar value appears unless a dated, sourced mark exists. Model output only on the Scenario tab. | Must · M1 |
| 4.5 | As P1, I want a portfolio overview with each holding's next dated event and attention state, so that I see the household at a glance. | One row per holding; sort by next date. | Should · Later |

### E5 Charts

| ID | Story | Acceptance criteria | Priority |
| --- | --- | --- | --- |
| 5.1 | As P1, I want the worst-of chart against the call and barrier lines, so that I see standing and the laggard. | Spec in Section 3, chart 1. | Must · M1 |
| 5.2 | As P1, I want the payoff diagram with a slider, so that I see the 60% cliff and the 95% step. | Spec in Section 3, chart 4. | Must · M1 |
| 5.3 | As P1, I want the observation calendar, so that I see every date and its result. | Spec in Section 3, chart 3. | Must · M1 |
| 5.4 | As P1, I want payout and annualized return by call month, so that I see what an early versus late call earns. | Spec in Section 3, chart 6. | Should · M1 |
| 5.5 | As P1, I want an evidence-of-value timeline, so that I see every real mark and the gaps. | Spec in Section 3, chart 8. | Should · M1 |
| 5.6 | As P2, I want every chart to carry a one-line takeaway and a data-table view, so that I can read it without decoding it. | Takeaway text generated from data; table toggle reachable by keyboard. | Must · M1 |
| 5.7 | As P1, I want a liquidity ladder across all holdings, so that I see when each dollar unlocks. | Spec in Section 3, chart 10. | Should · Later |

### E6 Alerts

| ID | Story | Acceptance criteria | Priority |
| --- | --- | --- | --- |
| 6.1 | As P1, I want a barrier-proximity alert in bands, so that I learn early without daily noise. | Section 4, A1. | Must · M1 |
| 6.2 | As P1, I want reminders before each observation and a result after it, so that no date passes unseen. | Section 4, A3. | Must · M1 |
| 6.3 | As P1, I want a call detected from data and reconciled with the expected payout, so that I don't rely on a mailed notice. | Section 4, A4. | Must · M1 |
| 6.4 | As P1, I want a stale-data alert, so that silence never means "fine" by accident. | Section 4, A8. | Must · M1 |
| 6.5 | As P1, I want a nag while terms are unverified that escalates before the first observation, so that I chase the pricing supplement. | Section 4, A9. | Must · M1 |
| 6.6 | As P1, I want quiet hours and a weekly digest, so that alerts stay rare and calm. | Default quiet 21:00–08:00 local; non-urgent items roll into a Sunday digest. | Must · M1 |
| 6.7 | As P4, I want the same alert checks to run headless from a scheduler, so that alerts fire with the app closed. | check command exits non-zero on firing; identical results to the UI for the same data. | Must · M1 |
| 6.8 | As P1, I want to attach my own pre-commitment to an alert ("below 70%: call my adviser first"), so that the alert reminds me of my plan, not my mood. | Note shown in the notification body and on the alert page. | Should · M1 |
| 6.9 | As P1, I want maturity and issuer-rating alerts, so that slow events still reach me. | Section 4, A5 and A6. | Should · M1 |
| 6.10 | As P1, I want a large-move alert only when it changes the worst name or the band, so that a volatile stock doesn't spam me. | Section 4, A7. | Could · M1 |
| 6.11 | As P1, I want email, phone push and webhook channels, so that I hear about A3/A4 when away. | Section 4 delivery table. | Should · Later |

### E7 Scenario analysis

| ID | Story | Acceptance criteria | Priority |
| --- | --- | --- | --- |
| 7.1 | As P1, I want to shock one name by X% and see the outcome if that held to maturity, so that I see how one stock drives the note. | Deterministic; shows worst name, payout, loss; no probabilities. | Must · M1 |
| 7.2 | As P1, I want to shock all four together, so that I see correlated drawdowns. | Same as 7.1 with one slider. | Must · M1 |
| 7.3 | As P4, I want a seeded Monte Carlo with every assumption on screen, so that I can reproduce and challenge it. | Seed, vols, correlations, drift, steps and run count shown and exportable; output labelled ESTIMATE; disabled until I acknowledge model limits. | Could · M1 |
| 7.4 | As P4, I want a sensitivity grid across vol, correlation and drift, so that one number never stands alone. | Grid of call and breach shares by assumption. | Should · Later |

### E8 Documents

| ID | Story | Acceptance criteria | Priority |
| --- | --- | --- | --- |
| 8.1 | As P1, I want to attach PDFs and images to a holding, so that every source sits beside the numbers. | Stored in the local data folder; SHA-256 recorded; never uploaded. | Must · M1 |
| 8.2 | As P1, I want a field's provenance to cite document and page, so that I can jump to the source. | Click from badge opens the file at that page where the viewer supports it. | Should · M1 |
| 8.3 | As P2, I want local full-text search across documents, so that I find a clause fast. | Offline index. | Could · Later |

### E9 Export

| ID | Story | Acceptance criteria | Priority |
| --- | --- | --- | --- |
| 9.1 | As P4, I want terms, observations and alerts exported as YAML and CSV, so that nothing is locked in. | Round-trip import reproduces the same state. | Must · M1 |
| 9.2 | As P1, I want a "questions for my advisor" export built from unverified and conflicting fields, so that my next call with my adviser is efficient. | Markdown list, ranked, each with the field, current value and source. | Should · M1 |
| 9.3 | As P1, I want backup and restore of the whole data folder, so that a laptop failure loses nothing. | One archive; restore verified by checksum. | Should · M1 |
| 9.4 | As P5, I want a printable household binder, so that I can take over if needed. | One page per holding: what, dates, contacts, documents. | Could · Later |

### E10 Privacy and security

| ID | Story | Acceptance criteria | Priority |
| --- | --- | --- | --- |
| 10.1 | As P1, I want no telemetry and a log of every outbound request, so that I can check privacy myself. | Network log lists host, time, purpose. | Must · M1 |
| 10.2 | As P1, I want imported documents scrubbed of account numbers, SSN fragments, names and addresses before anything is stored as structured data, so that PII never lands in the database. | Detector tests cover a common broker confirmation layout; the original PDF stays only in the local document store. | Must · M1 |
| 10.3 | As P1, I want a share-safe mode that masks amounts and CUSIPs, so that I can post screenshots for build-in-public. | One toggle; masks every currency value and identifier. | Should · M1 |
| 10.4 | As P1, I want optional at-rest encryption, so that a stolen laptop exposes less. | M1 documents reliance on OS full-disk encryption instead. | Could · Later |

### E11 Contributing

| ID | Story | Acceptance criteria | Priority |
| --- | --- | --- | --- |
| 11.1 | As P3, I want one-command dev with synthetic data, so that I can run it in 5 minutes. | Fresh clone to running demo in one documented command. | Must · M1 |
| 11.2 | As P3, I want golden tests for the payoff engine runnable without the UI, so that I can change math safely. | Section 11 test plan. | Must · M1 |
| 11.3 | As P3, I want CI to block real-looking CUSIPs, account numbers and real price files in fixtures, so that I cannot leak data by accident. | CI fails on a seeded test fixture. | Must · M1 |
| 11.4 | As P3, I want ADRs, a roadmap and a changelog in the repo, so that I see why things are the way they are. | Section 7. | Must · M1 |
| 11.5 | As P3, I want templates for a new category plugin and a data connector, so that I can extend it. | Interface ships in M1; templates later. | Should · Later |

### E12 Category-specific (after M1)

| ID | Story | Acceptance criteria | Priority |
| --- | --- | --- | --- |
| 12.1 | As P1, I want ETF positions with target bands, so that I see allocation drift, not daily price noise. | Alert only on band breach; no price-direction alerts. | Should · Cat |
| 12.2 | As P1, I want mutual fund NAV, share class and expense ratio from statements, so that cost drag is visible. | ER change raises an alert. | Could · Cat |
| 12.3 | As P1, I want FIA surrender schedule, free-withdrawal window and crediting anniversaries, so that I never miss a renewal decision window. | Section 6 FIA sketch. | Should · Cat |
| 12.4 | As P1, I want RILA segment buffers, caps and segment maturities, so that I know what each segment protects. | Per-segment schedule. | Could · Cat |
| 12.5 | As P1, I want VA subaccounts, rider base versus contract value, step-up events and CDSC end date, so that rider changes are tracked. | Rider base and contract value kept as separate series. | Should · Cat |
| 12.6 | As P1, I want a conversion-window planner showing when each account can be converted or withdrawn without surrender charges, so that my withdrawal plan and the dashboard agree. | Dates come from each holding's schedule; no tax math in this app. | Could · Cat |

Won't-for-now: trade execution, account aggregation through third-party credential services, price-direction alerts, social features, and tax calculation (tax belongs to the user's tax professional).

## 3. Chart catalog
Ten exhibits, eight in M1. The hero is the worst-of chart; the payoff diagram is the most important teaching chart because this kind of note has a cliff. Under the illustrative terms used throughout (call at 95% monthly after six months, 20% a year simple premium, 60% final barrier, one-for-one loss below it), a final worst-of level of 60.0% returns $1,000 per $1,000 of notional while 59.9% returns $599, a step of about $400 (40% of principal). Every chart below shows its as-of date, its data source and the provenance of the terms it uses.

| # | Chart | User question | Data needed | Why this form | Failure modes | Milestone |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Worst-of performance: four lines rebased to 100% at initial level, the worst-of path drawn bold, horizontal bands at 95% (call) and 60% (barrier), ticks on observation dates | Where am I against the call and the barrier, and who is dragging? | Daily closes for the four underlyings (ALFA, BRVO, CHRL, DLTA in the synthetic fixtures); initial levels; observation dates | Rebasing makes four prices comparable on one axis; reference lines turn distance into something you can see; greying three lines keeps attention on the one that decides the payoff | Initial levels unknown (rebase becomes provisional, say so on the chart); split not adjusted (large-cap 10-for-1 splits do happen); confusion between two listed share classes of one company; line clutter | M1 |
| 2 | Distance bullets (replaces gauges): one bar each for "fall needed to breach 60%" and "rise needed to reach 95%", with the current value as a mark and bands behind it | How much room do I have, in plain percentages? | Worst-of level today | A bullet graph packs value, bands and target into a line of height; a dial wastes space and suggests needle precision the data lacks | Readers mistake "distance today" for the maturity outcome; the bar must say the barrier is tested at maturity only (VERIFY) | M1 |
| 3 | Observation calendar: one cell per observation (months 6 to 60 for a five-year note callable monthly after six months, ESTIMATE until the official schedule), each with status icon and text | Which dates matter, which have passed, what happened? | Observation schedule; worst-of level on each date | A calendar grid matches how people think about dates and shows how much of the term remains | Estimated dates mistaken for official ones (tag every estimated cell); holiday shifts | M1 |
| 4 | Payoff at maturity: payout ($) on the y-axis against final worst-of level (0–150%) on the x-axis, with a slider and a marker for today's level | What do I get back for each final level, and where are the cliffs? | Terms only | A step chart shows the 60% cliff and the 95% jump at a glance; prose hides discontinuities | The "today" marker read as a forecast (label it "if today were the final date — it is not"); wrong below-barrier formula if terms differ | M1 |
| 5 | Stress panel: shock one name or all four by X% and read the resulting worst name, payout and loss if held to maturity | What if one name drops 45%? | Terms; today's levels | Deterministic what-if teaches the worst-of mechanic without probabilities | Users read it as likely; it is a scenario, not a probability | M1 |
| 6 | Payout and annualized return by call month (table below plus a line) | What does an early call earn versus a late one? | Terms | Shows that the simple 20% a year shrinks to 14.87% annualized if the note runs to month 60 | Treating the premium as guaranteed; ignoring reinvestment risk after a call | M1 |
| 7 | Issuer credit card: agency, rating, outlook, review date, source link (a card, not a chart) | Who stands behind the payment and has that changed? | The issuer's debt-and-ratings page, manual entry | Five rows do not need a chart; a dated card is honest about freshness | Stale ratings; confusing issuer and senior-debt ratings (an issuer page may show both) | M1 |
| 8 | Evidence-of-value timeline: dots for each real mark (purchase at par, statement estimates, dealer bids, trade prints), with gaps left visibly empty | What is this worth, and how do I know? | Manually logged marks with source | Answers the value question honestly by showing evidence rather than inventing a daily line | Users want a line; resist interpolation between dots | M1 |
| 9 | Concentration by risk feature: share of investable assets that is principal-at-risk worst-of, surrender-locked annuity, liquid funds, cash | How much of the household is in each kind of risk? | All holdings with category tags | Grouping by risk feature, not by ticker, matches what can actually hurt you | Needs all holdings; double-counting wrappers | Later |
| 10 | Liquidity ladder: a timeline of when each dollar becomes accessible without surrender charge or barrier exposure | When can I get at my money? | Maturity, surrender schedules, free-withdrawal windows | A dated ladder answers a retiree's top question directly | Schedules unverified; tax rules belong elsewhere | Later |

Payout by call month per $1,000 of notional, under the illustrative terms (arithmetic is deterministic): payout = $1,000 × (1 + 20% × months/12), annualized = (payout ÷ $1,000)^(12/months) − 1.

| Called at month | Payout | Total | Annualized |
| --- | --- | --- | --- |
| 6 | $1,100 | 110% | 21.00% |
| 12 | $1,200 | 120% | 20.00% |
| 24 | $1,400 | 140% | 18.32% |
| 36 | $1,600 | 160% | 16.96% |
| 48 | $1,800 | 180% | 15.83% |
| 60 | $2,000 | 200% | 14.87% |

Changes from the initial candidate list, with reasons:
Gauges replaced by bullet bars (chart 2): same question, a third of the space, no false precision.
Call-probability timeline moved off the main screen into the Scenario tab, behind an assumptions panel. A probability on the home screen reads as a forecast, and the issuer's own pricing implies the model is generous (Section 10, model risk).
Credit-spread chart dropped for M1. There is no free, redistributable source for an issuer's credit spreads; a chart with no data is worse than a dated ratings card.
Added the evidence-of-value timeline (chart 8). It is the direct answer to "never fabricate a current value".
Added the liquidity ladder (chart 10). For a household with surrender-locked annuities, "when can I reach it" matters more than daily price.
Not included anywhere: candlesticks, intraday lines, daily P&L sparklines. They answer trading questions this product declines.
A worked example for chart 2 (deterministic): with the worst-of at 90% of initial, the worst name can fall 33.3% from today's price before reaching 60%, and needs +5.6% to reach 95%. At 75% the numbers are 20.0% and +26.7%; at 66% they are 9.1% and +43.9%.

## 4. Alert and notification catalog
Twelve alert rules, evaluated once per day after the close, with a design budget of no more than two push notifications a month in normal markets (ESTIMATE, a target to measure, not a fact). Alerts describe state and dates; none suggests buying, selling or holding. Severity decides the channel: Info goes to the in-app inbox, Notice to the weekly digest, High to a desktop notification, Critical to desktop plus any off-device channel you enabled.

### Alert rules

| ID | Alert | Trigger and default threshold | Data it depends on | Noise control | When data is stale or terms unverified |
| --- | --- | --- | --- | --- | --- |
| A1 | Barrier proximity | Worst-of close enters a band: Watch at 75% of initial or below (a further 20% fall would breach), Elevated at 66% or below (9.1% more), Below-barrier-today under 60%. Notice before the final 12 months; High inside them | Closes, initial levels, barrier level and type | One message per band entry; 3-point hysteresis (leave Watch at 78%); no repeat for 5 trading days unless the band worsens; text says the barrier is tested at maturity only (VERIFY) | Stale: suppressed, A8 fires. Initial levels unverified: fires as "provisional", in-app only |
| A2 | Likely call at next observation | Worst-of at or above 95% within 5 trading days before an observation | Closes, schedule, call level | Info only; once per observation | Estimated dates say "estimated" in the text |
| A3 | Observation approaching and result | Notice at T−5 business days, High at T−1, result the evening of the date ("Observation 3 of 55: worst DLTA at 88.2%, not called") | Schedule, closes | Result message replaces the reminder thread | Missing close on an observation date is Critical (A8) because the outcome depends on it |
| A4 | Call detected and payout reconciliation | Call condition met on an observation date by your data: High, with expected payout (notional × (1 + premium rate × months/12)). Then High again if no cash or position change is logged 5 business days after the expected payment date | Observation result, terms, logged cash or statement | One message per event | Wording is "appears met" and lists unverified inputs; a trade confirmation may state that a note can be called without mailed notice to the holder, so the app never waits for a notice |
| A5 | Maturity approaching | T−180, T−30, T−5 days; shows today's outcome band | Maturity date | Three messages over the whole term | Maturity comes from the trade confirmation, not yet the pricing supplement; the alert says so |
| A6 | Issuer rating or outlook change | Any notch or outlook change in the issuer's senior debt ratings; High if any agency moves below the single-A category | Manually logged ratings (no free feed, Section 5) | One message per change | Ratings older than 120 days: Notice asking the user to re-check the issuer's ratings page |
| A7 | Large single-name move | Daily close of −10% or worse, or 20-day move of −25% or worse, and the move changes the worst name or the A1 band | Closes | Otherwise logged silently; never fires on a rise alone | Suppressed when stale |
| A8 | Stale data | Last close older than 3 trading days (Notice); missing data on an observation date (Critical); connector error (Info) | Price store, connector status | One open alert per source until fixed | This is the fallback for every other rule |
| A9 | Terms still unverified | Weekly digest line while any critical term is unverified or in conflict (initial levels, observation dates, maturity, call level, barrier type, below-barrier formula). High at T−30 and T−7 before the first estimated observation | Provenance statuses | Snooze up to 14 days; ends when all critical terms are verified | Not applicable |
| A10 | Source conflict | A new document or entry disagrees with a stored value | Provenance log | Info, or High if the date in question is within 60 days | Not applicable |
| A11 | Corporate action on an underlying | Overnight close change over 40%, or a ticker change | Closes, symbol metadata | One message per event | Text: initial level may be adjusted by the calculation agent under the terms (VERIFY clause) |
| A12 | Review ritual | Quarterly "review your holdings and your pre-commitments" | Calendar | Digest only | Not applicable |

### Delivery channels

| Channel | How it works | Privacy assessment | Recommended default |
| --- | --- | --- | --- |
| In-app inbox | Stored in the local database | Nothing leaves the machine | On, always |
| Desktop notification | OS notification via the Tauri notification plugin, which lists Windows, macOS, Linux, iOS and Android; on Windows it works only for installed apps (CONFIRMED, Tauri docs) | Lock-screen previews can show text to anyone near the screen | On for High and Critical, with amounts and CUSIPs left out of the body by default |
| Email | Your own SMTP account; the app runs no mail server | Content passes through and stays in your mail provider indefinitely | Off; opt-in digest with a minimal body ("1 item needs review") |
| Phone push | ntfy, self-hosted or the public server; topic names are public, so they must be unguessable (CONFIRMED, ntfy docs). How ntfy reaches iOS devices is VERIFY | Payload passes through the ntfy server you choose | Off; when on, minimal payload |
| Web Push | Needs a service worker; the subscription endpoint is a secret capability URL and delivery runs through a push service (CONFIRMED, MDN); which operator runs that service is VERIFY | A third party sees delivery metadata | Not offered in M1 |
| Webhook | POST to a URL you set (Home Assistant, Slack), signed with an HMAC | Depends entirely on the destination | Off |
| SMS | Not offered: needs a paid gateway and stores a phone number | — | — |

### Behavioral rules baked into alerts
No price-direction alerts. Only structural thresholds (barrier, call level, dates) and data health can fire. A rise alone never notifies.
End-of-day evaluation only, and prices refresh at most once a day by default. Gneezy and Potters (1997) found that people who get investment feedback more often take less risk, consistent with myopic loss aversion (Benartzi and Thaler, 1995); a calm cadence is the design response, not a judgment about the user's choices.
Every alert body has three short parts: what happened, what it does not mean ("the barrier is only tested at maturity"), and your own pre-commitment if you wrote one (story 6.8).
Alert fatigue is real: the Joint Commission's 2013 alarm-safety alert reported that 85–99% of clinical alarm signals need no intervention, leaving staff desensitized. The budget meter on the Alerts screen shows how many notifications fired this month against the two-per-month target.
Unverified inputs never escalate past in-app, except A4 (a possible call) and A8 on an observation date, where missing the event costs more than a false alarm.

## 8. UX and UI direction
"Stunning and intuitive" here means calm and exact: one answer per screen, every number with its unit, date and source, charts that carry a sentence saying what they show, and empty states that explain rather than apologize. The design avoids anything that rewards checking often.

### Design principles
Answer first. Each screen opens with the sentence a careful advisor would say ("Not called. Next observation in 12 days. Worst name DLTA at 84%.").
Provenance is visible, not hidden. Badges on every term; unverified inputs drawn with a dashed outline everywhere they flow.
No number without evidence. Empty is a valid, explained state (ADR-005).
Dates over prices. The next dated event outranks today's move.
Annotation over decoration. Reference lines, labels on lines, no gradients, no 3D, no animated counters.
Teach the structure. The 60% cliff and the 95% step appear in the payoff chart and the plain-language card, in the same words.
Calm cadence. End-of-day data, no live tickers, no red-green flashing.

### Information hierarchy
Single-instrument page, top to bottom: (1) status sentence and lifecycle chip; (2) next dated event; (3) worst-of chart with call and barrier lines; (4) distance bullets; (5) value block, which reads "No verified mark" until evidence exists; (6) terms summary with "N of M verified"; (7) observation calendar; (8) payoff diagram; (9) documents and contacts.
Portfolio overview, top to bottom: (1) "Needs attention" list, often empty, and saying so; (2) next 90 days of dated events across holdings; (3) holdings grouped by category, each with status chip, provenance score and next date; (4) concentration by risk feature and the liquidity ladder (Later).

### Other key screens (wireframe-level)
Today (portfolio overview). Left: "Needs attention" (usually "Nothing needs you today" with the date of the next event). Centre: a 90-day event strip. Right: holdings list with status chips. A share-safe toggle sits in the header.
Terms and evidence. A table of fields: value, status badge, source, page, conflict candidates. Filters for unverified and conflict. A drop zone for PDFs. A "Questions for my advisor" export button.
Scenario lab. Deterministic stress panel on top (one-name and all-name sliders, outcome table). Monte Carlo below a fold, behind an assumptions panel and an acknowledgement, every output stamped ESTIMATE with seed and run count.
Alerts. Inbox grouped by holding; rule list with plain-language triggers; monthly budget meter; quiet hours; channel settings with a privacy label per channel.
Onboarding. Three steps: where your data lives, add a holding (CUSIP, category, drop documents), import closes. A demo button loads the synthetic note.
Privacy and data. Data folder path, backup and restore, network log, connector list with terms summaries.

### Empty and error states

| State | What you see | Actions offered |
| --- | --- | --- |
| No verified mark | "No verified mark. This note has no exchange price and no estimated value in your documents. You paid $1,000 at par on <trade date>." | Log a mark; attach pricing supplement; open Scenario lab |
| Initial levels unknown | Chart rebased to your data provider's close on the trade date with a banner: "Provisional: initial levels not yet from the pricing supplement" | Enter initial levels; attach supplement |
| Observation dates estimated | Calendar cells dashed, legend "estimated from the 6-month non-call, monthly rule" | Enter official schedule |
| Stale prices | Chart ends with a hatched band and "Last close <date>; 3 trading days stale" | Import CSV; check connector |
| Missing close on an observation date | Status chip becomes "Unknown", with the date | Enter the close manually with source |
| Source conflict | Field shows both values side by side with sources | Resolve with a document |
| Connector error | Inline note naming the provider and the error, never a silent retry loop | Retry once; switch to CSV |
| Fresh install, no holdings | One sentence, demo button, "Add your first holding" | Demo; add holding |

### Color, accessibility and risk states
Color never carries meaning alone (WCAG 2.2 success criterion 1.4.1, Level A, CONFIRMED). Each state has an icon, a word and a color, and the word always appears.

| State | Icon | Word on screen | Color role |
| --- | --- | --- | --- |
| On track | filled circle | On track | neutral blue-gray |
| Watch | triangle | Watch | amber |
| Elevated | diamond | Elevated | orange-red |
| Below barrier today | square | Below barrier today | red, plus hatched fill |
| Stale or unknown | question mark | Stale / Unknown | gray, hatched |
| Unverified input | dashed outline | Unverified | no fill change |

Other rules: contrast at WCAG 2.2 AA targets (4.5:1 for text, 3:1 for chart marks and controls; ratios VERIFY against the spec text); light and dark themes tuned separately rather than inverted; tabular figures for every number; no green for "good" outcomes, so color never reads as an instruction; every chart has a keyboard-reachable data table.

### Motion and density
Transitions at or under 200 ms, only to show where something moved; none when the OS reports reduced motion. Two densities: Comfortable (default, for P2) and Compact (for P1 and P4). Progressive disclosure: the instrument page fits one laptop screen; details open in place.

### Mobile strategy
M1 has no mobile app. Phone reach comes from an opt-in push channel (ntfy) carrying a minimal message. Later, a read-only responsive view of Today and the instrument summary; Tauri 2 can target iOS and Android if a native app ever earns its cost (CONFIRMED that v2 supports mobile targets).

## 11. Milestone 1 specification (v0.1.0)
Ship one market-linked note end to end: terms with provenance, imported closes, a deterministic payoff engine, the instrument page, six must-have alert rules, and a headless checker, with zero network access by default. In the repo, the slice specs in `docs/specs/` are the build authority; this section is their source, read with Sections 3 and 4 and ADR-0001 to 0008.

### Scope
One category plugin: mln.autocall.worst-of (snowball premium, worst-of call, final barrier, all parameters from the terms file).
Terms: YAML file validated by schemas/mln-terms/0.1.json; provenance and conflict per field.
Data in: CSV closes; manual marks, ratings and observation overrides; broker confirmation PDF import with redaction (Should).
Engine: schedule generator, evaluate, metrics (worst name, level, drop to barrier, rise to call), explanation trace.
Screens: Onboarding, Today (single holding), Instrument, Terms and Evidence, Scenario lab (deterministic stress only), Alerts, Privacy and Data.
Alerts: A1, A3, A4, A8, A9, A10 (Must); A5, A6 (Should); A2, A7, A11 (Could).
Channels: in-app and desktop notifications only.
Headless check command, plus a sample launchd job.
Demo mode on synthetic data.

### Non-goals for M1
Other categories; portfolio aggregation; any automatic price connector beyond an optional BYO-key stub; email, push and webhook channels; Monte Carlo on by default; mobile; cloud sync; tax figures; any recommendation text.

### Data model
Terms live in YAML (Section 6). Everything else is in one SQLite file outside the repo.

| Table | Key columns |
| --- | --- |
| instruments | id, category, terms_path, display_name |
| positions | id, instrument_id, account_label (free text, never a number), quantity, cost_cents, trade_date, settle_date, source_id |
| observations | id, series_key (e.g. close:ALFA), as_of_date, value, source_id, provenance, imported_at |
| events | id, instrument_id, kind (observation, call, payment, maturity), date, is_estimate, status, outcome_json |
| marks | id, instrument_id, as_of_date, price_per_100, evidence_type (purchase, statement, dealer_bid, trade_print, estimated_value), source_id |
| alert_rules / alert_firings | rule type, params; firing time, severity, state hash, message, channels, acknowledged_at |
| documents | id, relative_path, sha256, kind, redacted |
| sources | id, kind, document_id, page, url, retrieved_at |
| terms_changes | instrument_id, field_path, old, new, source_id, changed_at |
| network_log | at, host, purpose, connector_id |

### Test plan (synthetic data only)

| Layer | What is tested | Pass condition |
| --- | --- | --- |
| Golden payoff | The ten fixture scenarios from Section 7 | Payout, status and trace match checked-in expectations exactly |
| Boundaries | Worst-of at 95.00%, 94.99%, 60.00%, 59.99%; rounding rule | Calls at 95.00%; par at 60.00%; 59.99% pays 59.99% of principal |
| Properties | Payout never decreases as the final level rises; "called" is terminal; one event per scheduled date | Thousands of generated cases pass |
| Schedule | Estimated dates respect weekends and holidays; a weekend date entered by hand is flagged | Exact date lists match |
| Alerts | Band entry and hysteresis, suppression on stale data, quiet hours, budget meter | Firing sequences match fixtures |
| Parity | UI evaluator and check give identical output for the same data | Snapshot equality |
| Import | CSV parsing, split detector, a synthetic confirmation PDF in a common broker layout | Fields extracted; no name, address or account pattern persisted |
| Privacy | Default configuration makes zero outbound requests; CI tripwire catches a seeded real-looking CUSIP | Both tests fail when they should and pass otherwise |
| Determinism | Same inputs, same outputs across runs and OSes | Byte-identical results |
| Independent math (Pass M) | A second-vendor reference implementation recomputes all golden cases | Zero disagreements, or each one adjudicated by the owner |

### Definition of done
The owner's real note is set up from documents in the private data folder (never in the repo), every field carries the right provenance, and its maturity reads as the trade confirmation states, with that source.
Every M1 Must story in Section 2 passes its acceptance criteria.
Golden, property, alert, parity, privacy and determinism suites are green in CI.
check runs daily from launchd and delivers a desktop notification for a synthetic A3 event.
The default build makes zero outbound requests (test, not claim).
README quickstart, DISCLAIMER, ADR-001 to 008, schema reference, CSV provider note and CHANGELOG.md entry for v0.1.0 exist.
Cross-vendor review including Pass M is complete; the owner merges and tags v0.1.0.

### First-week task list
Day 1: scaffold the monorepo (layout in Section 7), strict TypeScript, test runner, CI with the PII tripwire; LICENSE, DISCLAIMER, SECURITY; draft ADR-001 to 008.
Day 2: terms schema 0.1 and the strict YAML loader with provenance, conflicts and line-numbered errors; a synthetic note in fixtures/; the owner's real terms file stays in the private data folder only.
Day 3: schedule generator, evaluate, metrics and trace; seeded synthetic-path generator; golden, boundary and property tests.
Day 4: SQLite adapter, CSV importer with split detector, observation log, alert evaluator for A1, A3, A4, A8, A9, A10; the check command.
Day 5: browser dev build of the instrument page: status sentence, worst-of chart, distance bullets, "No verified mark" block, payoff chart with the cliff annotated.
Day 6: Tauri spike (notification, autostart, keychain); sample launchd job; network-interception privacy test.
Day 7: Terms and Evidence screen, "questions for my advisor" export, the cross-vendor review workflow, and the Pass M reference recomputation; tag v0.1.0-alpha (not a release).
