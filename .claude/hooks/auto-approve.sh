#!/bin/bash
# Auto-approve safe operations, block merge operations
#
# This hook runs before every tool use (PreToolUse event).
# Returns:
#   "approved" - auto-approve the operation
#   "denied: <reason>" - block with message
#   "default" - let normal permission system handle

TOOL="$1"
COMMAND="$2"

# Only handle Bash commands
if [[ "$TOOL" != "Bash" ]]; then
  echo "default"
  exit 0
fi

# Auto-approve safe git operations (including git -C variants)
if [[ "$COMMAND" =~ ^git[[:space:]].*[[:space:]](add|commit|status|diff|branch|checkout|stash|fetch|pull|log|show) ]]; then
  echo "approved"
  exit 0
fi

# Auto-approve directory operations
if [[ "$COMMAND" =~ ^mkdir ]]; then
  echo "approved"
  exit 0
fi

# Auto-approve Node.js tooling
if [[ "$COMMAND" =~ ^(npm|npx|node)[[:space:]] ]]; then
  echo "approved"
  exit 0
fi

# Auto-approve safe wrangler commands
if [[ "$COMMAND" =~ ^wrangler[[:space:]](dev|secret|tail|types|d1|kv|r2)[[:space:]] ]]; then
  echo "approved"
  exit 0
fi

# BLOCK merge operations (requires user approval)
if [[ "$COMMAND" =~ ^git[[:space:]].*[[:space:]]merge ]] || [[ "$COMMAND" =~ ^gh[[:space:]]pr[[:space:]]merge ]]; then
  echo "denied: Merging requires user approval"
  exit 1
fi

# Default: let normal permission system handle
echo "default"
exit 0
