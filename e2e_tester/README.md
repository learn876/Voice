# OmniDimension E2E Tester Suite

This directory contains the automated End-to-End (E2E) testing framework for the OmniDimension AI CRM. It uses Playwright to simulate a real human interacting with the AI via the text chat UI.

## Architecture

1. **`test_scenarios.json`**: Contains 10 highly specific test cases (Privacy Refusals, Pricing Guardrails, After-Hours Bookings, Angry Customers, etc.) written in a mix of Tanglish, English, and Hindi.
2. **`run_e2e_tests.py`**: The Playwright automation script. It loops through the scenarios, logs into OmniDimension, opens the Chat UI, types the messages naturally, and waits for the AI to respond. 
3. **`e2e_reporter.py`**: A powerful analysis tool that runs after the tests complete. It:
   - Fetches the raw call logs for the exact runs via the OmniDimension API.
   - Pings your live Google Sheet CSV to verify if the n8n webhook successfully inserted the row.
   - Generates an `e2e_test_report.csv` file mapping expected results to actual results.
4. **`content.md`**: The master pipeline record detailing the testing strategy, health, and any resolved loopholes.

## How to Run the Tests

**Step 1: Execute the automation suite**
```bash
python run_e2e_tests.py
```
*(A browser window will open, and the AI will be tested automatically. Do not touch the mouse/keyboard while it runs!)*

**Step 2: Generate the E2E CSV Report**
```bash
python e2e_reporter.py
```
*(This will output `e2e_test_report.csv`. You can then ask the AI to "Analyze the report" to get actionable insights and improvements.)*

## Deprecated Files
- `verify_e2e_tests.py` and `generate_test_report.py` are legacy scripts from the V1 pipeline. Please use `e2e_reporter.py` going forward.
