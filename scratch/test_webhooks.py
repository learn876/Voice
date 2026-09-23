import urllib.request
import json

def test_webhook(url, payload):
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        response = urllib.request.urlopen(req)
        body = response.read().decode('utf-8')
        return {"status": response.status, "body": body}
    except urllib.error.HTTPError as e:
        return {"status": e.code, "body": e.read().decode('utf-8')}
    except Exception as e:
        return {"status": 500, "error": str(e)}

tests = [
    {
        "name": "1. Post-Call Webhook",
        "url": "http://localhost:5678/webhook/omnidim-post-call",
        "payload": {
            "caller_number": "8123456789",
            "summary": "HANDOFF: Test Post-Call",
            "duration": "1m",
            "full_conversation": "test",
            "call_report": {
                "extracted_variables": {
                    "customer_name": "Test User 1",
                    "language_detected": "english",
                    "service_requested": "Ceramic Coating",
                    "sentiment": "Neutral",
                    "complaint_details": "",
                    "handoff_reason": "test escalation"
                }
            }
        }
    },
    {
        "name": "2. Manager Alert Webhook",
        "url": "http://localhost:5678/webhook/omnidim-manager-alert",
        "payload": {
            "phone_number": "8123456789",
            "customer_name": "Test User 2",
            "reason": "Test Manager Alert Webhook",
            "language": "english"
        }
    },
    {
        "name": "3. Calendar Tool Webhook",
        "url": "http://localhost:5678/webhook/omnidim-calendar-tool",
        "payload": {
            "action": "check_slots",
            "date": "2026-10-15"
        }
    },
    {
        "name": "4. Text Summary Webhook",
        "url": "http://localhost:5678/webhook/omnidim-text-summary",
        "payload": {
            "caller_number": "8123456789",
            "summary": "HANDOFF: Test Text Summary",
            "duration": "Text Chat",
            "full_conversation": "test text",
            "call_report": {
                "extracted_variables": {
                    "customer_name": "Test User 4",
                    "language_detected": "english",
                    "service_requested": "Interior Cleaning",
                    "sentiment": "Neutral",
                    "complaint_details": "",
                    "handoff_reason": "test escalation"
                }
            }
        }
    }
]

print("Running E2E Webhook Tests...\n")
for t in tests:
    print(f"Testing {t['name']}...")
    result = test_webhook(t['url'], t['payload'])
    print(f"Status: {result.get('status')}")
    print(f"Response: {result.get('body') or result.get('error')}\n")

