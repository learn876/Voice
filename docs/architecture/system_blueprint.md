# DynamicDetailing Voice AI — System Blueprint
> **What every part of the system does, why it exists, and which rule in the prompt it enforces.**
> Written after a deep read of `OMNIDIM_PROMPT.md` (v2, 520 lines) and the live n8n workflow (`5F1qU0CcqKI8nyCo`, 37 nodes).

---

## 1. Big Picture — How the System Works

```
Customer (phone / WhatsApp / web chat)
        │
        ▼
  OmniDimension AI Agent  ◄──── OMNIDIM_PROMPT.md  (the "brain")
        │
        │  calls tools (HTTP → ngrok → localhost:5678)
        ▼
   n8n Workflow  (the "hands")
        │
        ├── Google Calendar  (real appointment data)
        ├── Google Sheets    (CRM log for dashboard)
        └── Telegram         (manager alert channel)
```

**OmniDimension** is the hosted AI platform. It runs the LLM, handles voice/TTS/STT, and exposes custom "tool" endpoints you define.  
**OMNIDIM_PROMPT.md** is the full instruction set for the LLM — personality, rules, language lock, booking flow, escalation flow, guardrails.  
**n8n** is the automation backend. Every time the AI needs to *do* something (check a calendar, book, log, alert), it fires an HTTP request to n8n. n8n does the actual Google API calls and returns structured JSON back to the AI.

---

## 2. The Prompt — Section by Section

| Section | Purpose |
|---|---|
| `§0` Channel Lock | Decides voice vs text from the *user's* script, not the greeting. Prevents the bot treating a Latin-script chat as a voice call. |
| `§1` Language Lock | Mirrors the exact language/script the user writes in. Never mixes scripts. |
| `§2` Identity & Purpose | Who Siri is, what it can/cannot claim about itself. |
| `§3` Facts | Prices, services, hours — authoritative ground truth. The bot must never hallucinate beyond this. |
| `§4` State Tracking | Session-level memory: name, phone, service, date, tool_calls. Prevents re-asking. |
| `§5` Output Rules | Hard bans: no JSON, no tool names, no confirmation before success. |
| `§6` Timeout Handling | Silent retry once on `{"status":"timeout"}`, then apologize in natural language. |
| `§V` Voice Rules | Spelled-out numbers, prosody, fillers before tool calls, barge-in, silence tolerance. |
| `§T` Text Rules | Digits, WhatsApp bold, no fillers, 4-line max, media rejection. |
| `§B` Booking Flow | 10-step sequence: check → confirm slot → collect name+phone → book → confirm. |
| `§R` Reschedule Flow | Lookup by phone → confirm identity → check new slot → update → confirm. |
| `§H` Escalation/Handoff | De-escalation steps, Telegram alert trigger via `HANDOFF:` / `COMPLAINT:` token. |
| `§G` Guardrails | Off-topic zero-engagement, discount refusal, out-of-scope service deflection. |
| `§W` Working-hour deflection | Voice-only: if no booking intent, deflect to phone number + hang up. |
| `§F` FAQ & Examples | Concrete scripted examples for 10 common scenarios. |

---

## 3. n8n Workflow — Node-by-Node

The workflow has **4 independent entry points** (webhooks), each triggered by a different event from OmniDimension.

---

### PIPELINE 1 — Post-Call Summary (Voice)

**Triggered when:** A voice call ends and OmniDimension sends the call report.

#### Node: `1. Post-Call Webhook`
- **Type:** Webhook (HTTP POST)
- **What it does:** Receives the raw call report JSON from OmniDimension after every voice call ends.
- **Why it exists:** OmniDimension needs somewhere to send the call summary. This is the entry point.
- **Prompt section solved:** `§H3` — *"the call summary MUST begin with the literal token HANDOFF: or COMPLAINT:"* — this webhook receives that summary.

#### Node: `Normalize Post-Call`
- **Type:** Code (JavaScript)
- **What it does:** Cleans and extracts structured fields from the raw call report — `customer_name`, `phone_number`, `service_requested`, `preferred_date_time`, `sentiment`, `language_detected`, `summary`, `transcript`. Also detects if the summary starts with `HANDOFF:` or `COMPLAINT:` and sets `needs_alert = true`.
- **Why it exists:** OmniDimension's raw payload is messy — the extracted variables are nested, phone numbers have `+91` prefixes, names can be placeholder values like "AI" or "Bot". This node sanitizes everything before it touches any Google API.
- **Prompt section solved:** `§4 State Tracking`, `§B2 Anonymous ban`, `§H3 HANDOFF token detection`.
- **Key logic:** Banned name list: `['anonymous','anon','n/a','na','none','test','ai','bot','siri','unknown','unnamed']` — any of these become `MISSING` and won't log a fake name to the CRM.

#### Node: `Log to Google Sheets`
- **Type:** Google Sheets (append row)
- **What it does:** Appends one row to your CRM sheet — every call gets logged with name, phone, service, date, sentiment, language, summary, transcript, status, channel.
- **Why it exists:** This is your CRM database. Your dashboard (Next.js app) reads from this sheet to display call logs, appointment lists, and analytics.
- **Prompt section solved:** Indirectly serves `§4` — persistent record of session state.

#### Node: `If HANDOFF or COMPLAINT`
- **Type:** If (condition branch)
- **What it does:** Checks if the `needs_alert` flag from Normalize is `true`.
- **Why it exists:** Only calls that triggered escalation (§H) need to alert the manager. Normal completed calls skip the Telegram node.
- **Prompt section solved:** `§H3` — *"Without this prefix, n8n won't route to the manager alert."*

#### Node: `Telegram Manager Alert`
- **Type:** HTTP Request (POST to Telegram Bot API)
- **What it does:** Sends a Telegram message to your manager chat with: customer name, phone, service, reason for escalation (HANDOFF or COMPLAINT), and the call summary.
- **Why it exists:** The manager needs real-time notification when a customer is angry, requests a callback, or makes a legal threat. This fires within seconds of the call ending.
- **Prompt section solved:** `§H` — the entire escalation chain culminates here.

---

### PIPELINE 2 — Text Chat Manager Alert

**Triggered when:** During a live text chat, the AI decides to escalate mid-conversation and calls the `manager_alert` tool.

#### Node: `2. Text Chat Manager Alert Webhook`
- **Type:** Webhook (HTTP POST, `responseMode: responseNode`)
- **What it does:** Entry point for real-time escalation alerts fired *during* a text chat (unlike Pipeline 1 which is post-call).
- **Why it exists:** Text chats don't have a "call end" event, so the AI must alert the manager immediately when it detects a complaint mid-session.
- **Prompt section solved:** `§H1` trigger keywords — when the user says "manager se baat karni hai", the AI calls this tool immediately.

#### Node: `Normalize Text Alert`
- **Type:** Code (JavaScript)
- **What it does:** Extracts `customer_name`, `phone_number`, `reason`, `language` from the alert payload.
- **Why it exists:** Same sanitization need as Normalize Post-Call, but for a simpler mid-session payload (no full transcript yet).

#### Node: `Respond to OmniDim (Text Alert)`
- **Type:** Respond to Webhook
- **What it does:** Immediately returns `{"success": true}` back to OmniDimension so the AI gets an instant acknowledgement.
- **Why it exists:** OmniDimension has a 10-second timeout. If n8n doesn't respond fast, the AI sees a timeout. This node fires instantly while the Telegram message may take a moment.
- **Prompt section solved:** `§6 Timeout Handling` — avoids the timeout error path entirely.

*(Note: The actual Telegram send likely continues in the background via the Post-Call pipeline or a separate path — this branch focuses on instant ACK.)*

---

### PIPELINE 3 — Calendar Tool (Core booking engine)

**Triggered when:** The AI calls the `manage_calendar` tool with any of four actions: `check_slots`, `book`, `lookup_by_phone`, or `reschedule`.

This is the most complex pipeline — it handles the entire `§B` and `§R` prompt flows.

#### Node: `3. Calendar Tool Webhook`
- **Type:** Webhook (HTTP POST, `responseMode: responseNode`)
- **What it does:** Entry point. Receives the JSON body: `{ action, date, time, name, phone, service_requested, new_date, new_time }`.
- **Why it exists:** Single entry point for all calendar operations. The AI always calls one webhook URL; the action field determines what happens next.
- **Prompt section solved:** `§B1 step 3` (check_slots call), `§B1 step 8` (book call), `§R1 step 3` (lookup call), `§R2 step 2` (reschedule call).

#### Node: `Route Calendar Action`
- **Type:** Switch
- **What it does:** Reads `body.action` and routes to one of four branches: `check_slots`, `book`, `lookup_by_phone`, or `reschedule`. Unknown actions go to a fallback.
- **Why it exists:** One webhook, four completely different operations. This is the dispatcher.

---

#### Branch A: `check_slots`
*Implements §B1 steps 3-5 — "Is this slot available?"*

#### Node: `Get Events for Date (Check Slots)`
- **Type:** Google Calendar (list events)
- **What it does:** Queries Google Calendar for all events on the requested date (IST time window: 3:30 AM UTC to 11:00 AM UTC = 9 AM–4:30 PM IST).
- **Why it exists:** The calendar is the source of truth for what's booked. n8n must fetch live data — the AI cannot know this on its own.

#### Node: `Compute Free Slots`
- **Type:** Code (JavaScript)
- **What it does:**
  1. Starts with a master list of all possible slots: `09:00, 09:30, 10:00 ... 16:30` (every 30 minutes, 16 slots total).
  2. **Reschedule filter:** If a phone number is passed, it filters out calendar events that belong to that phone number — so the user's *existing* appointment doesn't block their own reschedule.
  3. Computes which slots overlap with any remaining (other people's) events using 30-minute window logic.
  4. Returns `free_slots` (human format: "2:30 PM") and `free_slots_24h` (machine format: "14:30").
- **Why it exists:** Google Calendar doesn't give you a "free slots" list — it gives you a list of existing events. This code inverts that to produce what the AI actually needs.
- **Prompt section solved:** `§B1 step 4-5` — "If preferred time ∈ returned free_slots → proceed. Else → suggest 2 nearest free slots ≤ 4:30 PM."
- **Key design decision:** 30-minute slots (changed from 60-minute after your feedback). Self-overlap exclusion added for reschedule correctness.

#### Node: `Respond Slots to OmniDim`
- **Type:** Respond to Webhook
- **What it does:** Returns the free slots JSON immediately to OmniDimension.
- **Why it exists:** The AI is waiting. Fast response prevents the 10-second timeout.

---

#### Branch B: `book`
*Implements §B1 steps 7-10 — "Actually create the appointment."*

#### Node: `Get Events for Date (Book Overlap Guard)`
- **Type:** Google Calendar (list events)
- **What it does:** Re-fetches all events for the booking date.
- **Why it exists:** The `check_slots` call and the `book` call can be seconds apart. Another customer could have booked the same slot in between. This is a second, independent check to prevent double bookings.
- **Prompt section solved:** `§B1 HARD RULE` — *"Never say 'confirmed' before the manage_calendar tool with action: 'book' has returned success: true."* This guard is what makes that rule enforceable server-side.

#### Node: `Validate + Overlap Guard (Book)`
- **Type:** Code (JavaScript)
- **What it does:**
  1. **Validation:** Checks that `name` is real (not banned), `phone` is exactly 10 digits, `date` is YYYY-MM-DD, `time` is HH:MM, and the slot is within bookable hours (9:00–16:30).
  2. **Overlap check:** Uses 30-minute window logic to see if any existing (other people's) event blocks the requested slot.
  3. Returns `{success: true, validated: true, ...}` or `{success: false, errors: [...]}`.
- **Why it exists:** The AI can make mistakes — hallucinate a name, pass a bad time format, try to book at 6 PM. This node is the final safety gate before anything touches Google Calendar.
- **Prompt section solved:** `§B2 Anonymous ban` (name validation), `§B3 Late-slot refusal` (enforced server-side), `§5 rule 4` (no confirmation before success).

#### Node: `If Book Valid`
- **Type:** If (condition)
- **What it does:** If `validated === true`, proceeds to create the calendar event AND immediately respond to OmniDim (parallel branches). If false, goes to Respond Book Failure.
- **Why it exists:** Two things need to happen: the AI needs an instant response (within the 10s timeout), and the Google Calendar event needs to be created. By connecting `Respond Book Success` directly to `If Book Valid`, the response fires immediately without waiting for Google Calendar.

#### Node: `Respond Book Success`
- **Type:** Respond to Webhook
- **What it does:** Immediately returns `{success: true, date, time, name, phone}` to OmniDimension.
- **Why it exists:** This fires in parallel with `Create Calendar Event`. The AI gets its answer in ~1 second instead of waiting 8-10 seconds for Google Calendar to confirm. This is the fix for the original double-booking problem caused by timeouts.

#### Node: `Create Calendar Event`
- **Type:** Google Calendar (create event)
- **What it does:** Creates a 30-minute calendar event on the "Detailing Studio Appointments" calendar. Title: `"Name (Service)"`. Description: `"Phone: XXXXXXXXXX\nService: PPF\nBooked via OmniDim: [timestamp]"`.
- **Why it exists:** This is the actual booking. The phone number in the description is how `Format Lookup Result` and `Validate + Find Event (Reschedule)` later find this event by phone.
- **Prompt section solved:** `§B4 Post-book confirmation content` — name + service in the title ensures the correct info appears in Calendar.

#### Node: `Log Booking to Sheets`
- **Type:** Google Sheets (append)
- **What it does:** Logs the booking details to Google Sheets — name, phone, service, date/time, channel.
- **Why it exists:** Dashboard needs to show confirmed bookings separately from general call logs.

#### Node: `Respond Book Failure`
- **Type:** Respond to Webhook
- **What it does:** Returns `{success: false, errors: [...], message: "..."}` when validation fails or slot is taken.
- **Why it exists:** The AI checks for `success: false` to know it should apologize and offer alternatives (§B1 step 10).

---

#### Branch C: `lookup_by_phone`
*Implements §R1 — "Find the existing booking."*

#### Node: `Lookup Events by Phone`
- **Type:** Google Calendar (list events)
- **What it does:** Fetches all upcoming calendar events (broad date range).
- **Why it exists:** When a customer says "I want to reschedule", we don't know their booking date. We need to search all future events.

#### Node: `Format Lookup Result`
- **Type:** Code (JavaScript)
- **What it does:**
  1. Filters events to find ones whose `description` contains the customer's phone number.
  2. Sorts by date — picks the *soonest* upcoming event.
  3. Converts the start time from UTC to IST using `Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Kolkata'})` — the correct timezone-safe method.
  4. Extracts the name and service from the calendar title (`"Phani (PPF)"` → `name="Phani"`, `service="PPF"`).
  5. Returns `{success: true, event_id, name, date, time, service_requested, message}`.
- **Why it exists:** The AI needs to say *"Phani gari PPF booking September twenty-second, three PM — correct aa?"* before proceeding. It cannot do that without knowing what's actually booked.
- **Prompt section solved:** `§R1 step 4` — "On match → returns {name, date, time, service}. Confirm identity."
- **Key fix:** The IST conversion was previously done via manual math (`.getTimezoneOffset()`) which produced the wrong hour (9 AM instead of 3 PM). Now uses the Intl API.

#### Node: `Respond Lookup`
- **Type:** Respond to Webhook
- **What it does:** Returns the lookup result to OmniDimension.

---

#### Branch D: `reschedule`
*Implements §R2 — "Move the booking."*

#### Node: `Reschedule: Lookup Event`
- **Type:** Google Calendar (list events)
- **What it does:** Fetches all upcoming events (same as `Lookup Events by Phone`).

#### Node: `Validate + Find Event (Reschedule)`
- **Type:** Code (JavaScript)
- **What it does:**
  1. Validates `new_date`, `new_time`, and that the slot is within bookable hours.
  2. Finds the customer's existing event by matching phone number in the description.
  3. Returns the `event_id` needed to update the Google Calendar event, plus the validated new date/time.
- **Why it exists:** Google Calendar's update API requires the `event_id`. The only reliable way to find it is to fetch all events and filter by the phone number embedded in the description.
- **Prompt section solved:** `§R2` — the whole reschedule update flow.

#### Node: `If Reschedule Valid`
- **Type:** If (condition)
- **What it does:** Routes to Update (true) or Failure (false).

#### Node: `Update Calendar Event`
- **Type:** Google Calendar (update event)
- **What it does:** Moves the existing event to the new date/time. Uses the `event_id` from the previous node.
- **Why it exists:** This is the actual reschedule. It patches the existing event rather than deleting and recreating, preserving the event ID and description.

#### Node: `Log Reschedule to Sheets`
- **Type:** Google Sheets (append)
- **What it does:** Logs the reschedule action.

#### Node: `Respond Reschedule Success` / `Respond Reschedule Failure`
- **Type:** Respond to Webhook
- **What they do:** Return `{success: true/false}` to OmniDimension.
- **Prompt section solved:** `§R2 step 3-4` — on success confirm move; on failure offer manager callback.

#### Node: `Respond Unknown Action`
- **Type:** Respond to Webhook
- **What it does:** Returns an error if `action` is anything other than the four known values.

---

### PIPELINE 4 — Text Chat Post-Session Summary

**Triggered when:** A text chat session ends and OmniDimension sends the chat summary.

*(Mirrors Pipeline 1 but for text/WhatsApp channels.)*

#### Node: `4. Text Chat Summary Webhook`
- Entry point for post-chat summaries.

#### Node: `Normalize Text Summary`
- **Type:** Code (JavaScript)
- **What it does:** Same as Normalize Post-Call — extracts and sanitizes structured fields, detects `HANDOFF:` / `COMPLAINT:` tokens.
- **Why it exists:** Text chat sessions send a slightly different payload shape than voice calls. Same intent, different field names.
- **Prompt section solved:** `§H3` for text channel.

#### Node: `Log Text Summary to Sheets`
- Logs the text session to the same CRM Google Sheet.

#### Node: `If Text HANDOFF or COMPLAINT`
- Routes to Telegram alert if escalation detected.

#### Node: `Telegram Text Alert`
- Fires Telegram manager notification for text-originated escalations.

#### Node: `Respond Text Summary`
- Returns immediate ACK to OmniDimension.

---

## 4. Data Flow Summary

```
check_slots request
  → Route → Get Events → Compute Free Slots → Respond
  
book request
  → Route → Get Events (guard) → Validate + Overlap
       ├─(valid)─→ [INSTANT] Respond Success   ← AI gets answer immediately
       │         → Create Calendar Event         ← runs in background
       │         → Log to Sheets
       └─(invalid)→ Respond Failure

lookup_by_phone request
  → Route → Get All Events → Format Lookup Result → Respond

reschedule request
  → Route → Get All Events → Validate + Find Event
       ├─(valid)─→ Update Calendar → Log → Respond Success
       └─(invalid)→ Respond Failure

post-call (voice)
  → Normalize → Log to Sheets → If HANDOFF? → Telegram Alert

post-session (text)
  → Normalize → Log to Sheets → If HANDOFF? → Telegram Alert

mid-session text alert
  → Normalize → [INSTANT] Respond ACK
```

---

## 5. Open Clarification Questions

The following questions will directly impact how we should refine or extend this system. Please answer as many as you can:

### About the Business
1. **Appointment duration:** You changed from 60 to 30 minutes. Are *all* services 30 minutes? (PPF alone can take 4-6 hours in real life.) Should we have service-specific durations — e.g., wash=30min, PPF=240min?
2. **Multiple bookings per customer:** Can one customer book two separate appointments on different days? Currently the system always picks the *soonest* upcoming event for that phone number. Is that the right behavior?
3. **Cancellations:** There is no `cancel` action in the current workflow. Is this intentional? Do you want the AI to handle cancellations, or just reschedules?
4. **Studio hours vs bookable hours:** The prompt says studio enquiry hours are 9 AM–7 PM, but bookable slots are 9 AM–4:30 PM. Why the gap? Is it because jobs take 2–3 hours to complete?

### About the AI Behavior
5. **3:30 PM vs other half-hours:** The prompt says suggest "2 nearest free slots ≤ 4:30 PM" but the master slot list has 30-minute intervals. Should the AI suggest the 2 nearest 30-minute slots, or any slot?
6. **Reschedule confirmation loop:** The current flow asks for phone, fetches booking, confirms identity, then checks slot, then moves. That's 4 round trips. Is this the right trade-off between safety and speed for your customers?
7. **Language for confirmation messages:** When a booking is confirmed, should the WhatsApp message go in the same language the customer used in the call? Or always in English?

### About the Tech Stack
8. **ngrok dependency:** Currently n8n is running locally behind ngrok. Is the plan to eventually host n8n on a cloud server (e.g., Railway, Render, a VPS)? This would eliminate all the timeout and tunnel-drop issues permanently.
9. **Dashboard deployment:** The Next.js dashboard is ready but not on Vercel. What's blocking deployment — is it the `.env.local` secrets, or something else?
10. **Multi-tenant:** Are you planning to onboard other businesses (gyms, salons) to this same platform, or is this DynamicDetailing-only for now?

---

> **Next steps depend on your answers above.** The system as it stands is functionally correct for DynamicDetailing's current use case. The biggest remaining risks are (a) the ngrok latency/timeout issue and (b) appointment duration mismatch for real services.
