# NEXT STEPS — Verification & Deploy

Run these in order. Every command is yours to run — I don't push, deploy, or touch OmniDim.

---

## 0. Prerequisites (do these once, before anything else)

### 0.1 Rotate OmniDim API key ⚠️ Do this NOW

1. Log in to https://omnidim.io dashboard
2. Settings → API → **Regenerate key**
3. Copy the new key
4. Create `voice/.env.local` (copy from `voice/.env.local.example`)
5. Paste the new key as `OMNIDIM_API_KEY=<new_key>`
6. Save. Do NOT commit this file (already in `.gitignore`).

**Verify**:
```bash
cd voice
grep OMNIDIM_API_KEY .env.local     # should show your new key
grep -r "DLOAJWjRpuyDwg9qyCBlil2QBHJCzk-qR5yFmdCFjG0" --include="*.py" --include="*.js" --include="*.ts" --include="*.json" --include="*.md" .
# expected output: no matches (or only inside .backups/ which is fine)
```

### 0.2 Create Telegram bot for handoff alerts

1. Telegram → search `@BotFather` → `/newbot`
2. Name: `DynamicDetailing Alerts`. Username: e.g. `dd_alerts_2026_bot`.
3. Copy the token (looks like `7891234567:AAH8fB...`)
4. Create a new Telegram group `DynamicDetailing Ops`, add yourself + the bot.
5. Send any message in the group.
6. Add `@RawDataBot` to the group temporarily → it replies with the group's `chat.id` (starts with `-100...`). Copy that.
7. Remove `@RawDataBot`.
8. Add to `voice/.env.local`:
   ```
   TG_BOT_TOKEN=7891234567:AAH8fB...
   TG_CHAT_ID=-1001234567890
   ```

**Verify the bot works** (browser or terminal):
```
https://api.telegram.org/bot<TG_BOT_TOKEN>/sendMessage?chat_id=<TG_CHAT_ID>&text=test
```
Your group should ping. If yes, done.

### 0.3 Confirm Google Sheet has correct columns

Open the DynamicDetailing sheet (`GOOGLE_SHEET_ID_DETAILING` in `.env.local.example` → `1AqiavwsMmv_GCW0Cvr57lieFMOgOhoNLi77tiXPGDso`).

Row 1 should contain exactly (in this order):

```
call_id  customer_name  phone_number  service_requested  preferred_date_time  sentiment  language_detected  duration  channel  summary  complaint_details  handoff_reason  status  created_at
```

If your current sheet has different columns, either rename them or create a new tab called `Sheet1` with the schema above. The n8n workflow writes to `Sheet1`.

### 0.4 Check OmniDim data retention

While in the OmniDim dashboard, note:
- Recording retention (days/months) — paste back to me when done
- Transcript retention (days/months)

These couldn't be scraped (corporate firewall blocked `docs.omnidim.io`). Once you have them, we add to `.agents/omnidim_platform_reference.md`.

---

## 1. Push the revised prompt to OmniDim

```bash
cd voice
# make sure OMNIDIM_API_KEY is in .env.local (step 0.1 above)
python push_real_prompt.py
```

Expected output:
```
Agent Prompt Successfully Updated!
Agent ID: 252539
Status: <some_status>
```

**Verify in OmniDim dashboard**:
1. Open Agent 252539 → Context Breakdown.
2. Section titles should now include (in this order):
   - `0. Channel Lock — READ FIRST EVERY TURN`
   - `1. Language Lock (L)`
   - `2. Identity & Purpose`
   - `3. Facts (do not derive, do not round)`
   - `4. State Tracking (S)`
   - `5. Absolute Output Rules`
   - `§V — VOICE CALL RULES` (with V1–V8)
   - `§T — TEXT CHAT RULES` (with T1–T7)
   - `§B — Booking Flow (both channels)` (with B1–B4)
   - `§R — Reschedule Flow (both channels)` (with R1–R3)
   - `§H — Escalation / Handoff Flow` (with H1–H8)
   - `§G — Universal Guardrails` (with G1–G9)
   - `§W — Working-hour deflection`
   - `§F — FAQ & Examples`
3. Welcome message should now be:
   ```
   Hello.. DynamicDetailing Studio nunchi Siri matladutunna. Ela help cheyagalanu andi?
   ```
   (unchanged — same as before)

## 2. Configure OmniDim Custom Tools + Extracted Variables

**One-time UI work in the OmniDim dashboard for Agent 252539.**

### 2.1 Custom Tool: `manage_calendar`

Add / update tool with these parameters (see `N8N_WORKFLOW.md` for full JSON):
- `action` (enum: `check_slots`, `book`, `reschedule`, `lookup_by_phone`)
- `date` (string YYYY-MM-DD)
- `time` (string HH:MM)
- `name`, `phone`, `service_requested`, `new_date`, `new_time`, `language`
- Endpoint: `https://<your-n8n-host>/webhook/omnidim-calendar-tool`

### 2.2 Custom Tool: `manager_alert`

- Endpoint: `https://<your-n8n-host>/webhook/omnidim-manager-alert`
- Parameters: `phone_number` (required), `customer_name`, `reason` (required), `language`

### 2.3 Post-Call Extracted Variables

Add these to the agent's Post-Call configuration:
- `customer_name`
- `phone_number`
- `service_requested`
- `preferred_date_time`
- `complaint_details`
- `handoff_reason`
- `language_detected`
- `sentiment`

## 3. Import the updated n8n workflow

1. Open your n8n dashboard.
2. Workflows → Import from File → select `voice/n8n-workflow.json`.
3. **Delete the old workflow** first (or archive it — don't leave both active on the same webhook paths).
4. In the new imported workflow, open every Google Calendar and Google Sheets node and **re-select the credential** (import loses credential references).
5. Confirm environment variables inside n8n:
   - `GOOGLE_SHEET_ID_DETAILING` = your sheet ID
   - `TG_BOT_TOKEN` = from BotFather
   - `TG_CHAT_ID` = from RawDataBot
6. **Activate** the workflow.

### 3.1 Smoke-test each webhook

```bash
# 3a. check_slots
curl -X POST https://<your-n8n-host>/webhook/omnidim-calendar-tool \
  -H "Content-Type: application/json" \
  -d '{"action":"check_slots","date":"2026-09-20"}'
# expected: {"success":true,"date":"2026-09-20","free_slots":[...],"message":"..."}

# 3b. book (dry attempt — will actually create a calendar event; delete it after)
curl -X POST https://<your-n8n-host>/webhook/omnidim-calendar-tool \
  -H "Content-Type: application/json" \
  -d '{"action":"book","date":"2026-09-20","time":"14:00","name":"Test Booking","phone":"9999999999","service_requested":"exterior_wash"}'
# expected: {"success":true,"action":"book","date":"...","time":"14:00","name":"Test Booking","phone":"9999999999"}
# Then check Google Calendar and Sheet — event + row appeared?

# 3c. anonymous name — must be REJECTED
curl -X POST https://<your-n8n-host>/webhook/omnidim-calendar-tool \
  -H "Content-Type: application/json" \
  -d '{"action":"book","date":"2026-09-20","time":"15:00","name":"Anonymous","phone":"9999999999"}'
# expected: {"success":false,"action":"book","errors":["invalid_or_anonymous_name"],...}

# 3d. late slot — must be REJECTED
curl -X POST https://<your-n8n-host>/webhook/omnidim-calendar-tool \
  -H "Content-Type: application/json" \
  -d '{"action":"book","date":"2026-09-20","time":"17:00","name":"Test","phone":"9999999999"}'
# expected: {"success":false,"errors":["slot_outside_bookable_hours"],...}

# 3e. lookup by phone
curl -X POST https://<your-n8n-host>/webhook/omnidim-calendar-tool \
  -H "Content-Type: application/json" \
  -d '{"action":"lookup_by_phone","phone":"9999999999"}'
# expected: {"success":true,"name":"Test Booking","date":"2026-09-20","time":"14:00","service_requested":"exterior_wash"}

# 3f. reschedule
curl -X POST https://<your-n8n-host>/webhook/omnidim-calendar-tool \
  -H "Content-Type: application/json" \
  -d '{"action":"reschedule","phone":"9999999999","new_date":"2026-09-20","new_time":"15:30"}'
# expected: {"success":true,"action":"reschedule","new_date":"...","new_time":"15:30",...}
# Then check Google Calendar — event moved? Sheet has new row with status=Rescheduled?

# 3g. manager alert
curl -X POST https://<your-n8n-host>/webhook/omnidim-manager-alert \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"9999999999","customer_name":"Test","reason":"smoke test","language":"english"}'
# expected: {"success":true,"message":"Manager alerted."}
# Your Telegram group should ping.

# 3h. post-call with HANDOFF token
curl -X POST https://<your-n8n-host>/webhook/omnidim-post-call \
  -H "Content-Type: application/json" \
  -d '{"body":{"caller_number":"9999999999","summary":"HANDOFF: caller requested manager","call_report":{"extracted_variables":{"customer_name":"Test","language_detected":"english"}}}}'
# expected: 200 OK. Sheet has new row with status=Handoff Required. Telegram pings.
```

**Clean up test data before demo**: delete the test calendar event and test sheet rows.

## 4. Deploy the dashboard

```bash
cd voice
npm install
npm run build            # sanity check — fixes any TS errors before deploy
```

Deploy to Vercel:
```bash
# if first time
npx vercel login
npx vercel                # deploy preview
npx vercel --prod         # promote to production
# OR: push to GitHub main and let Vercel auto-deploy if you've connected the repo
```

**Vercel environment variables to set** (Vercel dashboard → Project → Settings → Environment Variables):
- `GOOGLE_SHEET_ID_DETAILING`
- `AUTHORIZED_ADMIN_EMAILS`
- `AUTHORIZED_DETAILING_EMAILS`

**Verify** the deployed dashboard:
- Open the Vercel URL.
- Log in with `shaikatif@gmail.com` (or click "Sign in with Google" — it's still a stub, will accept the hardcoded admin email).
- See the CRM view. Latest calls/appointments/wallet should render from the Sheet.

## 5. Commit + push to GitHub

```bash
cd voice
git status                    # confirm expected files changed
git log --oneline -5          # see the pre-demo commits I made
git add -A                    # stage anything remaining
git commit -m "feat: demo-ready prompt v2, n8n v2, dashboard truthfulness, docs

- OMNIDIM_PROMPT.md rewritten (§0 channel lock, §V/§T split, §B/§R/§H flows)
- n8n-workflow.json rewritten (check-before-book, reschedule route,
  lookup_by_phone, anonymous-name reject, overlap guard, Telegram alerts)
- googleSheets.ts: remove || 'Positive' / || 'Atif' / || 'PPF' silent defaults
- N8N_WORKFLOW.md updated to v2 architecture
- .agents/failure_triage_v2.md — 124 defects from 693-scenario independent analysis
- .agents/omnidim_platform_reference.md — local-only reference (docs blocked by firewall)
- REHEARSAL_SCRIPT.md, POST_DEMO_TODO.md

Fixes 20 CRITICAL + 43 HIGH defects from 2026-09-19 triage.
Refs: .agents/failure_triage_v2.md
"
git push origin main
```

## 6. Rehearsal

Open `REHEARSAL_SCRIPT.md`. Do all 3 flows end-to-end. Record backup screen-captures in case live demo fails.

---

## Rollback (if something breaks during demo prep)

```bash
cd voice
# Rollback a single file to pre-demo state:
cp .backups/2026-09-19_pre_demo/OMNIDIM_PROMPT.md OMNIDIM_PROMPT.md
cp .backups/2026-09-19_pre_demo/n8n-workflow.json n8n-workflow.json
cp .backups/2026-09-19_pre_demo/googleSheets.ts lib/googleSheets.ts

# Or with git — see recent commits:
git log --oneline -10
# Revert to a specific commit (soft — keeps working files):
git checkout <commit_hash> -- <file>

# Or reset the whole tree to the last commit (destructive to uncommitted changes):
git status               # ALWAYS check first
git reset --hard HEAD    # then reset
```

---

## What to WATCH DURING the demo (not blocking, just quality signals)

- On voice: agent should NEVER read *"star"* out loud (means asterisk leaked to voice).
- On voice: prices as spelled words ("nine thousand nine hundred ninety nine"), never *"nine nine nine nine"*.
- On text: prices as ₹ digits, never spelled out.
- Every booking should trigger a real calendar event + Sheet row (open the Sheet in a second tab).
- Escalation calls should ping your Telegram within 2 seconds of call end.
- If a caller asks for 5 PM → agent MUST refuse and suggest ≤ 4:30 PM.
- If caller says name = "Anonymous" or refuses → agent MUST end politely, no booking.
