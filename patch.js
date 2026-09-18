const fs = require('fs');

const input = fs.readFileSync('C:\\Users\\SHAIK ATIF\\.gemini\\antigravity-ide\\brain\\70b3e6de-301d-4f20-a75c-d03c3c0f37f5\\.system_generated\\steps\\360\\output.txt', 'utf-8');
const jsonStr = input.substring(input.indexOf('{'));
const agent = JSON.parse(jsonStr);
const ctx = agent.context_breakdown.find(c => c.id === 6826535);

if(ctx) {
  ctx.context_body = ctx.context_body.replace(
    'Once date, time, name, and phone number are confirmed, call `book_google_calendar_appointment` with {"date": "YYYY-MM-DD", "time": "hh:mm AM/PM", "name": f"{NAME_CAPTURED} ({service_requested})"}.\n   - IF VOICE CALL: Emit filler before tool call: "ఒక్క నిమిషం, చెక్ చేస్తున్నా...".\n   - IF TEXT CHAT: No filler needed. Just call the tool and respond with the confirmation.',
    'Before confirming an appointment, you MUST call the `manage_calendar` API with {"action": "check_slots", "date": "YYYY-MM-DD"}.\n   - If the slot is free, confirm with the user, and THEN call `manage_calendar` with {"action": "book", "date": "YYYY-MM-DD", "time": "hh:mm AM/PM", "name": "NAME"}.\n   - IF VOICE CALL: Emit filler before tool call: "ఒక్క నిమిషం, చెక్ చేస్తున్నా...".\n   - IF TEXT CHAT: No filler needed. Just call the tool.'
  );
  
  fs.writeFileSync('patched_agent.json', JSON.stringify({agent_id: 252539, context_breakdown: agent.context_breakdown}, null, 2));
  console.log('Successfully wrote patched_agent.json');
} else {
  console.log('Context 6826535 not found');
}
