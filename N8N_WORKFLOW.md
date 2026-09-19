# n8n Workflow — v2 Architecture (2026-09-19)

Version: `v2-demo-ready-2026-09-19` (see `n8n-workflow.json` `versionId`).

**This file is authoritative — update it whenever `n8n-workflow.json` changes.**

## Environment variables required in n8n

Set these in n8n → Credentials or `.env` on the n8n host:

| Variable | Purpose |
|---|---|
| `GOOGLE_SHEET_ID_DETAILING` | tenant Sheet ID for DynamicDetailing |
| `TG_BOT_TOKEN` | Telegram BotFather token for handoff alerts |
| `TG_CHAT_ID` | Telegram group chat ID (starts with `-100...`) |

Google Calendar and Google Sheets credentials must be created as n8n Credentials (OAuth2 or Service Account).

## Sheet columns expected

The workflow appends these columns; make sure the DynamicDetailing sheet has them in row 1:

```
call_id | customer_name | phone_number | service_requested | preferred_date_time |
sentiment | language_detected | duration | channel | summary | complaint_details |
handoff_reason | status | created_at
```

## 1. `/webhook/omnidim-post-call` — voice call ended

Fired by OmniDim when a voice call terminates. Payload structure per `docs.omnidim.io`:
- `body.call_report.extracted_variables.{customer_name, service_requested, preferred_date_time, complaint_details, language_detected, sentiment, phone_number, handoff_reason}`
- `body.caller_number` (fallback to `body.phone_number`)
- `body.summary` (agent-emitted; must begin with `HANDOFF:` or `COMPLAINT:` to trigger alert)
- `body.duration`

Flow:
```
Post-Call Webhook → Normalize (JS)
                    - reject placeholder names (Anonymous/Anon/N/A/Test/etc → 'MISSING')
                    - normalize phone to 10 digits (strip +91, spaces, dashes)
                    - detect HANDOFF: / COMPLAINT: token prefix → needs_alert=true
                    - compute status: Priority Complaint | Handoff Required | Completed
                    ↓
                    Log to Google Sheets (append row with 14 cols)
                    ↓
                    IF needs_alert → Telegram Manager Alert (bot API)
```

## 2. `/webhook/omnidim-manager-alert` — explicit text-chat handoff tool

Fired by OmniDim Custom Tool `manager_alert` in text chat when the agent decides to escalate mid-session. Payload:
- `body.phone_number`
- `body.customer_name`
- `body.reason` or `body.complaint`
- `body.language`

Flow:
```
Text Alert Webhook → Normalize → Telegram Alert + Log to Sheets → Respond {success:true}
```

## 3. `/webhook/omnidim-calendar-tool` — in-call calendar operations

Fired by OmniDim Custom Tool `manage_calendar`. Payload `body.action` routes to one of four sub-flows.

### 3a. `action: "check_slots"`

Payload: `{"action": "check_slots", "date": "YYYY-MM-DD"}`

Flow:
```
Route Calendar → Get Events (IST 09:00-16:30 window)
              → Compute Free Slots (JS: subtract busy from master list
                 [09:00, 10:00, 10:30, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 16:30])
              → Respond {success, date, free_slots, message}
```

Master slot list is inside `Compute Free Slots` Code node — adjust there to change bookable hours.

### 3b. `action: "book"`

Payload: `{"action": "book", "date": "YYYY-MM-DD", "time": "HH:MM", "name": "...", "phone": "...", "service_requested": "...", "language": "..."}`

Flow:
```
Route Calendar → Get Events (Book Overlap Guard)
              → Validate + Overlap Guard (JS):
                 - reject placeholder names (Anonymous/etc)
                 - reject phone not 10 digits
                 - reject time outside 09:00-16:30
                 - reject if any existing event overlaps requested [start, start+60min]
              → IF valid
                 → Create Calendar Event (60-min duration, IST timezone,
                    description contains phone for later lookup)
                 → Log Booking to Sheets
                 → Respond {success:true, date, time, name, phone}
              → IF invalid
                 → Respond {success:false, errors:[...], message}
```

### 3c. `action: "reschedule"`

Payload: `{"action": "reschedule", "phone": "...", "new_date": "YYYY-MM-DD", "new_time": "HH:MM", "language": "..."}`

Flow:
```
Route Calendar → Reschedule: Lookup Event (Google Calendar q=phone)
              → Validate + Find Event (JS):
                 - reject invalid phone/date/time or slot outside hours
                 - filter events whose description contains phone
                 - pick earliest matching future event
              → IF valid
                 → Update Calendar Event (new start/end, preserves description
                    with original time noted)
                 → Log Reschedule to Sheets (status="Rescheduled")
                 → Respond {success:true, name, phone, new_date, new_time}
              → IF invalid
                 → Respond {success:false, message}
```

### 3d. `action: "lookup_by_phone"`

Payload: `{"action": "lookup_by_phone", "phone": "..."}`

Flow:
```
Route Calendar → Lookup Events by Phone (Google Calendar q=phone, -30d to +90d)
              → Format Lookup Result (JS: extract name/service from summary,
                 return first upcoming event)
              → Respond {success, name, date, time, service_requested, message}
                 OR {success:false, message}
```

### 3e. Unknown action

Returns `{success:false, error:"unknown_action"}` — routes to `Respond Unknown Action` node.

## 4. `/webhook/omnidim-text-summary` — text chat session ended

Fired when OmniDim text chat session terminates. Same payload shape as post-call (extracted variables).

Flow:
```
Text Summary Webhook → Normalize (channel='text', duration='Text Chat')
                    → Log to Google Sheets
                    → IF needs_alert (summary starts with HANDOFF: / COMPLAINT:)
                       → Telegram Text Alert
                    → Respond {success:true}
```

## OmniDim Custom Tools to configure

In OmniDim dashboard → Agent 252539 → Tools, ensure these are defined:

### Tool: `manage_calendar`
```json
{
  "name": "manage_calendar",
  "description": "Check calendar availability, book, reschedule, or look up an existing booking.",
  "endpoint": "https://YOUR_N8N_HOST/webhook/omnidim-calendar-tool",
  "method": "POST",
  "parameters": {
    "action": {"type": "string", "enum": ["check_slots", "book", "reschedule", "lookup_by_phone"], "required": true},
    "date": {"type": "string", "description": "YYYY-MM-DD"},
    "time": {"type": "string", "description": "HH:MM 24-hour"},
    "name": {"type": "string"},
    "phone": {"type": "string", "description": "10-digit local number"},
    "service_requested": {"type": "string"},
    "new_date": {"type": "string"},
    "new_time": {"type": "string"},
    "language": {"type": "string"}
  }
}
```

### Tool: `manager_alert`
```json
{
  "name": "manager_alert",
  "description": "Escalate a text-chat session to the human manager immediately.",
  "endpoint": "https://YOUR_N8N_HOST/webhook/omnidim-manager-alert",
  "method": "POST",
  "parameters": {
    "phone_number": {"type": "string", "required": true},
    "customer_name": {"type": "string"},
    "reason": {"type": "string", "required": true},
    "language": {"type": "string"}
  }
}
```

## Post-Call Extracted Variables to configure

In OmniDim dashboard → Agent 252539 → Post-Call → Extracted Variables, add:

| Variable | Description |
|---|---|
| `customer_name` | as spoken/typed by caller (never Anonymous — enforced backend-side) |
| `phone_number` | 10-digit local |
| `service_requested` | one of: exterior_wash, interior_cleaning, ceramic_coating, ppf, headlight_restoration, full_detailing |
| `preferred_date_time` | ISO 8601 preferred |
| `complaint_details` | short summary of complaint if any |
| `handoff_reason` | why escalated (short phrase) |
| `language_detected` | tanglish, hinglish, english, telugu, hindi |
| `sentiment` | positive, neutral, negative |

## Migration to real WhatsApp Cloud API (post-Meta-approval)

When Meta WhatsApp Business Manager is set up:
1. Replace the two `Telegram Manager Alert` / `Telegram Text Alert` HTTP nodes with:
   - `URL`: `https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages`
   - `Authorization: Bearer {WHATSAPP_TOKEN}`
   - Body: WhatsApp template `handoff_alert_v1` with parameters `{name}`, `{phone}`, `{reason}`
2. Add environment variables `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`.
3. Everything else stays identical.
