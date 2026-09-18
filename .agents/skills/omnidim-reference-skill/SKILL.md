---
name: omnidim-reference-skill
description: Guidelines for referencing OMNIDIM_PROMPT.md when drafting OmniDimension scenarios and replies.
---

# OmniDimension Reference Guidelines

When the user asks you to draft test scenarios, simulate conversations, or write agent replies for the DynamicDetailing Voice Agent, you MUST **ALWAYS** use `c:\Users\SHAIK ATIF\Voice agent\OMNIDIM_PROMPT.md` as your primary source of truth.

## Core Directives

1. **Rule of Thumb:** `OMNIDIM_PROMPT.md` is the master document for the agent's behavior. Never invent business rules, pricing, or formatting constraints that contradict this document.
2. **Channel Sensitivity:** Pay strict attention to the Text vs. Voice rules defined in the prompt. Do not mix Voice formatting (e.g., spelling out numbers, Telugu script) into Text Chat scenarios, and vice versa.
3. **Scenario Drafting:** When drafting scenarios (e.g., for `test_scenarios.json`), ensure the `expected_result` directly mirrors the exact guardrails and facts established in `OMNIDIM_PROMPT.md`.
4. **Validation:** If the user proposes a test or behavior that violates `OMNIDIM_PROMPT.md` (e.g., asking to offer a discount), politely remind them that the prompt explicitly forbids it.
