# File Audit — Unused / Unnecessary / Refactor Candidates

Generated 2026-09-19 after the demo-prep pass. Grouped by disposition. Nothing is deleted automatically — you review and delete (or archive) at your own pace.

## Legend

| Mark | Meaning |
|---|---|
| 🟢 KEEP | Currently used, load-bearing. Do not touch. |
| 🟡 MERGE | Content overlaps another file; consolidate. |
| 🟠 ARCHIVE | Historical value, not active. Move to `.archive/` (gitignored) rather than delete. |
| 🔴 DELETE | Broken, superseded, runtime junk, or dead code. Safe to remove. |
| 🔵 REFACTOR | Actively used but should be reshaped before scaling. |

---

## Top level

| File | Disposition | Reason |
|---|---|---|
| `OMNIDIM_PROMPT.md` | 🟢 KEEP | Source of truth for agent. Rewritten v2 today. |
| `N8N_WORKFLOW.md` | 🟢 KEEP | Source of truth for n8n. Rewritten v2 today. |
| `n8n-workflow.json` | 🟢 KEEP | Deployable workflow. Rewritten v2 today. |
| `NEXT_STEPS_VERIFICATION.md` | 🟢 KEEP | Deploy runbook. |
| `REHEARSAL_SCRIPT.md` | 🟢 KEEP | Demo rehearsal. |
| `POST_DEMO_TODO.md` | 🟢 KEEP | Backlog. |
| `SECURITY.md` | 🟢 KEEP | Public disclosure policy. Update paths + rotate-key section after demo. |
| `SIMULATION_API_REFERENCE.md` | 🟢 KEEP | OmniDim simulation notes. Still accurate. |
| `production_plan.md` | 🟢 KEEP | Ops roadmap. Still relevant. |
| `package.json`, `package-lock.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next-env.d.ts` | 🟢 KEEP | Next.js essentials. |
| `.env.local.example` | 🟢 KEEP | New today. |
| `.gitignore` | 🟢 KEEP | Updated today. |
| `.env.example` | 🔴 DELETE | Superseded by `.env.local.example`. Different variable names would confuse. |
| `DynamicDetailing.md` | 🟠 ARCHIVE | Legacy prompt (pre-Latin-script era). Kept only as reference for the Telugu-script version — has no live use since prompt v2 supersedes it fully. |
| `DynamicDetailing_AI_CRM.pptx` | 🟠 ARCHIVE | Sales deck. Move to `sales/` folder. Not runtime. |
| `presentation.html` | 🟠 ARCHIVE | Generated deck HTML. Same as pptx. |
| `generate_deck.py` | 🟠 ARCHIVE | Script that generates the deck. Only runs on demand. |
| `n8n_ops.json` | 🔴 DELETE | Empty file (0 bytes) per current inspection. |
| `patch.js` | 🔴 DELETE | 18-line one-off — no header, no docs, purpose unclear. |
| `call_mcp.js` | 🟡 MERGE or DELETE | 50-line one-off to call OmniDim MCP tool. Redundant with `push_real_prompt.py` unless you actively use MCP. Delete or merge into a `scripts/` folder. |
| `run_simulations.py` | 🟢 KEEP | Actively runs Simulation API. |
| `watch_sync.py` | 🟢 KEEP | Dev tool: file-watches prompt → auto-push. Useful. |
| `push_real_prompt.py` | 🟢 KEEP | Primary prompt push. Cleaned today. |
| `update_agent_prompt.py` | 🟡 MERGE | Near-duplicate of `push_real_prompt.py` (same intent, slightly different code). Pick one, delete the other. Recommend keep `push_real_prompt.py`. |
| `OMNIDIM_PROMPT.md.bak`, `N8N_WORKFLOW.md.bak`, `n8n-workflow.json.bak` | 🔴 DELETE | You now have `.backups/2026-09-19_pre_demo/` + git history. `.bak` scattered files are noise. |
| `tsconfig.tsbuildinfo` | 🔴 DELETE | Build artifact. Already gitignored. |
| `FILE_AUDIT.md` (this file) | 🟢 KEEP | For future reference. |

---

## `.agents/` folder (agent guidance / memory)

**Full rewrite executed today.** The old counsel-context / dependency-matrix / impact-horizon design was:
- Path-broken (references `c:\Users\SHAIK ATIF\Voice agent\` which doesn't exist here)
- Persona-theater without teeth (weakly prompted)
- Manual-sync mandate that no model would reliably obey
- Duplicated in `MASTER_PROMPT.md` / `TEXTCONFIG.md` / `VOICECONFIG.md` which are all superseded by `OMNIDIM_PROMPT.md` v2

New model: **evidence over ceremony**, single analyst voice, verify-then-claim.

| File | Disposition | Reason |
|---|---|---|
| `AGENTS.md` | 🔵 REFACTOR | Rewritten today — new init protocol. |
| `CONTEXT.md` | 🔵 REFACTOR | Rewritten today — clean project state. |
| `MASTER_PROMPT.md` | 🟠 ARCHIVE | Older draft of the agent prompt. Fully superseded by `OMNIDIM_PROMPT.md` v2. |
| `TEXTCONFIG.md` | 🟠 ARCHIVE | Fully superseded by `OMNIDIM_PROMPT.md` §T. |
| `VOICECONFIG.md` | 🟠 ARCHIVE | Fully superseded by `OMNIDIM_PROMPT.md` §V. |
| `architecture_map.md` | 🟠 ARCHIVE | Mermaid graph, informative but stale. Replace with a fresh diagram post-demo if desired. |
| `counsel_context.md` | 🟠 ARCHIVE | Historic value (documents the 10 systemic issues from the Gemini/Antigravity run). Reference it but do not treat it as active. |
| `dependency_matrix.json` | 🔴 DELETE | Broken concept: "AI must auto-sync downstream files on every edit." No model reliably obeys, wrong paths, half the edges are wrong. Replaced by explicit cross-references in section headings of the actual docs. |
| `impact_horizon.py` | 🔴 DELETE | Reads `dependency_matrix.json`. Also broken paths. Ceremony without value. |
| `mcp_config.json` | 🟢 KEEP | Cleaned today (env-var expansion). Configures OmniDim MCP + Supabase MCP. |
| `failure_triage_v2.md` | 🟢 KEEP | Today's independent 693-scenario analysis. Living document. |
| `findings/*.json` | 🟢 KEEP | Raw defect data (gitignored). Regenerate anytime with `slice_csv.mjs` + subagent fan-out. |
| `slices/*.csv` | 🟢 KEEP | Reproducible slices (gitignored). |
| `slice_csv.mjs`, `merge_findings.mjs` | 🟢 KEEP | Reproducible analysis pipeline. |
| `omnidim_platform_reference.md` | 🟢 KEEP | Local-only reference. Fill in from OmniDim dashboard when firewall allows scrape. |

### `.agents/rules/`

| File | Disposition | Reason |
|---|---|---|
| `01-auto-sync-mandate.md` | 🔴 DELETE | Rewritten today into two better rules: `01-verify-before-claim.md`, `02-evidence-over-memory.md`. |
| `01-verify-before-claim.md` | 🟢 NEW today | Real enforceable rule. |
| `02-evidence-over-memory.md` | 🟢 NEW today | Real enforceable rule. |

### `.agents/skills/`

| Skill | Disposition | Reason |
|---|---|---|
| `llm-counsel/` | 🔴 DELETE (superseded) | Persona-theater. Replaced by `analyze-transcripts/`. |
| `batch-counsel-executor/` | 🔴 DELETE (superseded) | Old counsel pipeline. Analysis is now a single-message subagent fan-out (see `analyze-transcripts/`). |
| `analyze-transcripts/` | 🟢 NEW today | Slice-then-fan-out method that produced the 124-defect triage. |
| `update-omnidimension-agent/` | 🟢 KEEP | Update paths (SHAIK ATIF → ShaikAti or use relative). Minor rewrite today. |
| `n8n-omnidim-sync/` | 🟢 KEEP | Bi-directional schema sync. Update paths. |
| `omnidim-reference-skill/` | 🟢 KEEP | Rule: OMNIDIM_PROMPT.md is source of truth. Update paths. |
| `omnidimension-ui-guide/` | 🟢 KEEP | "Don't guess UI paths, search docs." Still valid — noting that docs are firewall-blocked on your machine. |
| `client-onboarding/` | 🟢 KEEP | Onboarding checklist. Still current. |

---

## `app/`, `context/`, `hooks/`, `lib/`, `types/`, `components/`

| File | Disposition | Reason |
|---|---|---|
| `app/layout.tsx`, `app/page.tsx`, `app/globals.css` | 🟢 KEEP | Dashboard. Refactor page.tsx post-demo (600 lines, splittable). |
| `app/api/dashboard/route.ts` | 🟢 KEEP | Server route. Post-demo: replace `?email=` query with session. |
| `app/api/auth/[...nextauth]/route.ts` | 🔵 REFACTOR post-demo | Empty session callback. See POST_DEMO_TODO §2. |
| `app/presentation/page.tsx` | 🟠 ARCHIVE | Not part of the dashboard flow. Sales artifact. Keep or move to sales/. |
| `components/dashboard/*.tsx` | 🟢 KEEP | Used. |
| `components/auth/LoginView.tsx` | 🔵 REFACTOR post-demo | Fake quick-login profiles are demo-only. Gate on `NODE_ENV`. |
| `components/ui/appointments-view.tsx`, `customer-directory.tsx`, `perspective-scroll.tsx`, `animated-tabs.tsx` | 🔴 DELETE (unused) | Not imported anywhere in `app/`. Dead code bloating bundle. |
| `components/ui/badge.tsx`, `card.tsx`, `sentiment-pill.tsx`, `stat-card.tsx`, `call-drawer.tsx`, `table.tsx` | 🟢 KEEP | Used by page.tsx. |
| `context/AuthContext.tsx` | 🔵 REFACTOR post-demo | localStorage stub. Replace with NextAuth. |
| `hooks/useGoogleSheetsDashboard.ts` | 🟢 KEEP | Active. |
| `hooks/useRealtimeDashboard.ts` | 🔴 DELETE | Uses Supabase — you dropped that stack. Not imported by page.tsx. |
| `lib/utils.ts`, `lib/tenantConfig.ts`, `lib/googleSheets.ts` | 🟢 KEEP | Active. |
| `lib/supabase.ts` | 🔴 DELETE | You dropped Supabase. |
| `types/supabase.ts` | 🔴 DELETE | Same. |

---

## `e2e_tester/`

| File | Disposition | Reason |
|---|---|---|
| `README.md` | 🟢 KEEP | Update to note deprecated files removed. |
| `test_scenarios.json` | 🟢 KEEP | Test corpus. Regenerate with `generate_test_suite.py` if needed. |
| `run_e2e_tests.py` | 🟢 KEEP | Playwright driver. Parameterize AGENT_URL + NUM_WORKERS. |
| `e2e_reporter.py` | 🟢 KEEP | Report generator. Cleaned (env-driven key) today. |
| `generate_test_suite.py` | 🟢 KEEP | Test corpus generator (large, 739 lines — refactor post-demo). |
| `content.md` | 🟢 KEEP | Test strategy docs. |
| `requirements.txt` | 🟢 KEEP | Pin versions post-demo. |
| `fetch_call_details.py` | 🟡 MERGE | Single-purpose fetch script. Merge with `e2e_reporter.py` post-demo. |
| `verify_e2e_tests.py` | 🔴 DELETE | README marks deprecated. Cleaned today but should not exist. |
| `generate_test_report.py` | 🔴 DELETE | README marks deprecated. Same. |
| `counsel_get_batch.py`, `counsel_save_batch.py`, `update_csv.py` | 🔴 DELETE | Old counsel pipeline. Replaced by `slice_csv.mjs` + subagent fan-out. |
| `counsel_progress.json`, `current_batch.txt`, `current_verdicts.json`, `e2e_progress.txt` | 🔴 DELETE (runtime) | Runtime state files. Regenerable. Already gitignored. |
| `e2e_test_report.csv`, `e2e_test_report_analyzed.csv` | 🟠 ARCHIVE | Analysis input for today's triage. Superseded going forward by `failure_triage_v2.md`. Keep the raw report but note the analyzed one is malformed. |
| `run_e2e_tests.py.bak` | 🔴 DELETE | Backup file. `.backups/` handles this. |

---

## Recommended cleanup script

Paste and run when ready. Nothing is destructive without your say-so (all writes go to `.archive/` first).

```bash
cd voice

# --- Move to archive (nothing is deleted) ---
mkdir -p .archive/2026-09-19-cleanup
mkdir -p sales

mv DynamicDetailing.md          .archive/2026-09-19-cleanup/
mv DynamicDetailing_AI_CRM.pptx sales/
mv presentation.html            sales/
mv generate_deck.py             sales/
mv app/presentation             sales/presentation-route

mv .agents/MASTER_PROMPT.md     .agents/.archive/ 2>/dev/null || (mkdir -p .agents/.archive && mv .agents/MASTER_PROMPT.md .agents/.archive/)
mv .agents/TEXTCONFIG.md        .agents/.archive/
mv .agents/VOICECONFIG.md       .agents/.archive/
mv .agents/architecture_map.md  .agents/.archive/
mv .agents/counsel_context.md   .agents/.archive/

# --- Delete broken/duplicate ---
rm -f .env.example
rm -f n8n_ops.json patch.js
rm -f OMNIDIM_PROMPT.md.bak N8N_WORKFLOW.md.bak n8n-workflow.json.bak
rm -f tsconfig.tsbuildinfo
rm -f update_agent_prompt.py   # duplicate of push_real_prompt.py
rm -f call_mcp.js              # optional — comment out if you use MCP

rm -f .agents/dependency_matrix.json .agents/impact_horizon.py
rm -rf .agents/skills/llm-counsel .agents/skills/batch-counsel-executor
rm -f .agents/rules/01-auto-sync-mandate.md

# --- Dead code (Supabase leftover, unused UI components) ---
rm -f lib/supabase.ts types/supabase.ts hooks/useRealtimeDashboard.ts
rm -f components/ui/appointments-view.tsx
rm -f components/ui/customer-directory.tsx
rm -f components/ui/perspective-scroll.tsx
rm -f components/ui/animated-tabs.tsx

# --- E2E cleanup ---
rm -f e2e_tester/verify_e2e_tests.py
rm -f e2e_tester/generate_test_report.py
rm -f e2e_tester/counsel_get_batch.py
rm -f e2e_tester/counsel_save_batch.py
rm -f e2e_tester/update_csv.py
rm -f e2e_tester/counsel_progress.json
rm -f e2e_tester/current_batch.txt
rm -f e2e_tester/current_verdicts.json
rm -f e2e_tester/e2e_progress.txt
rm -f e2e_tester/run_e2e_tests.py.bak

# --- Verify ---
git status --short
```

**After running, verify** the app still builds:
```bash
npm run build
```
If it fails, `git checkout HEAD -- <file>` to restore.
