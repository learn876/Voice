---
name: n8n-omnidim-sync
description: Standard operating procedure for synchronizing payload schemas and webhook URLs between OmniDimension Custom Tools and n8n Workflows to prevent integration breakage.
---

# 🔄 OmniDimension & n8n Sync Protocol

When building or modifying integrations between OmniDimension and n8n, it is extremely common for schema mismatches to break the pipeline. Follow these rules whenever you touch either system.

**CRITICAL MANDATE:** 
ALWAYS use @[c:\Users\SHAIK ATIF\Voice agent\N8N_WORKFLOW.md] as the main thumb reference for understanding the current n8n architecture. Whenever you (the AI) update, patch, or suggest changes to the n8n workflow, you MUST update that file so it remains the absolute source of truth.

## 1. Bi-Directional Schema Updates

Whenever a user requests a change to a data field, you MUST update both sides:
*   **OmniDimension Side:** The inputs defined in the Agent's "Custom Tools" settings or the `omnidim_api_config.md` artifact.
*   **n8n Side:** The `n8n-workflow.json` file where `={{ $json.body.FIELD_NAME }}` expressions pull data from the webhook.

**Example Scenario:** The user wants to start tracking the customer's "Car Model" during bookings.
*   **OmniDim Action:** Add a new `car_model` string input to the `manage_calendar` tool.
*   **n8n Action:** Update the Google Calendar "Create Event" node in `n8n-workflow.json` to append `\nCar: {{$json.body.car_model}}` to the description.

## 2. Naming Conventions

*   All fields sent from OmniDimension to n8n must be `snake_case` (e.g., `phone_number`, `service_requested`).
*   Never use spaces or hyphens in JSON keys.
*   If you rename a tool parameter in OmniDimension, search `n8n-workflow.json` for the old variable name (e.g., `$json.body.old_name`) and replace it with the new name.

## 3. Tool Webhook URL Synchronization

OmniDimension routes custom tools via Webhooks. Because local development often relies on `ngrok` or `localtunnel`, the base URL changes frequently.
*   If the n8n tunnel URL changes, you MUST remind the user to update the "Webhook URL" field for ALL custom tools in the OmniDimension dashboard.
*   The path must exactly match the Webhook Node's path in n8n (e.g., `/webhook/omnidim-calendar-tool`).

## 4. Post-Call vs Custom Tool Payloads

*   **Post-Call Webhook (Native):** OmniDimension sends a massive default payload for Voice Calls at the end of the call, including `duration`, `recording_url`, `call_report`, and `summary`. Do not try to alter the schema of the native post-call webhook from the OmniDimension side; instead, adapt the n8n side to handle it.
*   **Custom Tools:** You fully control these payloads. Ensure inputs are marked `Required` if n8n logic depends on them.

## 5. Verification Checklist

Before ending your turn after an integration change, verify:
- [ ] Are all new fields defined in the OmniDimension tool instructions?
- [ ] Are all new fields correctly referenced with `{{ $json.body.field_name }}` in n8n?
- [ ] Did you check for case-sensitivity mismatches (e.g., `Date` vs `date`)?
- [ ] Did you update the `omnidim_api_config.md` documentation so the user knows what to put in the dashboard?
