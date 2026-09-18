---
name: update-omnidimension-agent
description: "Guidelines for updating an OmniDimension agent's prompt/context and tools using the Python SDK or MCP."
---

# Update OmniDimension Agent

Whenever you need to update the OmniDimension agent's prompt, configuration, or context after modifying local files (like `OMNIDIM_PROMPT.md` or `DynamicDetailing.md`), follow these steps:

## 1. Using the Python SDK (Recommended for Prompts)
The user has provided a script `update_agent_prompt.py` which securely updates the agent's context and prompt using the OmniDimension Python SDK.
- Use the `run_command` tool to execute `python update_agent_prompt.py`.
- This ensures the agent is updated with the latest context securely without needing to build massive JSON payloads manually.

## 2. Using the MCP Tool
You can use the `updateAgent` MCP tool provided by the `omnidimension` server.
- **Caution:** `updateAgent` requires passing a large configuration payload. Unless you are modifying a simple scalar setting (like `speech_speed`), it is safer to use the Python script or instruct the user to do it via the UI to avoid accidentally deleting nested configurations (like integrations or webhooks).

## 3. Updating Custom Tools (Integrations)
- OmniDimension MCP and SDK currently do not have a safe endpoint strictly for updating individual custom tool parameters.
- If a custom tool's description, parameter list, or parameter descriptions need to change (e.g., changing a date parameter format), **you must instruct the user to make this change manually in the OmniDimension Dashboard**.
