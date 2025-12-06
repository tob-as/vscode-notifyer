#!/bin/bash
# read-references-reminder.sh
# Reminds Claude to read @ referenced files in CLAUDE.md

# Debug: log that hook was called
echo "HOOK EXECUTED at $(date)" >> /tmp/claude-hook-debug.log

if [[ -f "CLAUDE.md" ]]; then
  refs=$(grep "^@" "CLAUDE.md" 2>/dev/null || true)

  if [[ -n "$refs" ]]; then
    echo "IMPORTANT: Your CLAUDE.md contains @ references to instruction files that you have NOT yet read:"
    echo ""
    echo "$refs"
    echo ""
    echo "You MUST read these files NOW before responding to any user messages. Use the Read tool on each referenced file to load the instructions into your context."
  fi
fi
