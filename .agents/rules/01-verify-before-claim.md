# Rule 01 — Verify before you claim

**Every claim you make about the codebase, the data, or the systems must be verifiable by the reader in one command.** If it can't, don't claim it.

## What this looks like

### ✅ Verifiable
> "The old API key (rotated 2026-09-19, prefix redacted) appeared in 8 files:
> `push_real_prompt.py:6`, `update_agent_prompt.py:6`, `e2e_reporter.py:16`, `fetch_call_details.py:7`, `generate_test_report.py:7`, `verify_e2e_tests.py:8`, `call_mcp.js:29`, `.agents/mcp_config.json:17`.
> Verify: `grep -rnE 'OMNIDIM_API_KEY\s*=\s*\"[A-Za-z0-9_-]{20,}\"' --include='*.py' --include='*.js' --include='*.json' .`"

### ❌ Not verifiable
> "The API key appears to be scattered across several files."

The first version I can act on and check. The second forces me to trust you or re-do your work.

## Concretely

Before you write any of these in a response:

- "This function does X" → **Read it. Cite `file:line`.**
- "The workflow handles Y" → **Read the JSON. Cite the node id.**
- "The prior analysis found Z" → **Open `.agents/failure_triage_v2.md`. Cite defect id.**
- "Adding this field is fine" → **Check what reads it. Grep the field name.**
- "This is the industry standard" → Drop the claim, or cite a specific doc URL. "Industry standard" without a reference is filler.

## When you can't verify

Say so **inline**, not later:

- "**DOCS-INCOMPLETE** — I could not confirm OmniDim recording retention. Human needs to check the dashboard."
- "**UNVERIFIED** — I haven't run the smoke test; the fix should work but has not been proven."
- "**LIKELY** — this matches the pattern from 4 similar scenarios; not a hard confirmation."

Fake precision destroys trust downstream. A single "unknown" costs nothing; a confidently wrong claim costs a rollback.

## When you skip this rule

You will occasionally. When you catch it, redo the work — don't paper over. Restart the sentence with the actual evidence.

## Enforcement

If a future agent finds an unverifiable claim you wrote in a doc or a commit message, they will delete it and re-derive. Consider that your work being erased.

## Origin

This rule replaces the old `01-auto-sync-mandate.md`, which mandated silent cross-file synchronization via a broken `dependency_matrix.json`. That rule failed because no model could reliably execute it. This rule succeeds because it's small, testable, and applies to every response.
