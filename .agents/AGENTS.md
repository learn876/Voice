# Master Initialization Protocol

Before you begin executing any tasks in this workspace, you MUST read the following master files to understand the system architecture, business rules, and current state:

1. **Strategic Overview:** Read `@[c:\Users\SHAIK ATIF\Voice agent\.agents\CONTEXT.md]`
2. **AI Behavior:** Read `@[c:\Users\SHAIK ATIF\Voice agent\OMNIDIM_PROMPT.md]`
3. **Database & Orchestration:** Read `@[c:\Users\SHAIK ATIF\Voice agent\N8N_WORKFLOW.md]`
4. **Dependency Map:** Read `@[c:\Users\SHAIK ATIF\Voice agent\.agents\dependency_matrix.json]`
5. **Global Systemic Issues:** Read `@[c:\Users\SHAIK ATIF\Voice agent\.agents\counsel_context.md]`

Do not start writing code or editing files until you have fully absorbed the constraints from these 4 files.

---

# The "Expert Prompt" Protocol: Pre-Flight Impact Checker
To prevent localized fixes from breaking downstream systems, you are strictly bound by the following rule:

**Before editing ANY script, JSON, markdown, or CSV file in this repository, you MUST run:**
`python .agents/impact_horizon.py <filename>`

This script will analyze the global dependency matrix and output a list of downstream files that rely on the file you are about to change. 
You must explicitly address how you will handle these downstream dependencies in your plan or thoughts before making the edit. Failure to do so will result in systemic drift.
