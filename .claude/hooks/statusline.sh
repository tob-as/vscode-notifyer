#!/bin/bash
# statusline.sh - Show active profile in Claude Code statusline

profile="unknown"
if [[ -f ".claude/active-profile" ]]; then
  profile=$(cat .claude/active-profile)
fi

echo "[$profile]"
