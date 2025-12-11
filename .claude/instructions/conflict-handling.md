## Instruction Conflict Handling

When the user adds or modifies instructions in CLAUDE.md files, check if they contradict the team standards imported in the Team Standards section. If a conflict is detected:

1. Warn the user: "This appears to conflict with team standard X. Proceeding will override the team default for this project."
2. Ask for confirmation before applying
3. If confirmed, add it under a "# Project Overrides" section with a brief rationale

Do not block — developers may have valid reasons to override.
