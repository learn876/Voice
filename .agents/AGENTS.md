# Agent Initialization — Read First

You are working in the **DynamicDetailing Voice AI** repo. Any model — Claude, GPT, Gemini, or a human contractor — starts here.

## The 3-step boot

### Step 1 — Load the principles
Read **`.agents/OPERATING_PRINCIPLES.md`** completely. These are the 10 rules that govern how work is done in this repo. They are not aspirational; they are enforced.

### Step 2 — Load the state
Read **`.agents/CONTEXT.md`** for the current project state (what's live, what's staged, what's broken, what's next).

### Step 3 — Load the load-bearing docs
When you'll be touching either area, read the corresponding source-of-truth doc:

| If you're editing… | Source of truth |
|---|---|
| Agent behavior | `OMNIDIM_PROMPT.md` |
| n8n workflow | `N8N_WORKFLOW.md` + `n8n-workflow.json` |
| Dashboard | `app/page.tsx` + `lib/googleSheets.ts` + `lib/tenantConfig.ts` |
| E2E harness | `e2e_tester/README.md` + `test_scenarios.json` |
| Cost / plan | `production_plan.md` + `POST_DEMO_TODO.md` |

## Never do

- **Never edit `.env.local`** (it holds live credentials, gitignored, handled by the human).
- **Never push to `origin`** — the human pushes.
- **Never run `push_real_prompt.py`, `vercel --prod`, or any n8n import** — those are destructive and belong on the human's line, not yours. See §6 of Operating Principles.
- **Never fabricate** OmniDim/Meta/Google API behavior. If docs aren't reachable (Molina firewall blocks `docs.omnidim.io`), flag it — don't guess.
- **Never rewrite files you haven't read** in full within this session.

## The available skills

Each is a small runbook in `.agents/skills/<name>/SKILL.md`. Load only when the task matches.

| Skill | Trigger |
|---|---|
| `analyze-transcripts` | Any bulk transcript / CSV / test-report analysis. |
| `update-omnidimension-agent` | User asks to update the agent prompt / context / tools. |
| `n8n-omnidim-sync` | User asks to change a data field, tool schema, webhook URL, or n8n workflow. |
| `omnidim-reference-skill` | User asks you to draft test scenarios or replies for the voice agent. |
| `omnidimension-ui-guide` | User asks where a setting is in the OmniDim dashboard. |
| `client-onboarding` | User wants to onboard a new client. |

## The rules

Read all files in `.agents/rules/` at the start of each session. Small, enforceable, and mandatory.

Currently:
- `01-verify-before-claim.md`
- `02-evidence-over-memory.md`

## When paths in old docs are wrong

Some legacy files reference `c:\Users\SHAIK ATIF\Voice agent\...` — old machine. The real repo is wherever the human cloned it (currently: `c:\Users\ShaikAti\OneDrive - Molina Healthcare\Automation\Testing\voice`). Use relative paths from repo root (`OMNIDIM_PROMPT.md`, `.agents/CONTEXT.md`) so this file survives machine moves.

## When you finish

Every session ends with:
1. `git status --short` clean or a summary of intentional uncommitted state.
2. A one-paragraph handoff naming what the human should do next.
3. Task list marked complete for anything you finished; realistic status for anything you didn't.
