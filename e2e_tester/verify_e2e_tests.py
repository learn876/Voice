import os
import time
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local'))
OMNIDIM_SECRET = "DLOAJWjRpuyDwg9qyCBlil2QBHJCzk-qR5yFmdCFjG0"  # Using known valid API key
AGENT_ID = 252539
SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1AqiavwsMmv_GCW0Cvr57lieFMOgOhoNLi77tiXPGDso/export?format=csv"

from omnidimension import Client

def fetch_latest_calls():
    print("Fetching latest call logs from OmniDimension API...")
    try:
        client = Client(OMNIDIM_SECRET)
        logs = client.call.get_call_logs(agent_id=AGENT_ID, page=1, page_size=5)
        return logs.get("json", {}).get("call_log_data", [])
    except Exception as e:
        print(f"Failed to fetch calls: {e}")
        return []

def fetch_google_sheet():
    print("Fetching latest rows from Google Sheets DB...")
    try:
        df = pd.read_csv(SHEET_CSV_URL)
        return df.tail(10)
    except Exception as e:
        print(f"Failed to fetch Google Sheet: {e}")
        return pd.DataFrame()

def run_verification():
    print("Waiting 15 seconds for webhooks and DB sync to complete...")
    time.sleep(15)
    
    calls = fetch_latest_calls()
    sheet_data = fetch_google_sheet()
    
    print("\n" + "="*50)
    print("E2E VERIFICATION REPORT")
    print("="*50)
    
    # Analyze the top 3 most recent calls
    for idx, call in enumerate(calls[:3]):
        print(f"\nTest Case {idx + 1} (Call ID: {call['id']})")
        
        # 1. Check Tool Calls (Calendar)
        tool_called = False
        for interaction in call.get("interactions", []):
            if interaction.get("function_call_data"):
                tool_called = True
                break
        
        if tool_called:
            print("  [SUCCESS] Calendar Tool: Successfully Executed")
        else:
            print("  [WARNING] Calendar Tool: Not Executed")
            
        # 2. Check Webhooks
        webhooks = call.get("post_call_actions", {}).get("call_recording_webhook_ids", [])
        if webhooks and webhooks[0].get("response_code") == 200:
            print("  [SUCCESS] Webhook: Triggered and returned 200 OK")
        else:
            # Note: Webhooks might fail if ngrok isn't running or n8n is down
            status = webhooks[0].get('status') if webhooks else 'None'
            print(f"  [ERROR] Webhook: Failed (Status: {status})")
            
        # 3. Check Excel Sync
        extracted_name = call.get("extracted_variables", {}).get("customer_name", "").lower()
        if extracted_name and not sheet_data.empty:
            # Basic check if name exists in recent rows
            match = sheet_data.astype(str).apply(lambda x: x.str.lower().str.contains(extracted_name)).any().any()
            if match:
                print(f"  [SUCCESS] Excel DB: Sync Verified (Found '{extracted_name}')")
            else:
                print(f"  [ERROR] Excel DB: Sync Failed (Could not find '{extracted_name}' in latest rows)")
        else:
            print("  [WARNING] Excel DB: No name extracted to verify sync")

if __name__ == "__main__":
    run_verification()
