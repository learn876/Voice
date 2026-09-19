import os
from dotenv import load_dotenv
from omnidimension import Client

load_dotenv(os.path.join(os.path.dirname(__file__), '.env.local'))
api_key = "REDACTED_pre_demo_snapshot_taken_2026-09-19_key_rotated"
client = Client(api_key=api_key)

with open(os.path.join(os.path.dirname(__file__), 'OMNIDIM_PROMPT.md'), 'r', encoding='utf-8') as f:
    content = f.read()

sections = []
current_title = None
current_body = []

for line in content.split('\n'):
    if line.startswith('## '):
        if current_title:
            sections.append({
                'title': current_title,
                'body': '\n'.join(current_body).strip(),
                'is_enabled': True
            })
        current_title = line[3:].strip()
        current_body = []
    elif current_title:
        current_body.append(line)

if current_title:
    sections.append({
        'title': current_title,
        'body': '\n'.join(current_body).strip(),
        'is_enabled': True
    })

context_str = '\n\n'.join([f"# {s['title']}\n{s['body']}" for s in sections])

update_payload = {
    'context_breakdown': sections,
    'context': context_str,
    # Tanglish welcome message serves as a neutral ground for both Text and Voice modes.
    'welcome_message': 'Hello.. DynamicDetailing Studio nunchi Siri matladutunna. Ela help cheyagalanu andi?'
}

try:
    res = client.agent.update(agent_id=252539, data=update_payload)
    print("Agent Prompt Successfully Updated!")
    print("Agent ID:", res.get("json", {}).get("id"))
    print("Status:", res.get("json", {}).get("status"))
except Exception as e:
    print("Failed to update agent:", e)
