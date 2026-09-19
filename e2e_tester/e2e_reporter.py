import os
import json
import csv
import urllib.request
import time
from dotenv import load_dotenv
from omnidimension import Client

# Configuration
SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1AqiavwsMmv_GCW0Cvr57lieFMOgOhoNLi77tiXPGDso/export?format=csv"
SCENARIOS_PATH = os.path.join(os.path.dirname(__file__), 'test_scenarios.json')
REPORT_PATH = os.path.join(os.path.dirname(__file__), 'e2e_test_report.csv')

# Load API Key
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local'))
api_key = os.getenv("OMNIDIM_API_KEY")
if not api_key:
    raise SystemExit("OMNIDIM_API_KEY missing. Set it in .env.local (see .env.local.example).")
client = Client(api_key=api_key)

print("🚀 Starting E2E CSV Report Generation...")

# 1. Load Scenarios
with open(SCENARIOS_PATH, 'r', encoding='utf-8') as f:
    scenarios = json.load(f)

print(f"✅ Loaded {len(scenarios)} expected scenarios.")

# 2. Fetch Latest Call Logs from OmniDimension
print("⏳ Fetching recent call logs from OmniDimension API...")
calls_data = []
try:
    recent_calls = []
    # Fetch 1000 calls total by paginating (100 at a time) to prevent OmniDimension API 500 Timeouts
    for p in range(1, 11):
        try:
            res = client.call.get_call_logs(agent_id=252539, page=p, page_size=100)
            batch = res.get("json", {}).get("call_log_data", [])
            recent_calls.extend(batch)
            if len(batch) < 100:
                break
        except Exception as e:
            print(f"⚠️ Warning: Could not fetch page {p}. Error: {e}")
            break
            
    # We will try to map each scenario to a recent call log by matching the first unique message
    # To do this safely, we reverse the calls so the oldest in the page is matched first
    recent_calls.reverse()
    
    detailed_logs_cache = {}
    
    for sc in scenarios:
        sc_first_message = sc["messages"][0].lower()
        sc_second_message = sc["messages"][1].lower() if len(sc["messages"]) > 1 else ""
        
        matched_call_id = None
        for call_summary in recent_calls:
            # The transcript and webhook payload are already available in the summary!
            c_id = call_summary.get("id")
            detailed_call = call_summary
            
            report_str = detailed_call.get("post_call_actions", {}).get("call_recording_webhook_ids", [])
            report_str = report_str[0].get("payload", "{}") if report_str else "{}"
            report_dict = json.loads(report_str).get("call_report", {})
            full_transcript = report_dict.get("full_conversation", "").lower()
            
            # Simple match using the second message (or first)
            match_key = sc_second_message[:10] if sc_second_message else sc_first_message[:10]
            if match_key and match_key in full_transcript:
                matched_call_id = c_id
                calls_data.append({
                    "id": c_id,
                    "scenario": sc["name"],
                    "expected": sc["expected_result"],
                    "transcript": report_dict.get("full_conversation", "").strip(),
                    "extracted": report_dict.get("extracted_variables", {}),
                    "summary": report_dict.get("summary", "")
                })
                # Remove this call from list so it doesn't match twice
                recent_calls.remove(call_summary)
                break
                
        if not matched_call_id:
            calls_data.append({
                "id": "Not Found",
                "scenario": sc["name"],
                "expected": sc["expected_result"],
                "transcript": "No matching call found in recent logs. Test may have failed to execute.",
                "extracted": {},
                "summary": ""
            })
            
except Exception as e:
    print(f"❌ Error fetching from OmniDimension: {e}")

# 3. Fetch Google Sheets Data
print("⏳ Fetching Google Sheets DB for Webhook validation...")
sheet_names = []
try:
    req = urllib.request.Request(SHEET_CSV_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        lines = [line.decode('utf-8') for line in response.readlines()]
        reader = csv.reader(lines)
        next(reader, None) # Skip header
        for row in reader:
            if len(row) >= 2 and row[1].strip():
                sheet_names.append(row[1].strip().lower())
except Exception as e:
    print(f"❌ Error fetching Google Sheets: {e}")

# 4. Generate CSV Report
print("📝 Writing to e2e_test_report.csv...")
with open(REPORT_PATH, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        "Call ID", "Scenario Name", "Expected Outcome", 
        "Actual Transcript", "Extracted Name", "Extracted Service", "Extracted Time", 
        "n8n Webhook & DB Status", "Overall Status (Pass/Fail/Warning)", "AI Suggestions & Improvements"
    ])
    
    for call in calls_data:
        ext = call.get("extracted", {})
        c_name = ext.get("customer_name", "")
        c_service = ext.get("service_requested", "")
        c_time = ext.get("preferred_date_time", "")
        
        db_status = "N/A (No Name Expected)"
        if call["id"] != "Not Found":
            # If the scenario explicitly required a booking (has a name in the script)
            # We can guess by checking if 'peru' or 'name' is in the expected outcome or transcript
            if "Phani" in call["expected"] or "Ravi" in call["expected"] or c_name:
                if c_name and c_name.lower() in sheet_names:
                    db_status = f"[SUCCESS] Found '{c_name}' in Google Sheet"
                else:
                    db_status = f"[FAILED] '{c_name}' missing from Google Sheet"
        
        # We leave the Status and AI Suggestions blank for the AI (me) to fill out later
        writer.writerow([
            call["id"],
            call["scenario"],
            call["expected"],
            call["transcript"],
            c_name,
            c_service,
            c_time,
            db_status,
            "", # Overall Status
            ""  # AI Suggestions
        ])

print(f"🎉 CSV Report successfully generated at: {REPORT_PATH}")
print("You can now ask the AI to 'Analyze the test report'")
