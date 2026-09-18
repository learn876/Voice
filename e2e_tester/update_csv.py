import csv

input_file = r'c:\Users\SHAIK ATIF\Voice agent\e2e_tester\e2e_test_report.csv'
output_file = r'c:\Users\SHAIK ATIF\Voice agent\e2e_tester\e2e_test_report_analyzed.csv'

updates = {
    "7891393": {
        "status": "PASS (Agent) / FAIL (Webhook)",
        "suggestion": "Agent performed flawlessly and confirmed the booking. However, the Google Sheet was not updated. Check n8n execution logs."
    },
    "7891442": {
        "status": "PASS",
        "suggestion": "Agent flawlessly quoted exact prices and firmly refused the combo offer, adhering to the Anti-Discounting guardrail."
    },
    "7891491": {
        "status": "PASS (Agent) / WARNING (Test Script)",
        "suggestion": "Agent correctly denied 6 PM slot and offered 10 AM. However, the Playwright script exited before sending the 4th message ('na peru Ravi'). Increase script timeout."
    },
    "7894962": {
        "status": "PASS",
        "suggestion": "Excellent handling! Agent gracefully declined to proceed without a phone number and suggested a walk-in, avoiding an infinite loop."
    },
    "7894967": {
        "status": "PASS",
        "suggestion": "Perfect empathetic escalation. Agent recognized the issue and successfully extracted the phone number for a manager callback."
    },
    "7894977": {
        "status": "PASS",
        "suggestion": "Agent successfully clarified the wash type (exterior) and provided exact pricing."
    },
    "7894978": {
        "status": "PASS",
        "suggestion": "Agent accurately identified engine repair as out-of-scope and politely redirected the user."
    },
    "7894981": {
        "status": "PASS",
        "suggestion": "Agent provided the exact Jubilee Hills address and offered a Google Maps link via WhatsApp."
    },
    "7894991": {
        "status": "PASS",
        "suggestion": "Agent patiently handled the fragmented inputs ('repu', 'morning') and guided the user to a specific 9:00 AM slot."
    },
    "7894993": {
        "status": "PASS",
        "suggestion": "Flawless sentiment handling. Agent detected the angry tone, apologized immediately, and escalated to a manager without arguing."
    }
}

with open(input_file, 'r', encoding='utf-8') as f_in:
    reader = csv.reader(f_in)
    rows = list(reader)

header = rows[0]
for i in range(1, len(rows)):
    call_id = rows[i][0]
    if call_id in updates:
        rows[i][8] = updates[call_id]["status"] # Overall Status
        rows[i][9] = updates[call_id]["suggestion"] # AI Suggestions

with open(output_file, 'w', newline='', encoding='utf-8') as f_out:
    writer = csv.writer(f_out)
    writer.writerows(rows)

print("Updated CSV generated!")
