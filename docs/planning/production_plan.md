# Voice Agent Production Deployment Plan

This document outlines the step-by-step process for taking the Voice Agent architecture from the local demo environment to a fully robust, production-ready system.

---

## 1. Orchestration & Logic: Deploying n8n

For production, you need n8n running 24/7 on a server with a static IP and domain name.

**Option A: Hostinger VPS (Recommended & Most Cost-Effective)**
- Purchase a basic VPS plan on Hostinger.
- Install Docker and Docker Compose on the VPS.
- Deploy the official `n8n` Docker image.
- Set up a reverse proxy (like Nginx or Traefik) and secure it with a free SSL certificate (Let's Encrypt).
- Map a domain or subdomain (e.g., `n8n.yourclient.com`) to the VPS IP.

**Option B: n8n Cloud (Easiest)**
- Subscribe to the n8n managed cloud.
- Benefit: No server maintenance, instant setup, automatic backups.

**Action Item:** Once n8n is hosted, import the `n8n-workflow.json`. Update the webhook nodes from "Test" to "Production" so they provide permanent URLs (e.g., `https://n8n.yourclient.com/webhook/omnidim-webhook`).

---

## 2. WhatsApp Integration: Migrating to AiSensy

The Meta Sandbox is only for testing. For production, you will move back to AiSensy to send unrestricted messages.

1. **Purchase Plan:** Buy a suitable AiSensy plan for the client.
2. **Onboard Number:** Register the client's official business phone number with AiSensy/WhatsApp Business API. (Note: This number cannot be active on the standard WhatsApp mobile app simultaneously).
3. **Template Approval:** Submit the appointment confirmation message template to Meta for approval via the AiSensy dashboard. (Wait 24-48 hours for approval).
4. **Update n8n:** 
   - Open your production n8n instance.
   - Edit the HTTP Request node.
   - Change the URL back to the AiSensy API endpoint (`https://backend.aisensy.com/campaign/t1/api/v2`).
   - Swap the Sandbox token for the official **AiSensy API Key**.
   - Ensure the `campaignName` parameter exactly matches the approved template name.

---

## 3. The Voice Agent: OmniDimension

The agent needs to be pointed to the new production infrastructure.

1. **Update Webhook:** Go to the OmniDimension dashboard. Update the webhook URL to point to your new production n8n instance (e.g., `https://n8n.yourclient.com/webhook/omnidim-webhook`).
2. **Purchase/Port Number:** Purchase a permanent phone number via OmniDimension or port the client's existing number if supported.
3. **Agent Tweaks:** Finalize the system prompt based on client feedback from the demo. Lock in the business hours, pricing, and FAQ guardrails.

---

## 4. The Dashboard: Hosting Next.js

The Next.js dashboard needs to be hosted so the client can access it anytime.

**Option A: Vercel (Highly Recommended)**
- Connect your GitHub repository to Vercel.
- Deploy the Next.js app for free (or on a pro plan). Vercel is built specifically for Next.js and handles all edge caching and SSL automatically.

**Option B: Hostinger (If they require everything in one place)**
- If using Hostinger VPS, you can run the Next.js app via Node.js (`npm run build` -> `npm start`) using PM2 to keep it alive, and route it through Nginx.

**Action Items:**
- Map a domain (e.g., `dashboard.yourclient.com`).
- Add all environment variables (Google Sheet ID, NextAuth Secrets, OmniDim Secret) to the production server settings.
- Ensure the Google Sheet is shared with the production Google Service Account (if you upgrade from standard OAuth to a Service Account for long-term stability).

---

## Production Readiness Checklist
- [ ] Ensure all API keys are stored securely in environment variables (never hardcoded).
- [ ] Upgrade Google Sheets integration to use a **Service Account** instead of personal OAuth (prevents tokens from expiring and breaking the workflow).
- [ ] Add error handling to the n8n workflow (e.g., send an email to the admin if the WhatsApp message fails to send).
- [ ] Test the exact approved AiSensy template to ensure variables `{{1}}`, `{{2}}` map correctly.
- [ ] Set up billing alerts on OmniDimension and AiSensy.
