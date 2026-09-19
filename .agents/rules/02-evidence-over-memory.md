# Rule 02 — Evidence over memory

**Do not answer from training. Do not answer from earlier turns' summaries. Answer from primary sources you have looked at this turn.**

## The pattern to break

You'll be tempted to say things like:
- "As we discussed earlier, the tenant config lives in `lib/tenantConfig.ts`" — no, re-read it, it may have moved.
- "OmniDim's post-call webhook always includes `caller_number`" — no, check the schema doc, and check if the code path has a fallback for the case it doesn't.
- "The user prefers Tanglish" — no, check `CONTEXT.md` for the language mix (which is what they actually said).
- "Booking flow: 1) confirm slot 2) collect name 3) …" — no, open `OMNIDIM_PROMPT.md` §B and quote the actual sequence.

Each of these is memory-based, which decays or drifts. Re-read.

## The rule

Before writing a factual sentence about the repo, the data, or the systems:

1. Open the source. Read the specific section, not a summary.
2. Write the sentence with the source as your reference.
3. Cite `file:line` or `filename` in your text if the claim is non-obvious.

## Cost

Re-reading feels slow. It isn't. The alternative — drifting away from ground truth — costs entire debugging sessions.

The 693-scenario triage on 2026-09-19 was possible because every finding was quoted from a specific transcript row. The prior Gemini/Antigravity run produced worse output partly because it summarized and re-summarized the data until the original signal was lost.

## Corollary: don't summarize prematurely

If a user asks you a question and the source is 200 lines long, quote the 5 relevant lines. Don't paraphrase 200 lines into 3 confident sentences. The paraphrase erodes fidelity every turn.

## When the source is unreachable

- The Molina firewall blocks `docs.omnidim.io`. Do not fill the gap with your training. Say so.
- A file was deleted. Say so.
- A credential is missing. Say so.

Flagged unknowns compound; fabricated confidence collapses.

## Enforcement

Every recommendation should be traceable. If you cannot trace one of yours back to a source you looked at this turn, retract it and re-derive.
