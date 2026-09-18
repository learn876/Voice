---
name: client-onboarding
description: "Master checklist and deployment guide for setting up the Voice Agent, n8n, Google APIs, and WhatsApp architecture for a new client."
---

# Client Onboarding & Deployment Guide

This skill serves as the master checklist when deploying the AI Voice Agent architecture for a new client. It outlines every platform, the exact credentials needed, and the configuration steps.

## Phase 1: Client Requirements Gathering (What to ask the client)
Before starting technical work, you need the following from the client:
1. **Business Details:** Services, prices, address, operating hours, and FAQ (to feed into the OmniDimension Prompt).
2. **Google Account Access:** Either their Google login, or a dedicated Google Workspace account you manage for them.
3. **Google Sheet:** A blank Google Sheet created in their account to act as the CRM.
4. **Google Calendar:** A dedicated Google Calendar created for booking appointments.
5. **WhatsApp Number:** A dedicated phone number to be used exclusively for the Meta WhatsApp Business API.

---

## Phase 2: Google Cloud Console Setup
**Goal:** Generate the keys needed for n8n to talk to their Calendar and Sheets.
1. Go to Google Cloud Console and create a new Project (e.g., `[ClientName]-AI-Agent`).
2. Go to **APIs & Services > Library** and Enable:
   - `Google Sheets API`
   - `Google Calendar API`
3. Go to **OAuth Consent Screen**:
   - Choose "External".
   - Fill in required app name and support email.
   - Add Test Users if the app remains in "Testing" mode, or push to "Production".
4. Go to **Credentials**:
   - Create Credentials -> **OAuth 2.0 Client ID**.
   - Application Type: **Web Application**.
   - Authorized Redirect URIs: Add the n8n OAuth redirect URL (e.g., `https://[n8n-url]/rest/oauth2-credential/callback`).
5. **Copy & Save:** `Client ID` and `Client Secret`.

---

## Phase 3: Meta for Developers (WhatsApp API)
**Goal:** Generate the token for sending WhatsApp alerts.
1. Create an App in Meta for Developers (Type: Business).
2. Add the **WhatsApp** product.
3. Add the client's dedicated phone number and verify it via OTP.
4. Go to **API Setup**:
   - Generate a **Permanent Access Token** (via System User in Business Settings).
   - **Copy & Save:** `Phone Number ID` and `Permanent Access Token`.
5. Create a WhatsApp Template Message (e.g., `manager_alert`) for the complaint handoffs and get it approved.

---

## Phase 4: n8n Configuration
**Goal:** Deploy the master workflow and connect the client's accounts.
1. Import the Master `n8n-workflow.json`.
2. **Setup Credentials:**
   - Add a `Google Calendar OAuth2 API` credential using the Client ID/Secret. Sign in with the client's Google Account.
   - Add a `Google Sheets OAuth2 API` credential using the SAME Client ID/Secret.
   - Add a `WhatsApp API` credential using the Meta Permanent Access Token.
3. **Configure Nodes:**
   - *Google Sheets Node:* Select the client's Spreadsheet ID and Sheet Name. Map the columns.
   - *Google Calendar Nodes:* Select the client's primary Calendar ID.
   - *WhatsApp Nodes:* Input the client's Phone Number ID.
4. **Activate & Get URLs:**
   - Toggle the workflow to **ACTIVE**.
   - Copy the 3 Production Webhook URLs:
     1. Post-Call Webhook (`/webhook/omnidim-post-call`)
     2. Calendar Webhook (`/webhook/omnidim-calendar-tool`)
     3. Manager Alert Webhook (`/webhook/omnidim-manager-alert`)

---

## Phase 5: OmniDimension (AI Brain) Setup
**Goal:** Give the AI its brain and connect it to n8n.
1. **Prompt Engineering:** Paste the tailored Identity, Facts, and Voice Rules into the agent's context.
2. **Custom Data Extraction (Post-Call Tab):**
   - Delivery Method: Webhook.
   - URL: Paste the **Post-Call Webhook URL**.
   - Add 5 variables: `customer_name`, `complaint_details`, `preferred_date_time`, `service_requested`, `sentiment`.
3. **Custom API Integrations:**
   - **API 1: manage_calendar**
     - Method: `POST`
     - URL: Paste the **Calendar Webhook URL**.
     - Inputs: `action`, `date`, `time`, `name`.
   - **API 2: alert_manager**
     - Method: `POST`
     - URL: Paste the **Manager Alert Webhook URL**.
     - Inputs: `phone_number`, `complaint`.
   - *(If using localtunnel for testing, add Header: `Bypass-Tunnel-Reminder: true` to both APIs).*
4. **Final Test:** Run a live test call to verify Calendar fetching, Sheet logging, and WhatsApp alerting.
