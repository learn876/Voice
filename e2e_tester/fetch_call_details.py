import os
import json
from dotenv import load_dotenv
from omnidimension import Client

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local'))
api_key = os.getenv("OMNIDIM_API_KEY")
if not api_key:
    raise SystemExit("OMNIDIM_API_KEY missing. Set it in .env.local (see .env.local.example).")
client = Client(api_key=api_key)

# The Call IDs printed in the user's terminal
call_ids = [7892837, 7892788, 7892741]
results = []

try:
    for call_id in call_ids:
        c = client.call.get_call_log(call_id).get("json", {})
        results.append({
            "id": c.get("id"),
            "status": c.get("status"),
            "variables": c.get("extracted_variables", {}),
            "transcript": c.get("transcript", ""),
            "analysis": c.get("analysis", {})
        })
            
    with open('call_details.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=4, ensure_ascii=False)
    print("Successfully fetched call details for analysis.")
except Exception as e:
    print(f"Error fetching calls: {e}")
