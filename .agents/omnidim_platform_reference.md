# OmniDimension Platform Reference

> **FETCH STATUS — READ FIRST.**
> All attempts to reach `https://docs.omnidim.io`, `https://backend.omnidim.io`, and `https://www.omnidim.io` from this workstation were blocked by the Molina Healthcare corporate web filter (block page served from `13.56.108.23`, no HTTPS response). WebFetch also refuses the domain (`Unable to verify if domain docs.omnidim.io is safe to fetch`). No page of the docs site could be retrieved during this research pass.
>
> Everything below marked `DOCS-INCOMPLETE-FIREWALL-BLOCKED` needs to be filled in from an unfiltered network (personal laptop / hotspot) or from the OmniDim dashboard directly. Facts that ARE stated below come from local project files that were already committed against a known-good agent (Agent ID `252539`) — those are cited by absolute path, not URL.
>
> Do NOT treat this document as authoritative for retention, pricing, rate-limit, or retry values. Those must come from the OmniDim docs / dashboard / support.

---

## 1. Data Retention

- **Call recordings:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED` — check dashboard (`Settings → Data & Privacy`) or ask OmniDim support on Discord (`https://discord.gg/kdjzykMTHJ`, cited from `run_simulations.py:187`).
- **Transcripts:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **Post-call payloads (webhook history in dashboard):** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **Per-plan-tier retention:** `DOCS-INCOMPLETE-CHECK-DASHBOARD` — no local reference to plan-based retention limits.

> Recommended dashboard verification path: `Agent → Post-Call tab → Recordings/Storage`, plus `Account → Billing/Plan`.

---

## 2. Post-Call Webhook Payload

Fields we know are emitted, because n8n consumes them in production. Source of truth: `n8n-workflow.json` (the mapping expressions) and `N8N_WORKFLOW.md` (schema commentary).

| Field | Path in payload | Type (observed) | Source |
|---|---|---|---|
| `call_report` | `body.call_report` | object | `n8n-workflow.json:36-38` |
| `call_report.extracted_variables` | `body.call_report.extracted_variables` | object (key/value) | `n8n-workflow.json:36-38` |
| `call_report.extracted_variables.customer_name` | ` ` | string | `n8n-workflow.json:36` |
| `call_report.extracted_variables.service_requested` | ` ` | string | `n8n-workflow.json:37` |
| `call_report.extracted_variables.preferred_date_time` | ` ` | string | `n8n-workflow.json:38` |
| `call_report.extracted_variables.complaint_details` | ` ` | string | `N8N_WORKFLOW.md:12` |
| `caller_number` | `body.caller_number` | string \| absent | `n8n-workflow.json:39`, `N8N_WORKFLOW.md:13` |
| `phone_number` | `body.phone_number` | string \| absent | `n8n-workflow.json:39` — used as fallback when `caller_number` is dropped (web simulator calls) |
| `summary` | `body.summary` | string | `n8n-workflow.json:41` — may contain sentinel substrings like `HANDOFF` or `COMPLAINT` because our prompt encodes them (`N8N_WORKFLOW.md:14`) |
| `duration` | `body.duration` | number or string | `n8n-workflow.json:40` — used as-is; unit not confirmed locally |

**`sentiment`** — `DOCS-INCOMPLETE-FIREWALL-BLOCKED`. Not consumed by our n8n workflow, so we have no local example. Likely delivered under `call_report` or a `sentiment` top-level key; needs docs check.

**`transcript`** — `DOCS-INCOMPLETE-FIREWALL-BLOCKED`. Not currently consumed by our n8n workflow; assumed to live under `call_report.transcript` or `body.transcript`. Confirm shape (array of turn objects vs single string) from docs.

**`call_duration`** — Locally referenced as `body.duration`. Whether the docs also expose `call_duration` as an alias is `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.

**`agent_id`** — `DOCS-INCOMPLETE-FIREWALL-BLOCKED`. Almost certainly present, but not read anywhere in `n8n-workflow.json`. Likely `body.agent_id` (integer). Our local agent ID is `252539` (`update_agent_prompt.py:47`, `run_simulations.py:12`).

**Recording URL** — see Section 7. Not currently mapped in `n8n-workflow.json`; confirm the field name from docs (likely `recording_url` per `.agents/skills/n8n-omnidim-sync/SKILL.md:37`).

**Channel indicator (voice vs web chat)** — `DOCS-INCOMPLETE-FIREWALL-BLOCKED`. See Section 5 note about how our workflow distinguishes them today.

> **DO NOT trust this as a complete schema.** It only lists the fields we currently consume. There are almost certainly more fields (agent metadata, call outcome, cost, etc.).

---

## 3. Custom Tools

Local knowledge (from `.agents/skills/n8n-omnidim-sync/SKILL.md`, `N8N_WORKFLOW.md`, and observed prompt/tool wiring):

- Custom Tools are configured **in the OmniDim dashboard under the agent's configuration**, not via SDK — the local skill file `.agents/skills/update-omnidimension-agent/SKILL.md:19-21` explicitly warns "OmniDimension MCP and SDK currently do not have a safe endpoint strictly for updating individual custom tool parameters."
- A tool is defined by:
  - **Name** (e.g., `manage_calendar`, `manager_alert`).
  - **Parameters** — each has a name, type, description, and a `Required` flag (`.agents/skills/n8n-omnidim-sync/SKILL.md:39`).
  - **Endpoint** — an HTTP Webhook URL (`.agents/skills/n8n-omnidim-sync/SKILL.md:29-34`). The path must match the receiving webhook exactly (e.g., `/webhook/omnidim-calendar-tool`).
- Field-name convention: **`snake_case`** (`.agents/skills/n8n-omnidim-sync/SKILL.md:26`).
- **Mid-call emission:** POST body arrives at the configured webhook. Our workflow reads args as `$json.body.<field>` (see any `Route by Action` node in `n8n-workflow.json`).
- **Response format the agent expects:** JSON. Concrete examples from `n8n-workflow.json`:
  - Slot check → `{"status":"success","slots":"2:00 PM, 3:30 PM, 5:00 PM"}` (line 288).
  - Booking → `{"status":"success","message":"Appointment booked successfully"}` (line 303).
  - Manager alert → `{"status":"Success","message":"Manager alerted successfully."}` (line 147).
- **Timeout behavior:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`. No local evidence of the platform's tool-call timeout. Empirically it is a few seconds (the voice prompt E2 mandates a filler *before* every tool call to mask latency — `.agents/VOICECONFIG.md:158-164`).
- **Retries on tool failure:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.

---

## 4. Simulation API

The primary reference for this section is the already-maintained file `c:\Users\ShaikAti\OneDrive - Molina Healthcare\Automation\Testing\voice\SIMULATION_API_REFERENCE.md`. That file cites `https://docs.omnidim.io/docs/api-reference/simulation/listSimulations`. Below are **additions / extensions** learned from local scripts, not restated content.

### Base + Auth (from `run_simulations.py:12-13`, `SIMULATION_API_REFERENCE.md`)
- Base URL: `https://backend.omnidim.io/api/v1`
- Auth: `Authorization: Bearer <API_KEY>`
- Bearer keys are personal per-account tokens (example key format visible in `run_simulations.py:11` — 43-char base62 token).

### Endpoints (already in `SIMULATION_API_REFERENCE.md`)
See that file, section "API Endpoints (7 total)". No changes.

### Create payload — confirmed shape (`run_simulations.py:76-84`, `127-134`)
```json
{
  "name": "DynamicDetailing Regression Suite",
  "agent_id": 252539,
  "number_of_call_to_make": 1,
  "concurrent_call_count": 2,
  "max_call_duration_in_minutes": 3,
  "scenarios": [
    {
      "name": "...",
      "description": "...",
      "expected_result": "..."
    }
  ]
}
```
- All four numeric fields are **integers**.
- `scenarios[].selected_voices` is optional (omitted in our runner — platform picks a default).

### Create response — confirmed shape
Response body contains `simulation.id` (`run_simulations.py:145` reads `data["simulation"]["id"]`).

### Start / Stop / Enhance-Prompt / Delete
Already documented in `SIMULATION_API_REFERENCE.md`. No new local information.

### Known 403 gotcha
`403 Forbidden: You do not have permission to make changes to Call Simulation` — the Simulation write API is gated per account. `GET /simulations` still works. Fix: request enablement via OmniDim Discord (`SIMULATION_API_REFERENCE.md:202-205`, `run_simulations.py:184-189`).

### Fetching results
- `GET /simulations/{id}` returns the same object type as `POST /simulations` plus `status`, `progress`, `analyticsData`, `what_went_wrong`, `suggestions_for_improvement`, `prompt_suggestion`, `simulation_call_recording` (documented in `SIMULATION_API_REFERENCE.md:96-113`).
- Polling cadence recommendation: `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.

### Simulation Python SDK surface (from `run_simulations.py:69-91`)
```python
from omnidimension import Client
client = Client(api_key=API_KEY)
client.simulation.list(pageno=1, pagesize=10)
client.simulation.create(name=..., agent_id=..., number_of_call_to_make=..., concurrent_call_count=..., max_call_duration_in_minutes=..., scenarios=[...])
client.simulation.start(sim_id)
client.simulation.stop(sim_id)
client.simulation.get(sim_id)
client.simulation.update(sim_id, {...})
client.simulation.delete(sim_id)
client.simulation.enhance_prompt(sim_id)   # only after status=Completed
```

---

## 5. Web Chat Widget

- **Configuration:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`. Local skill `.agents/skills/omnidimension-ui-guide/SKILL.md` explicitly says "Do not guess or assume UI locations" — treat this as a hard gap.
- **How it differs from voice:** Locally we treat them as separate channels with different formatting rules — see `.agents/VOICECONFIG.md` (voice) and `.agents/TEXTCONFIG.md` (text). Voice output is TTS-shaped (no markdown, chunked numbers, Telugu script, etc.); text chat allows markdown.
- **Channel indicator in webhooks:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`. In our current n8n handling we distinguish them by **which webhook fires** (`/webhook/omnidim-post-call` for voice, `/webhook/omnidim-text-summary` for text — `N8N_WORKFLOW.md:7,36`) and by the workaround `body.duration = "Text Chat"` set in the Format Summary node (`n8n-workflow.json:371-373`). Whether the OmniDim payload itself carries a `channel` or `medium` field natively needs confirmation from docs.
- **`caller_number` behavior for web chat:** OmniDim **drops** `body.caller_number` on web-simulator/web-chat calls; the n8n side must fall back to `body.phone_number` (`N8N_WORKFLOW.md:13`, `n8n-workflow.json:39`).

---

## 6. Rate Limits

- **Per endpoint:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **Per API key:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **Per agent:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **Simulation concurrency (soft limit):** `concurrent_call_count` is documented as `1–3` in `SIMULATION_API_REFERENCE.md:69`; that is a per-simulation cap, not an account-wide rate limit.
- **Simulation calls-per-scenario:** `1–3` (`SIMULATION_API_REFERENCE.md:68`).

---

## 7. Recording URLs

- **In the post-call payload?** Almost certainly yes — `.agents/skills/n8n-omnidim-sync/SKILL.md:37` names `recording_url` as one of the "massive default payload" fields for voice calls. **However**, our current `n8n-workflow.json` does not consume it, so the exact field key and shape (single URL vs object with expiry) are `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **TTL / signed-URL validity window:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`. Must be confirmed against docs and by hitting a real URL from a completed call. **Assume it may expire** — download and re-host in your own storage if you need long-term access.

---

## 8. Agent Update API (Python SDK)

Source: `update_agent_prompt.py` (this repo's production update script) and `.agents/skills/update-omnidimension-agent/SKILL.md`.

### Call signature (confirmed)
```python
from omnidimension import Client
client = Client(api_key=api_key)
res = client.agent.update(agent_id=252539, data=update_payload)
# res -> {"json": {"id": ..., "status": ...}, ...}
```

### `data` payload — fields we USE in production (`update_agent_prompt.py:40-45`)
| Field | Type | Notes |
|---|---|---|
| `context_breakdown` | `list[{title, body, is_enabled}]` | Sectioned prompt. `title` is a heading (our script parses `## ` markdown headings from `OMNIDIM_PROMPT.md`), `body` is the markdown body of that section, `is_enabled` is a boolean. |
| `context` | `string` | Flat concatenation of all sections (`# {title}\n{body}` joined by blank lines). Sent alongside `context_breakdown` — appears the platform accepts both. |
| `welcome_message` | `string` | First utterance the agent speaks / writes. Example in prod: `"Hello.. DynamicDetailing Studio nunchi Siri matladutunna. Ela help cheyagalanu andi?"` |

### Additional fields — mentioned in local docs, not exercised by our update script
- `tools` — mentioned in the task brief; the local skill `.agents/skills/update-omnidimension-agent/SKILL.md:19-21` warns that the update endpoint is **unsafe for tool edits**: "OmniDimension MCP and SDK currently do not have a safe endpoint strictly for updating individual custom tool parameters. If a custom tool's description, parameter list, or parameter descriptions need to change (e.g., changing a date parameter format), you must instruct the user to make this change manually in the OmniDimension Dashboard." Treat programmatic `tools=[...]` updates as **destructive** — passing an incomplete tools array will delete tools not in the payload.
- `speech_speed` — noted as a safe scalar setting (`.agents/skills/update-omnidimension-agent/SKILL.md:17`). Type presumably `float`.
- `integrations` / `webhooks` — noted as nested config that can be accidentally destroyed by a partial `update` (`.agents/skills/update-omnidimension-agent/SKILL.md:17`). Do NOT send unless you also send the full existing config back.
- Voice provider, voice ID, language, STT provider, model, temperature, post-call webhook URL, extraction schema — `DOCS-INCOMPLETE-FIREWALL-BLOCKED`. All configurable in the dashboard; SDK field names need verification.

### Safety rule (repository-local convention)
Prefer editing `OMNIDIM_PROMPT.md` and running `python update_agent_prompt.py`. Do **not** hand-craft a huge JSON payload — you will silently delete fields you did not include.

---

## 9. Extracted Variables

- **Where to configure:** Agent dashboard → **Post-Call tab** (`.agents/skills/omnidimension-ui-guide/SKILL.md:16`). Add one entry per variable you want extracted after each call.
- **What arrives in the webhook:** `body.call_report.extracted_variables.<var_name>` (string values in our observed traffic).
- **Fields currently configured for our agent** (from `n8n-workflow.json:36-38` and `N8N_WORKFLOW.md:12`):
  - `customer_name`
  - `service_requested`
  - `preferred_date_time`
  - `complaint_details`
- **Naming convention:** `snake_case` (`.agents/skills/n8n-omnidim-sync/SKILL.md:26`). Never spaces or hyphens.
- **Optional-field handling on the consumer side:** Always fall back — e.g., `{{ $json.body.call_report?.extracted_variables?.customer_name || 'N/A' }}` — because OmniDim omits variables that were not filled during the call (`N8N_WORKFLOW.md:12`).
- **Field types:** All string in our current setup. Whether the dashboard supports typed fields (number/boolean/date) is `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **Sync obligation:** Whenever an extraction field is added or renamed in the OmniDim dashboard, `n8n-workflow.json` and `N8N_WORKFLOW.md` must be updated in the same change (`.agents/skills/n8n-omnidim-sync/SKILL.md:14-22`).

---

## 10. Multilingual Support

- **Languages actively used in this project:** Telugu (primary, ~60% of callers by our prompt's assumption), Hindi, and English (`.agents/VOICECONFIG.md:16-23`).
- **Language detection & lock:** Handled **inside the prompt** by SECTION A of `OMNIDIM_PROMPT.md` / `.agents/VOICECONFIG.md` (first-turn detection based on ≥70% token dominance, then locked for the call unless the caller code-switches for 2+ consecutive turns). This is prompt-level logic — whether OmniDim has a **platform-level** auto-detect setting that would be preferable is `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **STT choice:** Soniox is used in this project (`.agents/VOICECONFIG.md:256`), which supports multilingual code-switching well. Configurable in the dashboard.
- **TTS choice:** Cartesia (`.agents/VOICECONFIG.md:166, 179`). Prosody controlled via punctuation, not SSML.
- **Voice providers accepted by the Simulation API:** `eleven_labs`, `play_ht`, `deepgram`, `cartesia`, `rime` (`SIMULATION_API_REFERENCE.md:92`).
- **Language-config field on the agent (SDK):** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`. Our `update_agent_prompt.py` does not set language — Telugu/Hindi/English handling is entirely prompt-driven.

---

## 11. Pricing Tiers

- **$36/mo plan features:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`. No local reference to plan names, included minutes, agent counts, or number allocations.
- **Minutes included / overage rate:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **Agents included / max concurrent agents:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **Phone numbers included:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.

> Check `https://www.omnidim.io/pricing` (blocked from this workstation) or the `Account → Billing` page in the dashboard. Do not quote pricing from memory in any deliverable — verify at the source.

---

## 12. Webhook Retry Behavior

- **Retries on 5xx / timeouts:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **Retry count:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **Backoff schedule:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **Deduplication (idempotency key in header):** `DOCS-INCOMPLETE-FIREWALL-BLOCKED`.
- **Dashboard replay:** `DOCS-INCOMPLETE-FIREWALL-BLOCKED` — check for a "Webhook Deliveries" / "Logs" tab.

> Practical guidance for our stack: n8n **must** return a 2xx quickly, otherwise we risk either duplicate deliveries (if OmniDim retries) or permanent data loss (if it does not). Assume **no retries** until proven otherwise, and make n8n robust (queue + persist to Google Sheets before returning 200).

---

## Unresolved (needs dashboard/support check)

All items below could not be answered from local project files and could not be fetched from docs.omnidim.io due to the Molina web filter. Bring them up on OmniDim Discord (`https://discord.gg/kdjzykMTHJ`) or verify from a non-corporate network.

1. **Data retention windows** for recordings, transcripts, post-call payload archives — Section 1.
2. **Full post-call payload schema** — the `sentiment`, `transcript`, `call_duration` (vs `duration`), `agent_id`, `channel`, recording URL, cost, and metadata fields. Section 2 and Section 7.
3. **Custom tool timeout and retry behavior** — Section 3.
4. **Rate limits** per endpoint / per API key / per agent, plus simulation polling cadence — Section 6.
5. **Recording URL TTL / signed-URL expiry** — Section 7.
6. **Complete `client.agent.update()` field list** — voice provider, voice ID, language, STT, model, temperature, tools schema, integrations, post-call webhook URL and extraction schema — Section 8.
7. **Extraction field typing** — do dashboard fields support types beyond string? Section 9.
8. **Platform-level language auto-detect** vs prompt-level detection — Section 10.
9. **$36/mo plan contents** (minutes, agents, numbers, overages) and other tier definitions — Section 11.
10. **Post-call webhook retry policy** (count, backoff, idempotency headers, dashboard replay) — Section 12.
11. **Web chat widget config, embed snippet, and native channel indicator in webhook payload** — Section 5.
12. **Where in the dashboard tool definitions live and whether the Node SDK has a `client.tools.*` surface** distinct from `client.agent.update({tools: ...})` — Section 3 and 8.

---

## Appendix — Local sources cited above (absolute paths)

- `c:\Users\ShaikAti\OneDrive - Molina Healthcare\Automation\Testing\voice\SIMULATION_API_REFERENCE.md`
- `c:\Users\ShaikAti\OneDrive - Molina Healthcare\Automation\Testing\voice\N8N_WORKFLOW.md`
- `c:\Users\ShaikAti\OneDrive - Molina Healthcare\Automation\Testing\voice\n8n-workflow.json`
- `c:\Users\ShaikAti\OneDrive - Molina Healthcare\Automation\Testing\voice\update_agent_prompt.py`
- `c:\Users\ShaikAti\OneDrive - Molina Healthcare\Automation\Testing\voice\run_simulations.py`
- `c:\Users\ShaikAti\OneDrive - Molina Healthcare\Automation\Testing\voice\.agents\VOICECONFIG.md`
- `c:\Users\ShaikAti\OneDrive - Molina Healthcare\Automation\Testing\voice\.agents\TEXTCONFIG.md`
- `c:\Users\ShaikAti\OneDrive - Molina Healthcare\Automation\Testing\voice\.agents\skills\omnidim-reference-skill\SKILL.md`
- `c:\Users\ShaikAti\OneDrive - Molina Healthcare\Automation\Testing\voice\.agents\skills\omnidimension-ui-guide\SKILL.md`
- `c:\Users\ShaikAti\OneDrive - Molina Healthcare\Automation\Testing\voice\.agents\skills\update-omnidimension-agent\SKILL.md`
- `c:\Users\ShaikAti\OneDrive - Molina Healthcare\Automation\Testing\voice\.agents\skills\n8n-omnidim-sync\SKILL.md`
