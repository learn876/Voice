# Project Context — DynamicDetailing Voice AI CRM

Last major update: **2026-09-19** (demo-prep pass).

## What this project is

A voice + text AI agent named **Siri** for **DynamicDetailing Studio** (auto detailing, Jubilee Hills, Hyderabad). Runs on OmniDimension. Backed by n8n workflows that write to Google Sheets and send Telegram alerts. Read by a Next.js dashboard on Vercel that the shop owner will use.

The client is a car detailing studio owner. The immediate goal is a **demo to that one client**. Post-demo, this scales to 2–3 more small businesses (salons, gyms).

## Language mix

- Tanglish (Telugu-English in Latin script): **~70 %**
- Hinglish (Hindi-English in Latin script): **~15 %**
- English: **~15 %**

Voice may also come in Telugu or Hindi native scripts. Agent MUST mirror script.

## What's live right now

- **OmniDim Agent ID `252539`** — receives voice + text, uses `OMNIDIM_PROMPT.md` v2 as its context.
- **n8n workflow v2** (`v2-demo-ready-2026-09-19`) — 4 webhooks: post-call, calendar tool (4 actions), manager alert, text summary. Telegram alerts (WhatsApp planned).
- **Google Sheet** (`1AqiavwsMmv_GCW0Cvr57lieFMOgOhoNLi77tiXPGDso`) — operational store. Not authoritative for auth; only for CRM data.
- **Next.js dashboard** — deployed to Vercel (URL TBD). Uses a localStorage stub for auth (post-demo replace with NextAuth).

## What's staged but not deployed

Between the current disk state and the live systems, these things need to happen (see `docs/planning/NEXT_STEPS_VERIFICATION.md`):

- Push prompt v2 to OmniDim → `python push_real_prompt.py`
- Import `n8n-workflow.json` v2 into n8n dashboard
- Configure OmniDim Custom Tools + Extracted Variables
- Rotate OmniDim API key (old key was leaked in git history)
- Set up Telegram bot (BotFather) — human step, ~10 min

## The stack

```
Caller ──▶ OmniDim (voice + text, Siri persona)
         ├─▶ Custom Tool "manage_calendar" ──▶ n8n webhook ──▶ Google Calendar
         │                                                  └─▶ Google Sheet
         ├─▶ Custom Tool "manager_alert" ──▶ n8n webhook ──▶ Telegram bot
         └─▶ post-call webhook ──▶ n8n ──▶ Sheet + (if HANDOFF/COMPLAINT) Telegram

Next.js /api/dashboard ──▶ Google Sheet (via gviz JSON) ──▶ Owner's browser
```

Details in `N8N_WORKFLOW.md`. Failure modes in `.agents/failure_triage_v2.md`.

## What's broken / weak (as of last audit)

**Fixed today** (2026-09-19):
- Voice format bleeding to text and vice versa
- Handoff token never emitted → n8n escalation blind
- No availability check before booking → double-bookings
- No reschedule capability → hallucinated confirmations
- Language leaks (Kannada/Gujarati script fragments)
- Anonymous name accepted → untraceable bookings
- Google Sheet ID was a placeholder → all writes silently failed
- Silent defaults in dashboard ("Positive" for missing sentiment, "Atif" for missing name)

**Still weak, not blocking demo, tracked in `docs/planning/POST_DEMO_TODO.md`:**
- Auth is a localStorage stub — anyone can "log in" as an allow-listed email
- `lib/tenantConfig.ts` imports allow-list into client bundle → info disclosure
- No Sentry / uptime monitoring
- No CI
- Dashboard is ~600-line monolith (splittable post-demo)
- Meta WhatsApp Cloud API not set up yet (using Telegram as demo stand-in)

## Budget & scale

- OmniDim $36/mo + OmniDim phone number $5/mo
- Hostinger KVM1 for n8n (~$5/mo)
- Vercel free tier (fine for ~250 clients at expected load)
- Telegram: free
- WhatsApp Cloud API: pending Meta Business Manager
- **Total pre-WhatsApp: ~$47/mo**

Details in `docs/planning/POST_DEMO_TODO.md`.

## Compliance snapshot

- DPDP (India Digital Personal Data Protection Act, 2025):
  - Recording notice added to voice welcome greeting.
  - Text greeting mentions chat is saved.
  - Full policy page TBD post-demo.
- No credit card / OTP / Aadhaar storage (guardrail G4 in prompt).

## The 8 defect categories from the last independent analysis

From `.agents/failure_triage_v2.md` (693 scenarios → 124 defects on 2026-09-19):

| Category | Critical | High | Medium | Low |
|---|---|---|---|---|
| Booking flow | 5 | 4 | 3 | 1 |
| Modification / Reschedule | 4 | 4 | 3 | 0 |
| Pricing / Payment | 3 | 4 | 2 | 0 |
| Complaint / Escalation | 4 | 5 | 4 | 3 |
| Guardrails / Privacy | 5 | 4 | 4 | 2 |
| Intent / Multi-part | 2 | 5 | 4 | 4 |
| Facts / Service info | 1 | 5 | 3 | 2 |
| Media / Edge cases | 0 | 12 | 20 | 6 |

All 20 CRITICAL and ~60 % of HIGH are addressed in prompt v2 + n8n v2. Remaining HIGH + all MEDIUM/LOW are for post-demo iteration.

## The 10 systemic issues from the earlier (Gemini/Antigravity) counsel run

Archived at `.agents/.archive/counsel_context.md`. Historic value only. My 2026-09-19 independent analysis confirmed 8 of 10 and found 5 new ones. Do not treat that file as active.

## People

- **Shaik Atif** — owner / super-admin (`shaikatif@gmail.com`).
- **Client**: DynamicDetailing Studio owner (contact TBD by Shaik).
- **Manager**: recipient of Telegram alerts (Shaik receives during demo).

## Load-bearing decisions log

- 2026-09-19: dropped Supabase in favor of Google Sheets only for demo scale.
- 2026-09-19: Telegram for handoff alerts as WhatsApp Cloud API stand-in.
- 2026-09-19: `OMNIDIM_PROMPT.md` split physically into §V (voice) and §T (text) sections to stop format bleed.
- 2026-09-19: Rescheduling implemented via `lookup_by_phone` + `reschedule` calendar actions.
- 2026-09-19: Anonymous names rejected server-side in n8n `Validate + Overlap Guard` node.
- Older decisions: see `docs/planning/production_plan.md`.

## When updating this file

Append a dated line to the decisions log. Never rewrite existing decisions — preserve the trail.
