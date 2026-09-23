---
name: update-omnidimension-agent
description: Rules for updating the OmniDim agent's prompt/context/tools. Enforces "you edit the file, human runs the push." Never runs push_real_prompt.py yourself.
---

# Update the OmniDim Agent — Rules of Engagement

The OmniDim agent's behavior is driven by `OMNIDIM_PROMPT.md`. Whenever the user asks you to change the agent's prompt, tone, guardrails, or behavior, follow this protocol.

## The one-line rule

**You edit `OMNIDIM_PROMPT.md`. The human runs `python push_real_prompt.py`. Never you.**

Pushing to OmniDim is a destructive act: it invalidates the live agent for anyone currently in a session. That's a permission decision only the human can make.

## Before editing

1. **Backup**: `cp OMNIDIM_PROMPT.md .backups/{date}_{reason}/OMNIDIM_PROMPT.md`
2. **Verify section headers** are intact — `push_real_prompt.py` parses `## ` headers and turns them into OmniDim `context_breakdown` sections. If you rename or delete a heading, the OmniDim UI structure changes.
3. **Read the current file in full** — do not edit blind. Rule 02: evidence over memory.

## When editing

1. Keep the top-level structure predictable. Currently: `§0 Channel Lock`, `§1 Language Lock`, `§2 Identity`, `§3 Facts`, `§4 State`, `§5 Output Rules`, `§V Voice`, `§T Text`, `§B Booking`, `§R Reschedule`, `§H Handoff`, `§G Guardrails`, `§W Working-hour`, `§F FAQ`.
2. Each section is standalone — the OmniDim UI shows them separately.
3. Language rules for the agent live in §V and §T — never inline them into flow docs (§B/§R/§H) with `IF VOICE / IF TEXT` prefixes. That's what caused the format bleed in v1. Physical separation only.
4. **Prices, hours, contact numbers** live only in §3. Never duplicated. If a flow needs to reference a price, quote from §3 by name (*"ceramic coating starts at [price from Facts]"*), not by inlining `9999`.
5. Never introduce a new tool call in the prompt without ensuring `n8n-workflow.json` has the corresponding route + `N8N_WORKFLOW.md` documents it.

## After editing

1. **Diff**: `git diff OMNIDIM_PROMPT.md` — read it. Make sure you didn't accidentally delete a section.
2. **Header check**: `grep '^## ' OMNIDIM_PROMPT.md` — should show every intended section.
3. **Commit**: real commit message describing *why*, not *what*. Reference specific defect ids from `.agents/failure_triage_v2.md` if applicable.
4. **Write for the human**: in `docs/planning/NEXT_STEPS_VERIFICATION.md` (or your response), state clearly:
   ```
   1. Ensure OMNIDIM_API_KEY is in .env.local
   2. Run: python push_real_prompt.py
   3. Verify: OmniDim dashboard → Agent 252539 → Context Breakdown → confirm sections match
   ```

## What you must never do

- Do not run `python push_real_prompt.py` yourself. Ever. Even if the human seems to be OK with it. The rule holds because rolling back a bad prompt push on a live agent is expensive.
- Do not use the OmniDim MCP `updateAgent` for prompt updates. It's a partial-update trap — nested fields (`tools`, `integrations`) get silently dropped. `push_real_prompt.py` uses the SDK which is safer.
- Do not modify Custom Tools via SDK — that endpoint isn't safe. Instruct the human to update tools manually in the OmniDim dashboard.
- Do not push the prompt without the human's explicit "go".
- Do not push without an on-disk `.backups/` snapshot.

## Custom Tool changes

If the prompt change requires a new/renamed tool parameter (e.g., adding `service_requested` to `manage_calendar`):

1. Update `OMNIDIM_PROMPT.md` to reference the new parameter.
2. Update `N8N_WORKFLOW.md` to document the new schema.
3. Update `n8n-workflow.json` to consume it (`{{ $json.body.new_field }}`).
4. In `docs/planning/NEXT_STEPS_VERIFICATION.md`, tell the human to update the Custom Tool definition in the OmniDim dashboard manually.

All three files must agree. Missing one → integration silently breaks.

## Common failure modes

| Symptom | Likely cause |
|---|---|
| Prompt push says success but agent still says the old thing | Section header parsing failed — check `^## ` regex |
| Agent invokes a tool that doesn't exist in n8n | Prompt was updated, tool definition wasn't — Custom Tools drift |
| Agent stops confirming bookings | Prompt v2 tightened B1 rules — this is by design; verify tool actually calls |
| Agent leaks Telugu into Hindi flow after push | §L language lock was weakened — check §1 rules |

## What this skill replaced

The prior version of this file at `.agents/skills/update-omnidimension-agent/SKILL.md` referenced `c:\Users\SHAIK ATIF\Voice agent\` paths that don't exist and gave permissive advice ("use `run_command` to execute `python update_agent_prompt.py`"). That advice broke Rule 06 of Operating Principles (never take irreversible actions on behalf of the human).
