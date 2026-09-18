# Project Context: Unified Voice & Chat AI CRM (OmniDimension + n8n + Google Sheets)

## 🎯 Project Overview
We are building a highly capable Voice AI and WhatsApp Chatbot Customer Relationship Management (CRM) and Appointment Dashboard for clients (like car detailing studios, salons, or gyms). 
* **Voice & Text Engine:** OmniDimension natively handles inbound calls AND inbound WhatsApp text chats. 
* **Orchestration:** n8n (self-hosted/local for demo) handles all background CRM logic (logging to sheets, sending manager alerts).
* **Backend/Database:** Google Sheets (The backbone for the live demo).
* **Frontend:** Next.js (App Router) deployed on Vercel, using NextAuth.js (Google Auth) and the Google Sheets API.
* **Messaging Platforms:** 
  - **Demo Phase:** Connecting a personal WhatsApp number via QR Code ("Phone WhatsApp") to bypass Meta Sandbox business-verification restrictions.
  - **Production Phase:** Will migrate to direct Meta Cloud Business API for official Utility Templates (Confirmations/Reminders).

## 🏗️ System Architecture & Business Rules
Because OmniDimension handles conversations natively, n8n's role is relegated to background automation. We have optimized the architecture to aggressively cut AI "bridging" costs.

### 1. The Voice Call Routing (Cost-Optimized)
1. **Working-Hour Call Deflection:** Because the phone number is bought directly in OmniDimension, the AI *must* answer the call. If called during working hours, the AI immediately says: *"Please reach out to [Human Number] for inquiries,"* and hangs up.
2. **The Call-Back Method (Handoffs):** The AI **never** uses the call transfer tool (which charges per minute for bridging). If a human is requested, the AI notes the details, says *"Our manager will call you back,"* hangs up, and flags the summary as `HANDOFF`. 
   - *Time Logic:* It says "tomorrow" if evening, or "once shop opens" if morning.
3. **Complaints:** Past service issues are handled via Call-Back, but flagged as `COMPLAINT`.

### 2. The Text Chat Flow (Native WhatsApp)
* Customer texts the connected WhatsApp number.
* OmniDimension receives it natively and replies directly. 
* IF TEXT CHAT (Tanglish/English input):
  1. Reply STRICTLY in Tanglish (Latin script). NEVER use Telugu script!
  2. Write numbers visually: ₹19,999, 9:00 AM, 7893 6865 81. Do NOT spell out numbers!
  3. Keep messages short and use *single asterisk* bold formatting.
  4. HANDLE INQUIRIES 24/7 — working-hour deflection does NOT apply to text chat.
  5. IF TEXT CHAT ENDS: Right before saying your final goodbye or closing the chat, you MUST silently call 'log_text_summary' to save the conversation details.
* *Note: Text chats remain inside the OmniDimension inbox. There is no webhook to log text chats to Google Sheets currently.*

### 3. The Orchestration (n8n Switch Logic)
When the AI hangs up, OmniDimension fires a webhook to n8n with the summary:
1. **Google Sheets:** n8n logs every call. It sets the status to "Handoff Required", "Priority Complaint", or "Completed".
2. **Switch Node (WhatsApp Alerts):** 
   - If `HANDOFF`, n8n pings the Meta API to send an immediate WhatsApp alert to the Manager's phone. 
   - If `COMPLAINT`, n8n stops (leaving it on the dashboard without buzzing the manager's phone).

### 4. The Next.js Dashboard (Stage 2)
The Next.js dashboard uses Google Auth. The backend API fetches the Google Sheet but filters the data so a logged-in client only sees their specific customers. The UI features:
* **Action Required Tab:** Highlights `HANDOFF` and `COMPLAINT` logs.
* **Upcoming Appointments View:** Pulls directly from the booked calendar slots.

---

## 🚀 Current Status & Next Steps
* **What's done (Stage 1 / Demo Prep):** 
  - The OmniDimension agent (`#252539`) has been injected with all 10 core rules (Language, Latency, Business Rules).
  - The `n8n-workflow.json` has been finalized with the Switch logic for Handoffs vs Complaints.
  - The `demo_matrix.md` and `n8n_setup_guide.md` artifacts have been generated for the live presentation.

* **Recent Fixes & Deep Debugging (Today's Comprehensive Update):**
  - **Prompt Anti-Anchoring Refactoring:** Identified that Telugu script anchored the AI to voice-only translation modes. Overhauled `OMNIDIM_PROMPT.md` to enforce Latin-script (Tanglish/English) and updated the welcome message to Tanglish as a neutral language anchor.
  - **Legacy Script Patch:** Rewrote `update_agent_prompt.py` to pull strictly from `OMNIDIM_PROMPT.md`, permanently closing the loophole of reverting to the buggy `DynamicDetailing.md`.
  - **E2E Framework Scaling:** Built Playwright `run_e2e_tests.py` and scaled the automated test suite to **10 robust scenarios** covering Privacy Refusals, Out-of-Scope (Engine Repairs), Angry Customers, and Guardrails (Anti-Discounting). Fixed the Playwright timeout by increasing inter-message delay to 30s.
  - **Automated CSV Reporting:** Built `e2e_reporter.py` to pull actual call transcripts via OmniDimension API and verify webhook status directly against the Google Sheets CSV. Generates `e2e_test_report_analyzed.csv` loaded with AI evaluations.
  - **n8n Google Sheets Resiliency:** Fixed the webhook crash (Issue B) via the n8n API. The Google Sheets node now accepts empty strings (`|| 'N/A'`) so general enquiries map cleanly to the database without throwing errors.
  - **n8n Dynamic Calendar Sync:** Fixed the Calendar Double-Booking bug. Injected a Javascript Code Node in n8n to dynamically parse Google Calendar events, subtract busy slots from a master list, and return only truly free slots to the AI.
  - **Skills Architecture Secured:** Created `N8N_WORKFLOW.md` to document the exact n8n webhook schema. Updated the `n8n-omnidim-sync` AI Skill to mandate reading and updating `N8N_WORKFLOW.md` as the absolute source of truth.

* **What's next (Stage 2):** 
  - The user will execute the live demo.
  - After a successful demo, we will begin the Next.js CRM Dashboard frontend and Meta Business API verification.