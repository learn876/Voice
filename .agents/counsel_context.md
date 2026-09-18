# LLM Counsel Global Context & Dependency Tracker

This document serves as the persistent memory for the LLM Counsel. Before analyzing any new batch, the Counsel MUST review this document to understand ongoing systemic issues and pending backend implementations. This ensures the Counsel makes forward-thinking, linked recommendations rather than short-sighted prompt patches.

## Active Dependencies & Pending Fixes

### 1. Automated Rescheduling (Identified in Batches 15 & 16)
- **The Issue:** The bot hallucinates capabilities and gets confused when users attempt to modify existing bookings (e.g., negotiating new times but failing to confirm, or confirming fake bookings).
- **The Root Cause:** The n8n backend calendar webhook currently only supports `check_slots` and `book`. There is no `reschedule` tool available to the AI.
- **The Pending Fix (Fix A):** Implementation of a full `reschedule` route in n8n and adding the `reschedule` capability to the `manage_calendar` tool.
- **Dependency Link (Scenario B):** Any E2E scenarios involving users attempting to change/modify their bookings will continue to fail (due to intent confusion or hallucination) *until* Fix A is implemented.
- **Counsel Directive:** Do NOT recommend adding negative constraints (like forcing the bot to just give a phone number) for modification scenarios. Acknowledge the failure but explicitly link it to this pending fix.

### 2. Language Isolation & Syntax Leaks (Identified in Batches 1-14, 17, 18)
- **The Issue:** The AI frequently fails to enforce strict language isolation. Telugu syntax leaks into Hindi conversations, Kannada/Gujarati scripts leak in, and the AI copies Telugu examples from the prompt when executing flows in Hindi. Furthermore, the global rule "Sentence grammar is always Telugu" overrides Hindi language locks (Batch 17). In Text Chat, there is a **Script Mismatch**: when users type Hinglish (Latin script), the AI replies in Devanagari, violating the text language mirroring rule (Batch 18).
- **The Root Cause:** Conflicting prompt directives, lack of strict negative constraints against cross-language contamination, and the LLM anchoring to Devanagari examples in the prompt.
- **The Pending Fix:** A prompt rewrite to explicitly decouple the "Sentence grammar is always Telugu" rule from the active language state, and a stricter negative constraint forbidding Devanagari output if the user's input contains no Devanagari characters.

### 3. Anonymous/Incomplete Bookings (Identified in Batches 1-14)
- **The Issue:** AI hallucinates booking confirmations without collecting a real name and a 10-digit phone number, sometimes resorting to placeholder names like "Anonymous".
- **The Pending Fix:** Prompt optimization needed to strictly forbid calling the `manage_calendar` tool without explicitly verifying a real name and a 10-digit phone number from the user.

### 4. Zero-Engagement Policy Violations (Identified in Batches 1-14)
- **The Issue:** The AI speculates or agrees with out-of-bounds statements before pivoting back to the main topic.
- **The Pending Fix:** Enforce an absolute zero-engagement policy for off-topic inputs, preventing the AI from affirming or discussing the off-topic subject matter.

### 5. Inappropriate Media Requests (Identified in Batches 1-14)
- **The Issue:** The AI actively requests images or screenshots in text chat despite not being able to process them.
- **The Pending Fix:** Prompt optimization to explicitly ban the AI from requesting visual media.

### 6. Missing `{caller_number}` Payload (Identified in Batches 1-14)
- **The Issue:** E2E tests indicate potential issues with the `{caller_number}` payload for incoming WhatsApp messages.
- **The Pending Fix:** Verify the OmniDimension webhook payload mapping or make the n8n webhook more resilient to missing numbers.

### 7. Channel Context Leak (Identified in Batch 19)
- **The Issue:** When users trigger a media-related intent (e.g., sending a photo) during a Voice Call, the AI immediately switches to its Text Chat behavior. It outputs Tanglish, markdown asterisks, and raw digits, violating the strict Voice formatting rules and breaking the TTS engine.
- **The Root Cause:** The prompt's "Unsupported Media" responses anchor the AI to text-mode behavior, overriding the global Voice Call formatting directives.
- **The Pending Fix:** The prompt must explicitly decouple media intents from channel formats, stating that Voice Call formatting rules (Telugu script, no markdown, English words for numbers) *always* override specific situational responses if the active channel is Voice.

### 8. Cross-Channel Formatting Bleed (Identified in Batches 20-29)
- **The Issue:** The Voice formatting rules and Text formatting rules are polluting each other. The AI leaks Markdown asterisks (`*`) into Voice channels when quoting prices or phone numbers. Conversely, it leaks Voice formatting (spelling out numbers like "nine eight seven") into Text WhatsApp channels.
- **The Pending Fix:** The prompt must strictly decouple channel formatting directives, explicitly stating that Markdown is banned in Voice and spelling out digits is banned in Text.

### 9. Language Isolation on Fallback and Booking Intents (Identified in Batches 27-29)
- **The Issue:** The AI responds in Telugu to Hindi users during specific intents (e.g., Payment Method fallbacks, Booking confirmations).
- **The Root Cause:** The AI anchors to the language used in the few-shot examples or the global "Sentence grammar is always Telugu" fallback rule, overriding the active conversational language state.
- **The Pending Fix:** Update the prompt to mandate that the active user language overrides ALL few-shot example languages and fallback rules.

### 10. Orchestration Race Conditions (Identified in Batches 24, 26, 29)
- **The Issue:** The E2E test script frequently drops payloads (`[Not Found]`) or maps transcripts to older, incorrect Call IDs (e.g., Scenarios 469, 513).
- **The Root Cause:** Twilio/OmniDimension webhook delays cause the E2E script to query the database before the new log is written, leading to timeouts or pulling the previous record.
- **The Pending Fix:** Implement a retry loop or longer `sleep` in the E2E test script before fetching the log to prevent race conditions.
