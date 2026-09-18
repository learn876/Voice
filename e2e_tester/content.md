# E2E Testing Framework & Loophole Analysis

This document serves as the master record of the OmniDimension Voice Agent E2E Testing pipeline, test coverage, pipeline health, and LLM loophole analysis.

---

## 1. Test Coverage Strategy (10 Scenarios)
To ensure the agent strictly follows the Anti-Anchoring rules, Guardrails, and Dual-Channel (Text/Voice) logic from `OMNIDIM_PROMPT.md`, the E2E framework executes 10 highly specific scenarios concurrently via Playwright:
1. **Standard Multi-turn Booking (Tanglish):** Tests full standard workflow.
2. **Price Enquiry / Guardrail Test (Hindi):** Tests rigid pricing adherence (Anti-Discounting).
3. **After-Hours Booking Attempt (Tanglish):** Tests logic for rejecting out-of-bounds times.
4. **Privacy Refusal (English):** Tests agent's ability to gracefully handle a user refusing to share their phone number without infinite looping.
5. **Human Handoff Request (Escalation):** Tests empathy and escalation triggers for angry customers.
6. **Vague Service Enquiry:** Tests clarifying abilities (e.g., "wash" vs "exterior wash").
7. **Out-of-Scope Service:** Tests rejection of non-detailing services (engine repairs).
8. **Address and Location Enquiry:** Tests basic static knowledge retrieval.
9. **Incomplete Booking Details:** Tests patience and multi-turn variable extraction (stuttering user).
10. **Angry Customer Complaint:** Tests sentiment detection and immediate escalation.

---

## 2. Pipeline Health & Fixes
During the scaling of the E2E test suite, two critical infrastructure pipeline issues were discovered and resolved:

### Issue A: Playwright Premature Truncation (Timeout)
- **Symptom:** In Scenario 3 (After-Hours Booking), the test exited before the final message was sent, preventing the AI from fully completing the booking flow.
- **Root Cause:** The `run_e2e_tests.py` script had a hardcoded `time.sleep(15)` between messages. When the LLM took longer than 15 seconds to generate its reasoning and TTS tokens, the script fired the next action prematurely.
- **Resolution:** Modified `run_e2e_tests.py` to increase the inter-message delay to `30 seconds` (`time.sleep(30)`). This ensures the AI has ample time to complete generation before the next step.

### Issue B: n8n Webhook & Google Sheets Sync Failure
- **Symptom:** The `e2e_reporter.py` flagged `[FAILED] 'Phani' missing from Google Sheet` despite the AI successfully extracting the name and triggering the webhook.
- **Root Cause:** The n8n execution logs showed `status: error` for specific webhook executions. This occurs when the `omnidim-post-call` payload structure contains unexpected null values for extracted variables (e.g., empty string for `customer_name` in incomplete scenarios) causing the Google Sheets node to reject the insert operation.
- **Resolution Strategy:** The n8n workflow must be updated so the Google Sheets node handles empty strings gracefully, or we use a conditional node to only attempt a DB insert when `customer_name` is explicitly present in the payload.
- **Final Resolution:** Updated the `Log to Google Sheets` node parameters via the n8n API to use fallbacks: `{{ $json.body.call_report?.extracted_variables?.customer_name || 'N/A' }}`.

### Issue C: Calendar Double-Booking (n8n Logic Failure)
- **Symptom:** The AI was blindly offering `2:00 PM` to every user even if the slot was already booked on Google Calendar.
- **Root Cause:** The `Return Slots to OmniDim` node was statically hardcoded to return `"2:00 PM, 3:30 PM, 5:00 PM"`, completely ignoring the Google Calendar `Get Events` node data.
- **Resolution:** Injected a Javascript Code Node into the n8n workflow between `Get Events` and the Webhook Response. The script dynamically parses the ISO strings from Google Calendar, subtracts the busy times from a master list, and returns only the truly free slots back to the AI.

---

## 3. Reporting & AI Analysis Pipeline
The new automated pipeline does not rely on manual log reading:
1. **`run_e2e_tests.py`** executes all 10 scenarios in the browser.
2. **`e2e_reporter.py`** automatically fetches the raw call logs via the OmniDimension API, verifies the webhook DB sync against the Google Sheets URL, and exports everything into `e2e_test_report.csv`.
3. **AI Evaluation:** The AI Agent ingests the generated CSV, compares the Actual Transcript against the Expected Outcome, and outputs actionable suggestions for `OMNIDIM_PROMPT.md` improvement in the `e2e_test_report_analyzed.csv`.

---

## Next Steps for the User
1. Execute `python run_e2e_tests.py` to trigger the new 10-scenario suite.
2. Check the n8n execution dashboard to ensure the Google Sheets node does not error out on empty variables.
3. Execute `python e2e_reporter.py` to generate the latest test CSV.
