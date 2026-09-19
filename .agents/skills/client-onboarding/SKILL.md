---
name: client-onboarding
description: Master checklist for provisioning the voice AI stack for a new business client (car detailing, salon, gym, etc.). One-tenant-at-a-time protocol.
---

# Client Onboarding Runbook

Use when: bringing a new client onto the platform. Sequential phases — do not skip.

## Prereqs

- Client has agreed and shared business details.
- You have `OMNIDIM_PROMPT.md` v2 as a template for the tenant's agent.
- Existing DynamicDetailing tenant is live (validates the pipeline works).

## Phase 1 — Requirements gathering (from the client)

Get in writing:

1. **Business details**: legal name, brand name, category, exact address, service list, prices, working hours, bookable slot hours, contact number.
2. **Language mix**: what languages will their callers use?
3. **Google account**: their Gmail or a shared account you manage.
4. **Google Sheet**: blank sheet in their account with the schema (see §Phase 3).
5. **Google Calendar**: dedicated calendar for bookings (booking events must be isolated from personal events).
6. **Manager phone number**: who receives handoff alerts (Telegram now, WhatsApp later).
7. **Voice sample or persona notes**: warm / formal / casual? Any name preferences for the agent?
8. **Consent for data recording**: DPDP requires notice; get their sign-off on the recording notice phrase.

Store in `.agents/tenants/<client-slug>/requirements.md` (create the folder — one per tenant).

## Phase 2 — Google Cloud Console

Only needed once per Google Workspace account, then reused across tenants.

1. Create project `<ClientSlug>-Voice-AI`.
2. Enable: Google Sheets API, Google Calendar API.
3. OAuth Consent Screen: External. Add support email.
4. Credentials → OAuth 2.0 Client ID → Web Application.
5. Authorized Redirect URIs: `https://<your-n8n-host>/rest/oauth2-credential/callback`.
6. Save Client ID + Client Secret in your password manager.

## Phase 3 — Google Sheet setup

Create a new sheet in the client's Google Drive with tab name `Sheet1` and row 1 containing exactly these columns (same schema as DynamicDetailing so the workflow is portable):

```
call_id | customer_name | phone_number | service_requested | preferred_date_time |
sentiment | language_detected | duration | channel | summary | complaint_details |
handoff_reason | status | created_at
```

Copy the Sheet ID from the URL. Add to your ops notes.

## Phase 4 — Meta WhatsApp Business Manager (post-demo)

Skip during initial demo. When ready:

1. Meta for Developers → new app (Type: Business).
2. Add WhatsApp product.
3. Add client's dedicated business phone number → verify OTP.
4. Create System User → generate permanent access token.
5. Save: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`.
6. Submit templates for Meta approval: `handoff_alert_v1`, `booking_confirmation_v1`. Wait 24–48 h.

Until this is done, use Telegram (see below).

## Phase 5 — Telegram bot (interim)

Per `NEXT_STEPS_VERIFICATION.md §0.2`:

1. BotFather → `/newbot` → get token.
2. Create group → add client's manager + bot.
3. `@RawDataBot` → get chat ID.
4. Save `TG_BOT_TOKEN`, `TG_CHAT_ID`.

## Phase 6 — n8n workflow (tenant clone)

1. Duplicate the master `n8n-workflow.json` in n8n dashboard.
2. Set tenant-specific env vars (or use n8n's per-workflow static-data):
   - `GOOGLE_SHEET_ID_<TENANT>`
   - `TG_BOT_TOKEN_<TENANT>` (if per-tenant) or reuse the shared one
   - `TG_CHAT_ID_<TENANT>`
3. Update all node references to the tenant's env vars.
4. Activate the workflow.
5. Copy the 4 production webhook URLs.

## Phase 7 — OmniDim agent (tenant-specific)

1. Create new agent in OmniDim (name = business brand).
2. Copy `OMNIDIM_PROMPT.md`. Rename to `.agents/tenants/<slug>/PROMPT.md`.
3. Search-replace: business name, address, prices, hours, contact number, greeting language mix.
4. Push to the new agent ID (create a `push_prompt_<slug>.py` clone of `push_real_prompt.py` with the new agent ID + prompt path).
5. In OmniDim dashboard → new agent → **Tools**: add `manage_calendar` and `manager_alert` with the webhook URLs from Phase 6.
6. In OmniDim dashboard → new agent → **Post-Call**: add the 8 extracted variables (see `N8N_WORKFLOW.md`).
7. Purchase phone number (or point existing number) at OmniDim.

## Phase 8 — Dashboard tenant registration

1. Add tenant to `lib/tenantConfig.ts`:
   ```ts
   "<slug>": {
     id: "<slug>",
     name: "<Business Brand>",
     category: "<Auto Detailing | Salon | Gym | …>",
     agentId: <new omnidim agent id>,
     sheetId: process.env.GOOGLE_SHEET_ID_<TENANT> || "…",
     authorizedEmails: parseEnvList(process.env.AUTHORIZED_<TENANT>_EMAILS, [...]),
     ratePerMinInr: 7.0,
     logoInitial: "XX",
     colorScheme: "<indigo|rose|amber|emerald|…>",
     accentColor: "bg-<color>-600",
   },
   ```
2. Add env vars to Vercel: `GOOGLE_SHEET_ID_<TENANT>`, `AUTHORIZED_<TENANT>_EMAILS`.
3. Deploy.

## Phase 9 — Smoke tests before handing off to client

Run the 8 curl smoke tests in `NEXT_STEPS_VERIFICATION.md §3.1` against the new tenant's webhook URLs. All must return `success: true` (except the anonymous-name and late-slot ones, which must return `success: false`).

Do one live test call. Verify:
- Sheet has a new row.
- Calendar has a new event.
- Dashboard shows the row.
- Telegram pinged if HANDOFF/COMPLAINT was in summary.

## Phase 10 — Handoff to client

1. Send credentials for the dashboard (their Gmail is now allowlisted).
2. Send a one-page cheat sheet of what the agent will and won't do (derived from `OMNIDIM_PROMPT.md` §G Guardrails).
3. Explain the Telegram group they've been added to.
4. Set expectations: "5-second lag on the dashboard; escalations within 2 seconds; ~90% booking accuracy on happy path."

## When onboarding surfaces prompt gaps

Every new client will find a fact the current prompt template doesn't handle (e.g., a salon might need "walk-ins accepted" logic that detailing doesn't). Do not silently patch the tenant's prompt. Instead:
1. Note the gap.
2. Ask: is this tenant-specific or a general feature?
3. If tenant-specific → patch tenant's `PROMPT.md`.
4. If general → propose an addition to master `OMNIDIM_PROMPT.md` v2.

## Cost per tenant (approximate)

- OmniDim: $36/mo + $5/mo phone number (per tenant, unless bulk-priced)
- Google APIs: free tier is plenty
- n8n: shared infra, no per-tenant cost
- Vercel: shared infra, no per-tenant cost
- WhatsApp: pay-per-message once configured

Charge accordingly.

## What this skill replaced

Older version referenced Meta Sandbox and AiSensy migration. Updated to reflect current state: Telegram interim, Meta Cloud API direct (no AiSensy).
