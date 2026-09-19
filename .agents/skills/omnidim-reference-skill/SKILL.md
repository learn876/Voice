---
name: omnidim-reference-skill
description: Ground rule — OMNIDIM_PROMPT.md is source of truth for agent behavior. Use it when drafting scenarios, expected agent replies, or reviewing agent output.
---

# OmniDim Prompt as Source of Truth

Whenever you're asked to:
- Draft a test scenario
- Write an expected agent reply
- Simulate a conversation
- Judge whether the agent behaved correctly
- Suggest a prompt change

…the answer lives in **`OMNIDIM_PROMPT.md`** (currently v2, 2026-09-19). Read from it. Do not invent business rules.

## The rule

1. **Never invent facts** not in `OMNIDIM_PROMPT.md §3`. Prices, hours, services, address — those are the only numbers you cite. Never round, derive, or reformulate them from memory.
2. **Channel matters**. Voice rules live in §V. Text rules live in §T. Never mix them.
3. **Language matters**. §1 (Language Lock) governs which script the agent uses. If your test scenario user writes in Devanagari, the expected reply mirrors Devanagari. Latin-script Tanglish → Latin-script Tanglish reply.
4. **Guardrails are absolute**. §G forbids: discounts, home pickup, refund promises, off-topic engagement, Anonymous bookings, medical/legal advice. If a proposed scenario tests a guardrail, the expected behavior is refusal in the appropriate register.
5. **Escalation must emit tokens**. §H mandates the summary begins with `HANDOFF:` or `COMPLAINT:`. Any test scenario for escalation must assert on this token in the post-call summary.

## Common misuses to catch

| User asks | Push back |
|---|---|
| "Test the agent's discount negotiation" | The prompt forbids discounts. The correct test is: user asks, agent refuses firmly. |
| "Have the agent recommend a mechanic" | Out of scope. Agent must deflect (§G4). |
| "Book a 6 PM slot" | Bookable hours are 9 AM – 4:30 PM. Correct behavior: refuse, offer nearest available (§B3). |
| "Have the agent say the price in Telugu numerals" | §V1 forbids Telugu numeric words on voice; English spelled-out only. |
| "Reply with markdown in a voice test" | §V1 forbids markdown on voice. |

If the user's requested scenario contradicts the prompt, **do not comply silently**. Say: "Prompt §X forbids this; I'll draft the scenario to verify the refusal instead."

## Cross-reference discipline

When drafting an expected reply:
- Quote the prompt section it derives from: *"per §V7 (voice opening), expected: '…' "*.
- If your expected reply differs from what's currently in `OMNIDIM_PROMPT.md`, that's a prompt-change proposal, not a scenario spec — flag it as such.

## When to update the prompt vs when to update scenarios

If your test scenarios catch a systemic gap:
- **Prompt fix**: if the rule doesn't exist in `OMNIDIM_PROMPT.md`. Follow `.agents/skills/update-omnidimension-agent/SKILL.md`.
- **Scenario fix**: if the rule exists and the scenario just doesn't test it correctly.
- **Both**: if the rule exists but is weakly worded.

Never patch scenarios to hide a real prompt gap.

## What this skill replaced

Prior version referenced `c:\Users\SHAIK ATIF\Voice agent\OMNIDIM_PROMPT.md`. Now uses repo-relative paths.
