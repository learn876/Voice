---
name: batch-counsel-executor
description: The master runbook for processing the 600+ row E2E test dataset using the LLM Counsel.
---

# Batch Counsel Execution Pipeline

This is the standard operating procedure for executing a batch. You MUST follow these steps exactly in order.

### Step 1: Initialize the Council
You MUST use the `view_file` tool to read `c:\Users\SHAIK ATIF\Voice agent\.agents\counsel_context.md` FIRST to understand the current systemic issues and dependencies.
Then, you MUST use the `view_file` tool to read `c:\Users\SHAIK ATIF\Voice agent\.agents\skills\llm-counsel\SKILL.md` to load the deep analytics personas and understand the 3-phase debate workflow. DO NOT SKIP THIS.

### Step 2: Fetch the Next Batch
Use the `run_command` tool to execute:
`$env:PYTHONIOENCODING="utf-8"; python counsel_get_batch.py` (in `c:\Users\SHAIK ATIF\Voice agent\e2e_tester`)
This will fetch the next 20 rows and generate a file named `current_batch.txt`. 
Use the `view_file` tool to read the entire contents of `c:\Users\SHAIK ATIF\Voice agent\e2e_tester\current_batch.txt`.

### Step 3: Adversarial Debate Artifact
Execute the 3-phase LLM Counsel workflow for the batch. Output the full debate transcript into a new artifact named `batch_{N}_debate.md` (where N is the batch number).

### Step 4: Extract Verdicts
Based on the final Judge's Synthesis from the debate, extract highly critical 1-sentence verdicts for each Call ID.
Save these verdicts into a scratch file named `c:\Users\SHAIK ATIF\Voice agent\e2e_tester\current_verdicts.json`.

### Step 5: Save & Advance
Use the `run_command` tool to execute:
`$env:PYTHONIOENCODING="utf-8"; python counsel_save_batch.py current_verdicts.json` (in `c:\Users\SHAIK ATIF\Voice agent\e2e_tester`)
This will append the results to the CSV and advance the tracker by 20 rows. 

### Step 6: Security Verification (Post-Push Audit)
After saving, you MUST explicitly verify that any nuanced systemic fixes or action items (flagged by Persona G) were successfully written to the CSV. Use `run_command` to execute a quick query (e.g., `python -c "import pandas as pd..."`) to check the `Counsel Suggestions` column for the relevant Call IDs in `e2e_test_report_analyzed.csv`. 
If verified, stop and ask the user to proceed to the next batch.
