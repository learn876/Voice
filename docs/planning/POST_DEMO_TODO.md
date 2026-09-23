# Post-Demo TODO — Ordered by ROI

Do these in order after the demo lands, budget-and-time permitting.

## Day 1 (next day, blocking risk items)

1. **Rotate any secrets that touched the demo** (OmniDim if you shared screen, Telegram token if group visible).
2. **Real NextAuth Google OAuth** — kill the localStorage-only stub. Set up Google Cloud OAuth Client, wire `signIn('google')` properly, gate `/api/dashboard` with `getServerSession()`.
3. **Split `lib/tenantConfig.ts`** into `.public.ts` (safe to bundle) + `.server.ts` (import 'server-only'), so the email allow-list doesn't leak to browser JS.

## Week 1

4. **Meta WhatsApp Business Manager application** — start the 24-48h template approval loop early. Templates: `handoff_alert_v1`, `booking_confirmation_v1`. Swap the Telegram HTTP nodes for WhatsApp Cloud API — 1 node change per alert flow.
5. **Sentry** free tier for error tracking. Add to Next.js + n8n.
6. **UptimeRobot** — ping the 4 n8n webhooks + the Vercel URL every 5 min.
7. **Fix all HIGH defects** from `.agents/failure_triage_v2.md` (43 of them, mostly prompt tweaks — 1 evening's work).
8. **Buy the domain** (~₹800/yr). Configure `n8n.<yourdomain>` on Hostinger, `dashboard.<yourdomain>` on Vercel.

## Week 2

9. **Setup Google Workspace or Resend** for magic-link auth emails + `hello@yourdomain.com` for Meta Business Manager verification.
10. **Sheet backups** — nightly n8n cron exports the Sheet to your Drive. 5-min job.
11. **Recording notice on website** + basic Privacy Policy page (DPDP compliance for real).
12. **Fix all MEDIUM defects** (43) via a batch prompt edit.

## Month 1

13. **Second client onboarding** — this stresses the tenant-config-in-code weakness. Move to Postgres:
    - Self-host Postgres on the same Hostinger KVM1 alongside n8n (~200 MB RAM).
    - Tables: `tenants(id, sheet_id, category, ...)`, `tenant_users(tenant_id, email, role)`, `audit_log`.
    - `lib/tenantConfig.ts` reads from Postgres instead of code.
    - Small admin UI to add tenants.
14. **Onboarding flow** — form → auto-creates Google Sheet + n8n workflow copy + tenant registry entry + OmniDim agent clone.
15. **In-app 2FA** (TOTP) for the CRM.

## Month 2–3

16. **Real dashboard analytics** — trends, conversion funnels, cost views. Nightly n8n aggregation into a `calls_denormalized` Postgres table.
17. **Cross-tenant admin console** for you personally to see all clients at once.
18. **Recording playback** in the CallDrawer (fetch signed URL from OmniDim on demand).
19. **Language filter + intent tags** in dashboard (uses the extracted variables now flowing).

## Longer term

20. **CI pipeline** — GitHub Actions: `next build`, `tsc --noEmit`, ESLint, secret scanner. On every push.
21. **Automated E2E regression suite** — run `run_e2e_tests.py` on every prompt change; assert no regression in the top-20 defect patterns.
22. **Feature flags** for gradual rollout of new prompt versions to production.
23. **Cost dashboard** — per-tenant minute usage × rate; alert when a client approaches their plan limit.

---

## Defect backlog (from 2026-09-19 triage)

Full details in `.agents/failure_triage_v2.md`.

| Bucket | CRITICAL | HIGH | MEDIUM | LOW |
|---|---|---|---|---|
| Booking flow | 5 | 4 | 3 | 1 |
| Modification/Reschedule | 4 | 4 | 3 | 0 |
| Pricing/Payment | 3 | 4 | 2 | 0 |
| Complaint/Escalation | 4 | 5 | 4 | 3 |
| Guardrails/Privacy | 5 | 4 | 4 | 2 |
| Intent/Multi-part | 2 | 5 | 4 | 4 |
| Facts/Service info | 1 | 5 | 3 | 2 |
| Media/Edge | 0 | 12 | 20 | 6 |

Demo fixes address 100% of CRITICAL (20/20) and ~60% of HIGH (26/43). The remaining HIGH + all MEDIUM/LOW are polish for weeks 1-2 above.

---

## Tech-debt registry (small stuff not worth stopping the demo for)

- `context/AuthContext.tsx` — localStorage-only "auth" stub. Post-demo replace with NextAuth.
- `lib/supabase.ts` + `hooks/useRealtimeDashboard.ts` + `types/supabase.ts` — dead code (Supabase not used). Delete or wire up.
- `e2e_tester/verify_e2e_tests.py`, `generate_test_report.py` — flagged deprecated in README. Delete.
- `e2e_tester/counsel_get_batch.py`, `counsel_save_batch.py`, `update_csv.py`, `fetch_call_details.py` — merge into one CLI.
- `presentation.html`, `DynamicDetailing_AI_CRM.pptx`, `generate_deck.py` — move to a `sales/` folder to declutter repo root.
- `AGENTS.md` paths reference `c:\Users\SHAIK ATIF\Voice agent\` (old machine). Update once you settle on a stable dev path.
- `.gitignore` — after demo, also gitignore `.agents/findings/`, `.agents/slices/`, `.agents/*.output` — I already did this; verify nothing regenerates unwanted.
- Split `AuthContext` so client-side code doesn't import the server-only email allow-list (currently a real info-disclosure risk).

---

## Cost budget check (monthly, in USD)

| Item | Cost | Notes |
|---|---|---|
| OmniDim $36 plan | $36 | Includes X minutes + LLM + web chat |
| OmniDim phone number | $5 | India / US number |
| Hostinger KVM1 (n8n + Postgres later) | ~$5 | Enough till 3+ clients |
| Vercel free tier | $0 | Enough for ~250 clients at your load |
| Google Workspace (optional) | $0-6 | Skip until you buy domain |
| Domain (~₹800/yr = $10/yr = <$1/mo) | <$1 | Buy in week 1 |
| Telegram bot | $0 | |
| WhatsApp Business API (later) | $0-30 | First 1000 conversations/mo free per Meta, then per-conversation charge |
| Sentry free tier | $0 | 5k errors/mo |
| UptimeRobot free tier | $0 | 50 monitors |
| **Total pre-WhatsApp** | **~$47/mo** | |
| **Total post-WhatsApp (typical)** | **~$55-77/mo** | Depends on message volume |

At 10-15 calls/day, ~$0.15 per handled interaction all-in. Charge your client $200-500/mo and you have a business.
