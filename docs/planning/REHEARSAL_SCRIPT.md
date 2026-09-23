# Rehearsal Script — 3 Golden Demo Flows

Do all three end-to-end BEFORE the client meeting. Record video of each so you have a fallback if live goes wrong.

Language: your choice per flow — Tanglish, Hinglish, or English. Practice at least one in Tanglish (dominant client language).

---

## Flow 1 — Successful Booking (Tanglish voice) 🎯 PRIMARY

**Setup**: Fresh call to your OmniDim number. Have Google Calendar open in a second window.

| Turn | You (as caller, Tanglish) | Expected Siri response |
|---|---|---|
| 1 | *(silence, let agent open)* | *"Namaskaram, DynamicDetailing nunchi Siri. Call quality kosam record avutundi. Ela help cheyagalanu?"* |
| 2 | *"Ceramic coating book cheyali repu ki."* | *"Sure. Repu ye time kavali? Morning nine nunchi evening four thirty madhya slots untayi."* |
| 3 | *"Repu two PM ki."* | *"Okka nimisham, availability check chestunna..."* → [check_slots call] → *"Repu afternoon two o'clock available andi. Mee peru cheptara, and 10-digit WhatsApp number?"* |
| 4 | *"Atif. Number seven eight nine three six eight six five eight one."* | *"Atif garu, mee number seven eight nine three, six eight six five, eight one, correct aa?"* |
| 5 | *"Avunu, correct."* | *"Okka nimisham, book chestunna..."* → [book call] → *"September <tomorrow date>, afternoon two o'clock ki Atif gari ceramic coating appointment confirm ayindi. Details WhatsApp lo save chesestham. Inka em kavali?"* |
| 6 | *"Ledu, thanks."* | *"Thank you for calling DynamicDetailing. Have a great day!"* |

**Verify**:
- Google Calendar has a new event at 2 PM tomorrow, description contains phone `7893686581`.
- Google Sheet has a new row with all fields populated (no "MISSING", no "Positive" default).

**Fail modes to watch**:
- ❌ Agent says *"star seven eight nine three star"* — voice format bleed.
- ❌ Agent says *"confirmed"* before the second filler (means it skipped check_slots).
- ❌ Agent asks for name after you gave it (state tracking broken).
- ❌ Calendar event has no duration (start == end).

---

## Flow 2 — Reschedule (Tanglish voice) 🎯 SECONDARY

**Prerequisite**: You have a booking in the calendar from Flow 1, or manually create one with phone `7893686581`.

| Turn | You (as caller, Tanglish) | Expected Siri response |
|---|---|---|
| 1 | *(silence, let agent open)* | *"Namaskaram, DynamicDetailing nunchi Siri. Call quality kosam record avutundi. Ela help cheyagalanu?"* |
| 2 | *"Naaku existing booking undi, time change cheyali."* | *"Sure. Mee original booking chesinapudu ye number use chesaru? Adhe caller number aa?"* |
| 3 | *"Same number, seven eight nine three six eight six five eight one."* | *"Okka nimisham, check chestunna..."* → [lookup_by_phone] → *"Atif gari, tomorrow two PM ki ceramic coating booking undi, correct aa?"* |
| 4 | *"Avunu, three PM ki move cheyali."* | *"Okka nimisham, reschedule chestunna..."* → [reschedule call] → *"Booking three PM ki move ayindi. Details WhatsApp lo update chesestham. Inka em kavali?"* |
| 5 | *"Ledu."* | *"Thank you for calling. Have a great day!"* |

**Verify**:
- Google Calendar event moved from 2 PM to 3 PM (same event ID).
- Google Sheet has a new row with `status=Rescheduled`, `summary` mentions original time.

**Fail modes**:
- ❌ Agent says *"reschedule tool available kadu, please call 7893686581"* — means backend call failed.
- ❌ Agent creates a NEW booking at 3 PM without removing the 2 PM one (intent-morph bug).
- ❌ Agent forgets your name or asks for it again.

---

## Flow 3 — Complaint + Escalation (Tanglish voice) 🎯 SHOWSTOPPER

**Setup**: Have Telegram group open on your phone so client can see the alert land.

| Turn | You (as caller, Tanglish) | Expected Siri response |
|---|---|---|
| 1 | *(silence)* | *"Namaskaram, DynamicDetailing nunchi Siri. Call quality kosam record avutundi. Ela help cheyagalanu?"* |
| 2 | *"Ceramic coating peeling ayindi, manager tho matladali."* | *"Adi hearing bagaledu, sorry. Manager team dhaggara escalate chestha, personally call chestaru. Mee 10-digit WhatsApp number oka sari cheptara, and em concern anedhi one line lo?"* |
| 3 | *"Seven eight nine three six eight six five eight one. Coating month lo peel ayipoyindi."* | *"Note ayindi. Manager konchem sepatlo call chestharu. Thank you for calling."* |

**Verify** (within 2 seconds of the call ending):
- Telegram group pings with:
  ```
  🚨 DynamicDetailing Alert
  Status: Priority Complaint
  Caller: [name if captured]
  Phone: 7893686581
  Language: tanglish
  Reason: coating peel ayipoyindi
  Summary: COMPLAINT: phone=7893686581 issue="ceramic coating peel"...
  ```
- Google Sheet has new row with `status=Priority Complaint`, `handoff_reason` populated.

**Fail modes**:
- ❌ Telegram doesn't ping — summary didn't start with `COMPLAINT:` or `HANDOFF:` token. This is the #1 systemic bug the prompt v2 fixes. If it fails, agent didn't push the new prompt correctly.
- ❌ Agent says *"we'll refund you"* — never promise refund (guardrail broken).
- ❌ Agent doesn't collect phone number.
- ❌ Agent admits fault: *"adi jaragakuudadu"*, *"our mistake"*.

---

## Backup: 3 defensive answers if live demo goes sideways

If any flow fails mid-call:

1. **"Let me play the recorded version, our AI actually did this correctly last night"** — pull up the video backup.
2. **"That's actually a known edge case we're addressing in v3 — happy to show you how we detect and fix these"** — pivot to the failure_triage_v2.md doc.
3. **"Let me switch to text chat mode — same agent, second channel"** — pivot to the WhatsApp/web chat widget where voice-only bugs don't apply.

---

## Demo talking points (client is Car Detailing studio owner)

Lead with what they care about:
1. **"You get all bookings in your Google Sheet — the same one you already use."** Show the dashboard reading from it live.
2. **"Escalations ping your phone in under 2 seconds."** Play the Telegram ping live.
3. **"Never double-bookings — the AI checks your calendar first."** Show `check_slots` in action.
4. **"Reschedule works — customers don't need to call twice."** Do Flow 2.
5. **"Handles Tanglish, Hinglish, English — same agent."** Do quick language switches within one call if you're bold.
6. **"Your cost: $36/month for OmniDim + ~$5/month for the automation server. That's it."** (WhatsApp API cost = later, when they onboard for real.)

Do NOT lead with:
- Dashboard UI polish (it's rough).
- Multi-tenant features (irrelevant — one client).
- Postgres/Supabase (over-engineering talk).
- 124 defects from testing (they'll ask what's still broken).
