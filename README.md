# keel

A local-first monitor for investments whose value comes from their terms, not from a market price. The first instrument it tracks is a market-linked note: a worst-of autocall with a call level, observation dates and a barrier.

keel shows what you hold, what each term says and where that term came from, the next date that matters, and how far the underlyings sit from the call level and the barrier. When there is no evidence of a value, it says so instead of inventing one.

**Status:** pre-alpha. This repository currently holds its rules, review process and first slice specs; no product code yet.

**Not advice.** keel is information only. It is not investment, tax or legal advice, and your offering documents govern. See `DISCLAIMER.md`.

## How it is built

Every change is one slice, one pull request:

- A planner (Claude) writes the spec in `docs/specs/`.
- A builder (Cursor) implements it.
- Reviewers from two other vendors (Claude Code, then Codex) review it cold and adjudicate each other's findings.
- A human merges.

The rules are in `AGENTS.md`; the review procedure is `.claude/skills/keel-pr-review/`.

## Privacy

Your data lives in a folder on your machine, outside this repository. The default build makes no network requests. Every fixture in this repository is synthetic.

## License

Apache-2.0.
