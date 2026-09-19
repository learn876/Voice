---
name: analyze-transcripts
description: Bulk analysis of E2E test transcripts, call logs, or any CSV/JSON corpus of AI conversations. Uses slice-then-fan-out with structured JSON output instead of persona theater.
---

# Analyze Transcripts — Slice, Fan Out, Merge

**When**: user asks to analyze test data, find defects in transcripts, review call logs, batch-analyze a CSV, or "make sense of these conversations." Any corpus > 50 units.

**Not for**: single-conversation review, single-file code review, or open-ended "what's wrong with this?" questions.

## The 5-step method

### Step 1 — Understand the shape

Before slicing, verify the corpus structure:

```bash
# Get row count and columns
wc -l <file>.csv
head -1 <file>.csv

# Use Node for proper CSV parsing (handles quoted fields with embedded commas)
node -e "const csv=require('fs').readFileSync('<file>','utf8'); /* parseCSV state machine */"
```

Bad parsing collapses the entire pipeline. Never use `awk -F','` on a CSV that has quoted fields — the transcript column will destroy your row count. Use Node's state machine or Python `csv` module.

Identify the **scenario/unit ID** column, the **content** column, and any **metadata** columns.

### Step 2 — Slice by real intent

Do NOT slice by:
- Row range (rows 1–100, 101–200, …) — no signal.
- Naming convention alone — misses cross-cutting patterns.

DO slice by **intent category** derived from the scenario names:
- Enumerate all unique intents.
- Group into 6–8 balanced buckets (~50–150 items each).
- One bucket = one worker.

Example (`.agents/slice_csv.mjs` from the 2026-09-19 pass):
- `01_booking_flow` — 84 rows
- `02_modification_reschedule` — 36 rows
- `03_pricing_payment` — 45 rows
- `04_complaint_escalation` — 93 rows
- `05_guardrails_privacy` — 120 rows
- `06_intent_multi_part` — 87 rows
- `07_facts_service_info` — 99 rows
- `08_media_meta_edge` — 129 rows

Write each slice to `.agents/slices/<key>.csv`. These are gitignored.

### Step 3 — Fan out with a schema, not a vibe brief

Launch subagents in **a single message with multiple `Agent` tool uses** so they run concurrently. Each gets:

1. The path to its slice file (not the full corpus).
2. **Project-specific context** (business rules, guardrails, expected behavior).
3. **Known systemic issues** — but explicitly told: "verify independently, don't anchor."
4. **A JSON output schema**:
   ```json
   {
     "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
     "defect_id": "<slice-key>-NN",
     "pattern": "one-line description",
     "evidence": [{"scenario": "...", "quote": "actual text from transcript"}],
     "frequency": <approx count>,
     "root_cause": "prompt" | "n8n" | "extraction" | "omnidim" | "test_harness",
     "proposed_fix": "1-3 line concrete fix",
     "demo_blocking": true | false
   }
   ```
5. **Explicit severity definitions** relevant to the project.
6. **Where to write findings**: `.agents/findings/<slice-key>.json`.
7. **What NOT to do**: no other file mods, no running scripts, no fabricating evidence.

**Not this**: "act as a Compliance Officer and a UX Lead and debate." That's theater. Findings from adversarial personas is worse than one careful analyst with explicit evidence rules.

### Step 4 — Merge + rank

Once all subagents complete (they notify — do not poll), merge:

```bash
node .agents/merge_findings.mjs
```

The merge script:
- Concatenates JSON arrays from all slices (handling wrapper objects like `{defects: [...]}` and severity casing).
- Sorts by severity DESC → demo-blocking DESC → frequency DESC.
- Writes `.agents/failure_triage_v2.md` with a master table + full details per defect.

### Step 5 — Verify + delta

**Blind cross-check**: after writing your findings, and only then, open any prior analysis (`.agents/.archive/counsel_context.md`, previous triage). Mark each defect:
- `confirmed` — both agree.
- `new-finding-YYYY-MM-DD` — new discovery.
- `prior-only` — old analysis had it, you didn't; re-read 2 raw transcripts before accepting.

**Spot-verify 5 random CRITICAL findings** by opening the source CSV row and confirming the quoted line exists. If any fails, re-run that specific subagent with a narrower slice.

## Anti-patterns to avoid

| Anti-pattern | Why it fails | Do this instead |
|---|---|---|
| Ask one agent to read 693 rows | Context blowup, quality drop | Slice into 8, fan out |
| Simulate 3 debating personas | Fake disagreement hides sloppy reasoning | Single voice, 3 lenses |
| Skip schema, accept freeform markdown | Can't merge or rank | Enforce JSON |
| Trust prior analysis without re-verifying | Anchoring on old blind spots | Blind pass, then diff |
| Report findings without transcript quotes | Unverifiable claims | Every finding cites `scenario:quote` |
| Grep with `awk -F','` on messy CSV | Broken rows, phantom "unique" counts | Use proper CSV parser |

## Output files this skill produces

- `.agents/slices/<key>.csv` — per-slice data (gitignored)
- `.agents/findings/<key>.json` — per-slice defects (gitignored)
- `.agents/failure_triage_v2.md` — merged, ranked, cite-able report (committed)

## Handoff template

At the end of the session, hand off with:

> "N defects surfaced (X CRITICAL, Y HIGH, Z MEDIUM, W LOW).
> The X CRITICAL ones map to the following prompt / n8n / dashboard fixes: [list].
> The Y HIGH need follow-up in the next iteration.
> Full details: `.agents/failure_triage_v2.md`.
> Delta vs prior analysis: N confirmed, M new."

Never claim "all issues found" — the corpus is a sample, not a census.

## What replaced

This skill supersedes:
- `.agents/skills/llm-counsel/SKILL.md` — persona theater.
- `.agents/skills/batch-counsel-executor/SKILL.md` — old 20-row-at-a-time pipeline.

Both are archived. Do not re-invoke them.
