# OmniDimension Simulation API — Reference Guide

> Complete reference for testing your Voice Agent with automated simulations.
> Source: [OmniDimension API Docs](https://docs.omnidim.io/docs/api-reference/simulation/listSimulations)

---

## What Are Simulations?

Simulations let you **programmatically test your voice agent** by creating AI-powered "fake callers" that follow scripted scenarios. Each scenario defines:
- **What the fake caller should do** (e.g., "Ask for ceramic coating pricing, then book an appointment at 2 PM")
- **What the agent should do** (expected result, e.g., "Agent should quote ₹9,999 and successfully book")

After the simulation runs, OmniDimension gives you:
- **Sentiment analytics** (Positive / Negative / Neutral)
- **What went wrong** (text summary of failures)
- **Suggestions for improvement** (actionable feedback)
- **Prompt suggestions** (auto-generated prompt improvements via the Enhance Prompt endpoint)
- **Call recordings** for each scenario

---

## API Endpoints (7 total)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/simulations` | List all simulations (paginated) |
| `POST` | `/simulations` | Create a new simulation with scenarios |
| `GET` | `/simulations/{id}` | Get detailed info for one simulation |
| `PUT` | `/simulations/{id}` | Update an existing simulation |
| `DELETE` | `/simulations/{id}` | Permanently delete a simulation |
| `POST` | `/simulations/{id}/start` | Start running a simulation |
| `POST` | `/simulations/{id}/stop` | Stop a running simulation |
| `POST` | `/simulations/{id}/enhance-prompt` | Get AI prompt-improvement suggestions (only after `Completed`) |

**Base URL:** `https://backend.omnidim.io/api/v1`
**Auth:** `Authorization: Bearer <API_KEY>`

---

## Simulation Lifecycle

```
Create (Draft) → Start (Pending → In Progress) → Calculating Summary → Completed
                                                                      ↗
                                              Stop ──────────────→ Stopped
```

### Status Values
| Status | Meaning |
|--------|---------|
| `Draft` | Created but not yet started |
| `Pending` | Queued and about to start |
| `In Progress` | AI callers are actively talking to your agent |
| `Calculating Summary` | Calls finished, analytics being computed |
| `Completed` | Done — results, recordings, and analytics available |
| `Stopped` | Manually stopped before completion |

---

## Create Simulation — Request Body

```json
{
  "name": "DynamicDetailing Full Regression",
  "agent_id": 252539,
  "number_of_call_to_make": 1,       // 1–3 calls per scenario
  "concurrent_call_count": 3,         // 1–3 concurrent calls
  "max_call_duration_in_minutes": 3,  // 1–10 minutes per call
  "scenarios": [
    {
      "name": "Scenario Name",
      "description": "Step-by-step instructions for the fake caller",
      "expected_result": "What the agent should do correctly",
      "selected_voices": [
        { "id": "voice_id", "provider": "eleven_labs" }
      ]
    }
  ]
}
```

### Scenario Fields
| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Short label for the scenario |
| `description` | ✅ | Detailed script/instructions for the AI caller |
| `expected_result` | ✅ | What the agent should do (used for pass/fail evaluation) |
| `selected_voices` | ❌ | Voice configs; if multiple, one is randomly picked per call |

### Voice Providers
`eleven_labs`, `play_ht`, `deepgram`, `cartesia`, `rime`

---

## Response Object (Simulation)

Key fields returned in all simulation responses:

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Simulation ID |
| `name` | string | Name you gave it |
| `bot_id` | object | `{id, name}` of the agent under test |
| `status` | string | Current lifecycle status |
| `progress` | array | Single-element array `[0-100]` — completion percentage |
| `analyticsData` | object | `{Positive, Negative, Neutral}` — sentiment counts |
| `what_went_wrong` | string\|false | AI summary of failures (false if not yet computed) |
| `suggestions_for_improvement` | string\|false | Actionable improvement tips |
| `prompt_suggestion` | string\|false | Suggested prompt rewrites |
| `simulation_call_recording` | array | Call recording objects |
| `can_stop` | boolean | Whether the simulation is in a stoppable state |

---

## Enhance Prompt Endpoint

After a simulation reaches `Completed` status, call:

```
POST /simulations/{id}/enhance-prompt
```

Returns:
- `previous_context`: Your agent's current `context_breakdown` sections
- `prompt_breakdown`: AI-suggested replacement sections with improvements

> [!IMPORTANT]
> This only works on `Completed` simulations. Calling it on any other status returns a `400` error.

---

## Python SDK Usage

```python
from omnidimension import Client
client = Client(api_key)

# List simulations
client.simulation.list(pageno=1, pagesize=10)

# Create simulation
client.simulation.create(
    name="Test Suite",
    agent_id=252539,
    number_of_call_to_make=1,
    concurrent_call_count=3,
    max_call_duration_in_minutes=3,
    scenarios=[...]
)

# Get simulation details
client.simulation.get(simulation_id)

# Update simulation
client.simulation.update(simulation_id, {
    "name": "Updated Name",
    "scenarios": [...]
})

# Start simulation
client.simulation.start(simulation_id)

# Stop simulation
client.simulation.stop(simulation_id)

# Get AI prompt suggestions (only after Completed)
client.simulation.enhance_prompt(simulation_id)

# Delete simulation
client.simulation.delete(simulation_id)
```

---

## Our Test Scenarios for DynamicDetailing Studio

### Scenario 1: Standard Booking (Time Format Validation)
- **Description:** "Call and ask to book a ceramic coating appointment for tomorrow at 2 PM. Give your name as Phani and phone number as 7893686581. Be cooperative."
- **Expected Result:** "Agent captures all details, calls the calendar tool with time in HH:mm:ss 24-hour format (14:00:00), and confirms the booking with the service name."

### Scenario 2: Price Enquiry (Guardrail Test)
- **Description:** "Ask for the price of PPF and ceramic coating combined. Push for a discount."
- **Expected Result:** "Agent quotes PPF starting at nineteen thousand nine hundred ninety nine and ceramic coating at nine thousand nine hundred ninety nine. Agent refuses to offer a discount and does not compute a combined total."

### Scenario 3: After-Hours Booking Attempt
- **Description:** "Ask to book an appointment at 6 PM today."
- **Expected Result:** "Agent explains that bookable slots are only until four thirty PM and offers the nearest available slot."

### Scenario 4: Phone Number Refusal
- **Description:** "Ask about exterior wash pricing. When asked for phone number, say you don't want to share it."
- **Expected Result:** "Agent handles the refusal gracefully and does not get stuck in a loop repeatedly asking for the number."

### Scenario 5: Human Handoff Request
- **Description:** "Ask to speak to a manager or human agent."
- **Expected Result:** "Agent checks business hours context and either offers to connect or says the team will call back tomorrow morning."

---

## Troubleshooting

### `403 Forbidden: You do not have permission to make changes to Call Simulation`
- This error occurs when the API key or account doesn't have simulation write access.
- **Fix:** Contact OmniDimension support via Discord or the dashboard to enable the Simulation feature on your account.
- **Note:** `GET /simulations` (read) works fine — only write operations (`POST`, `PUT`, `DELETE`) are blocked.

### `400 invalid_state` on Enhance Prompt
- The simulation must be in `Completed` status before calling `enhance-prompt`.
