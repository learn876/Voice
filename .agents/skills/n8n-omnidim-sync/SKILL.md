---
name: n8n-omnidim-sync
description: Rules for keeping OmniDim Custom Tools, n8n webhook payloads, and the n8n-workflow.json schema in lockstep. Prevents integration drift.
---

# n8n ↔ OmniDim Sync Protocol

**Load this skill any time you touch either:**
- A Custom Tool parameter in the OmniDim agent
- A webhook payload field in `n8n-workflow.json`
- A field name in `N8N_WORKFLOW.md`
- A column in the Google Sheet consumed by n8n

## The invariant

Every named field must be **traceable end-to-end**:

```
OmniDim Custom Tool parameter name
   ↓ (identical name)
n8n webhook body.<field>
   ↓ (referenced in a Code / Sheets node)
Google Sheet column name  OR  Calendar event field
   ↓ (read by)
Next.js dashboard (lib/googleSheets.ts)
```

If any hop uses a different spelling, the field is silently null.

## When you're about to touch either side

### Before editing
1. `git diff HEAD~5 -- n8n-workflow.json N8N_WORKFLOW.md OMNIDIM_PROMPT.md` — see recent related changes.
2. Read the current `N8N_WORKFLOW.md` — it is source of truth for the workflow's shape.
3. Read the relevant section of `n8n-workflow.json` — do not trust the doc alone.

### While editing
Update in this order to catch inconsistencies early:

1. **`N8N_WORKFLOW.md`** — write the doc first. If you can't cleanly describe the change, don't ship it.
2. **`n8n-workflow.json`** — implement.
3. **`OMNIDIM_PROMPT.md`** (if the agent needs to know) — reference the field.
4. **`docs/planning/NEXT_STEPS_VERIFICATION.md`** — tell the human what dashboard UI updates are still needed on the OmniDim side.

### After editing
Verify:
1. **JSON parses**: `node -e 'JSON.parse(require("fs").readFileSync("n8n-workflow.json","utf8"))'` → no throw.
2. **Field grep**: `grep -o '\$json\.body\.[a-z_]\+' n8n-workflow.json | sort -u` — every field name matches what the docs describe.
3. **Doc grep**: every field named in `N8N_WORKFLOW.md` should appear in `n8n-workflow.json`.

## Naming conventions (enforced)

- **snake_case** for all JSON keys crossing the wire. Never camelCase, never kebab-case, never spaces.
- **English** field names. No Tanglish/Hindi in schema. Content in schema fields may be non-English; keys never are.
- **Phone**: always `phone` or `phone_number` (both accepted in v2 normalizers). Always 10-digit local, stripped of `+91`.
- **Date**: always ISO `YYYY-MM-DD`.
- **Time**: always `HH:MM` 24-hour, IST.
- **Action verbs**: `check_slots`, `book`, `reschedule`, `lookup_by_phone`. Never `checkSlot`, `bookAppt`.

## Payload shapes to memorize

### OmniDim → n8n `/webhook/omnidim-post-call`
```
{
  body: {
    caller_number: string,           // may be missing on web calls
    phone_number: string,             // fallback
    summary: string,                  // "HANDOFF: …" or "COMPLAINT: …" prefix triggers alert
    duration: string,
    call_report: {
      extracted_variables: {
        customer_name, phone_number, service_requested,
        preferred_date_time, complaint_details, handoff_reason,
        language_detected, sentiment
      }
    }
  }
}
```

### OmniDim → n8n `/webhook/omnidim-calendar-tool`
```
{ body: { action: "check_slots" | "book" | "reschedule" | "lookup_by_phone",
          date, time, name, phone, service_requested,
          new_date, new_time, language } }
```

### n8n → OmniDim (Custom Tool response)
Must include `{ success: boolean, message: string }`. Additional fields per action documented in `N8N_WORKFLOW.md`.

## What you must never do

- **Never** silently rename a field on one side without updating the other.
- **Never** hardcode Sheet IDs, Meta phone IDs, or tokens. Use `$env.<name>`.
- **Never** commit a `n8n-workflow.json` with hardcoded credentials — n8n's Import UI strips them but git history keeps them.
- **Never** modify a Custom Tool's schema via SDK; instruct the human to do it in the UI.
- **Never** claim the workflow works without a curl smoke-test.

## Smoke tests to include in your handoff

Any change to `omnidim-calendar-tool`:
```bash
curl -X POST https://<n8n-host>/webhook/omnidim-calendar-tool \
  -H "Content-Type: application/json" \
  -d '{"action":"check_slots","date":"YYYY-MM-DD"}'
```

Any change to `omnidim-post-call`:
```bash
curl -X POST https://<n8n-host>/webhook/omnidim-post-call \
  -H "Content-Type: application/json" \
  -d '{"body":{"caller_number":"9999999999","summary":"HANDOFF: test","call_report":{"extracted_variables":{"customer_name":"Test"}}}}'
```

Both should hit the Sheet within 3 seconds. If Telegram is wired, escalation smoke test should ping the group.

## When webhook base URL changes

If you switched n8n hosts (VPS move, ngrok tunnel restart, port change):
1. Update every Custom Tool's webhook URL in the OmniDim dashboard.
2. Update `docs/planning/NEXT_STEPS_VERIFICATION.md` with the new URL.
3. Don't leave stale URLs in docs.

## What this skill replaced

Same-named skill with `SHAIK ATIF` broken paths. Rewrite adds the smoke-test loop and the naming discipline that produced the 2026-09-19 v2 workflow.
