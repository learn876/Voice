import os
import json
from dotenv import load_dotenv
from omnidimension import Client

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local'))
api_key = os.getenv("OMNIDIM_API_KEY")
if not api_key:
    raise SystemExit("OMNIDIM_API_KEY missing. Set it in .env.local (see .env.local.example).")
client = Client(api_key=api_key)

call_ids = [7892837, 7892788, 7892741]
calls_data = []

# Fetch each call
for call_id in call_ids:
    try:
        data = client.call.get_call_log(call_id).get("json", {}).get("call_log_data", [])[0]
        report = data.get("post_call_actions", {}).get("call_recording_webhook_ids", [])[0].get("payload", "{}")
        report_dict = json.loads(report).get("call_report", {})
        calls_data.append({
            "id": call_id,
            "transcript": report_dict.get("full_conversation", ""),
            "extracted": report_dict.get("extracted_variables", {}),
            "summary": report_dict.get("summary", "")
        })
    except Exception as e:
        print(f"Failed to fetch {call_id}: {e}")

# Load test scenarios
with open(os.path.join(os.path.dirname(__file__), 'test_scenarios.json'), 'r') as f:
    scenarios = json.load(f)

# Write Markdown Report
report_md = "# E2E Test Execution Report\n\n"

for i, call in enumerate(calls_data):
    matched_scenario = None
    for sc in scenarios:
        # Match using the first word of the second message to be safe
        first_word = sc["messages"][1].split(' ')[0].lower()
        if first_word in call["transcript"].lower():
            matched_scenario = sc
            break
    
    sc_name = matched_scenario["name"] if matched_scenario else "Unknown Scenario"
    expected = matched_scenario["expected_result"] if matched_scenario else "N/A"
    
    report_md += f"## Call ID: {call['id']} - {sc_name}\n"
    report_md += f"**Expected Outcome:** {expected}\n\n"
    
    extracted = call['extracted']
    report_md += "**Extracted Variables:**\n"
    report_md += f"- Name: `{extracted.get('customer_name', '')}`\n"
    report_md += f"- Service: `{extracted.get('service_requested', '')}`\n"
    report_md += f"- Time: `{extracted.get('preferred_date_time', '')}`\n\n"
    
    report_md += f"**AI Summary:**\n{call['summary']}\n\n"
    
    report_md += "**Actual Transcript:**\n```text\n"
    report_md += call['transcript'].strip()
    report_md += "\n```\n\n---\n\n"

with open(r'C:\Users\SHAIK ATIF\.gemini\antigravity-ide\brain\6b79c723-9b5b-484b-8041-c912bfac7d7c\test_report.md', 'w', encoding='utf-8') as f:
    f.write(report_md)

print("test_report.md generated successfully.")
