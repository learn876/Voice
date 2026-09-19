---
name: omnidimension-ui-guide
description: When you need to tell the user where a setting lives in the OmniDim dashboard. Never guess UI paths; verify.
---

# OmniDim UI Guide — Verify, Don't Guess

Whenever a user asks "how do I enable X in OmniDim" or "where's the setting for Y":

## The rule

**Do not answer from memory or from what "usually" works on other AI platforms.** OmniDim's UI changes and it does not resemble other platforms.

## The 3-step

1. **Try the docs**: `docs.omnidim.io` is the primary source.
2. **If the docs are unreachable** (Molina firewall blocks the domain — this is the current state as of 2026-09-19), say so explicitly:
   > "I can't reach `docs.omnidim.io` from this environment. Please check `<specific setting name>` under `<best guess>` in your OmniDim dashboard and paste back what you see."
3. **Don't fabricate a menu path** to fill the gap. A wrong path costs the user 5 minutes of clicking; an honest "I don't know" costs nothing.

## Locations I've been able to confirm (from local project files)

| Feature | Path |
|---|---|
| Extracted variables (post-call) | Agent → **Post-Call** tab → Custom Variables |
| Custom Tools (webhook integrations) | Agent → **Tools** or **Integrations** tab |
| Prompt / context | Agent → **Context Breakdown** (sections are `## ` headers from `OMNIDIM_PROMPT.md`) |
| Welcome message | Agent → same context section |
| API key rotation | Settings → **API** → Regenerate |
| Simulation API | Docs at `docs.omnidim.io/docs/api-reference/simulation/` (blocked here) |
| Voice / TTS config | Agent → Voice Settings (unconfirmed) |
| Data retention | **DOCS-INCOMPLETE-CHECK-DASHBOARD** |
| Rate limits | **DOCS-INCOMPLETE-CHECK-DASHBOARD** |

## What to do when the user finds a UI element I got wrong

Update `.agents/omnidim_platform_reference.md` immediately. That doc is our substitute source of truth while the firewall blocks `docs.omnidim.io`.

## Anti-patterns to avoid

- "It's probably under Advanced Settings" — don't hedge, say unknown.
- "Similar to Vapi/Retell/Bland, so try…" — cross-platform analogies are wrong more than half the time.
- "The docs say X" without citation — Rule 01: verify.
