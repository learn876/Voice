# Master Auto-Sync Mandate

**CRITICAL RULE:** This rule overrides all other convenience behaviors. As an AI Agent operating in this workspace, you MUST enforce cross-file synchronization to prevent documentation drift and broken pipelines.

Whenever you edit ANY file in this workspace, BEFORE you end your turn, you MUST perform the following checks:
1. Open and read `@[c:\Users\SHAIK ATIF\Voice agent\.agents\dependency_matrix.json]`.
2. Look up the file you just edited.
3. If the file you edited is listed as a key in the JSON, you MUST automatically update all the files listed in its value array to reflect the new changes or architecture.
4. If you fail to do this, the integration pipeline will break.

Do not ask the user for permission to sync the downstream files. It is a mandatory system requirement. Sync them automatically, then report back to the user that the "Master Sync" was successfully executed.
