# Switch Profile

Switch the tob-claude-setup profile for this project.

## Usage
Run this command with a profile name: `/switch-profile developer` or `/switch-profile end-user`

## Instructions

1. If no profile name was provided (no arguments), list available profiles by reading the filenames in `~/Projects/OriginalBody/tob-claude-setup/.claude/profiles/` and respond with "Usage: `/switch-profile <profile-name>`. Available profiles: developer, end-user" — then stop.

2. Check the current profile by reading `.claude/active-profile`. If the requested profile matches the current profile, respond with "You are already using the '[profile]' profile." and stop — do not execute any further steps.

3. Run the setup script with the requested profile:
   ```bash
   ~/Projects/OriginalBody/tob-claude-setup/setup-claude.sh $ARGUMENTS
   ```

4. Read the updated CLAUDE.md to see the new `@` references.

5. Immediately read all the newly referenced instruction files to load them into context.

6. Briefly confirm the switch is complete and summarize what instructions are now active.

7. Tell the user: "Please restart Claude Code for new settings to take effect. Run `/exit` then run `claude -c` to continue this conversation."
