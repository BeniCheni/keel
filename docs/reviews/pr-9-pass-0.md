# Pass 0 brief: PR #9 (scrubbed product research)

Written by the PM on 2026-10-31 (America/New_York), from a fresh read of the PR at `a62a5be`. The same Claude session wrote the PR and this brief, so the cold review is the only cold read; this brief steers it and seals nothing.

## Seat for the cold review

Codex, because a Claude session wrote every line. Model GPT-6.1 Sol High (no sensitive path). No fallback.

## Scope

- Spec: none; adds `docs/proposals/0001-product-research.md`.
- Sensitive paths touched: none.
- Release: no. New dependencies: none.

## Authorship record

| Commit | Authoring vendor | Cold read by |
| --- | --- | --- |
| the scrub commit and this brief | Claude (PM) | Codex, fast-track cold review |
| any Codex fix commit | Codex | fresh Claude session before merge |

## Fast-track

Allowed: the diff is docs outside sensitive paths, and this is not a release or numbering fork. One cold review by Codex replaces Passes 1 to 2.5. Beni still merges in shadow mode, pinned with `--match-head-commit`, and the squash message says "fast-track".

## What to check

1. **Privacy first.** Run the owner's private-list check over the new file, the diff, the commit messages and the PR body. Read every table row for anything that could identify the owner's holding: identifiers, issuer, broker, adviser, amounts, trade or maturity dates, real tickers, or combinations that together point to one note. Report counts only; never print a pattern.
2. **Faithful but generic.** The illustrative terms and per-$1,000 figures are internally consistent (payout table, chart 2's worked example, the 60.0% and 59.9% cliff).
3. **References.** Cross-references to Sections 5, 6, 7, 9 and 10 are explained by the header. Story and alert IDs that existing specs cite (S00 cites 10.1, 11.1, 11.2 and 11.3; S01 cites 3.1, 3.2, 3.3 and 3.5) exist here with matching meaning.
4. **No advice.** Nothing in the document recommends buying, selling or holding, or predicts a price.
