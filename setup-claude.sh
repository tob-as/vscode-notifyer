#!/bin/bash
# setup-claude.sh - Initialize or switch TOB Claude config in any project
# Usage: setup-claude.sh [profile]
# Run this from your project directory

set -e

# Get the directory where this script lives (= tob-claude-setup root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Default profile
PROFILE="${1:-end-user}"

# Check profile exists
MANIFEST="$SCRIPT_DIR/.claude/profiles/$PROFILE.json"
if [ ! -f "$MANIFEST" ]; then
  echo "Error: Profile '$PROFILE' not found"
  echo "Available profiles:"
  ls -1 "$SCRIPT_DIR/.claude/profiles/"*.json 2>/dev/null | xargs -n1 basename | sed 's/.json$//'
  exit 1
fi

# Check jq is available
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required. Install with: brew install jq"
  exit 1
fi

# Merge general.json with profile-specific settings
merge_settings() {
  local general="$SCRIPT_DIR/.claude/settings/general.json"
  local profile_settings="$SCRIPT_DIR/.claude/settings/$PROFILE.json"

  if [ ! -f "$profile_settings" ]; then
    # No profile-specific settings, just use general
    cat "$general"
    return
  fi

  # Deep merge: profile overrides general, permission arrays concatenate
  jq -s '
    .[0] as $base | .[1] as $override |
    ($base.permissions.allow // []) + ($override.permissions.allow // []) | unique | . as $allow |
    ($base.permissions.ask // []) + ($override.permissions.ask // []) | unique | . as $ask |
    ($base.permissions.deny // []) + ($override.permissions.deny // []) | unique | . as $deny |
    ($base.hooks // {}) * ($override.hooks // {}) | . as $hooks |
    $base * $override |
    .permissions.allow = $allow |
    .permissions.ask = $ask |
    .permissions.deny = $deny |
    .hooks = $hooks
  ' "$general" "$profile_settings"
}

# Convert to ~/ relative path for @ imports
CONFIG_REPO_HOME="~${SCRIPT_DIR#$HOME}"

# Parse manifest
INSTRUCTIONS=$(jq -r '.instructions[]' "$MANIFEST" 2>/dev/null)
COMMANDS=$(jq -r '.commands[]?' "$MANIFEST" 2>/dev/null)
SKILLS=$(jq -r '.skills[]?' "$MANIFEST" 2>/dev/null)

# Build imports list
IMPORTS=""
for instr in $INSTRUCTIONS; do
  IMPORTS="$IMPORTS@$CONFIG_REPO_HOME/.claude/instructions/$instr"$'\n'
done

# Track if this is a fresh setup or a profile switch
IS_NEW_SETUP=false
if [ ! -f "CLAUDE.md" ]; then
  IS_NEW_SETUP=true
fi

if [ "$IS_NEW_SETUP" = true ]; then
  # Create new CLAUDE.md
  cat > CLAUDE.md << EOF
# Team Standards
${IMPORTS}
# Project-Specific

# Project Overrides

EOF
else
  # Update existing CLAUDE.md - preserve project-specific content
  PROJECT_SPECIFIC_CONTENT=""
  if grep -q "^# Project-Specific" CLAUDE.md; then
    PROJECT_SPECIFIC_CONTENT=$(sed -n '/^# Project-Specific/,/^# Project Overrides/{ /^# Project-Specific/d; /^# Project Overrides/d; p; }' CLAUDE.md)
  fi

  PROJECT_OVERRIDES_CONTENT=""
  if grep -q "^# Project Overrides" CLAUDE.md; then
    PROJECT_OVERRIDES_CONTENT=$(sed -n '/^# Project Overrides/,$ p' CLAUDE.md | tail -n +2)
  fi

  cat > CLAUDE.md << EOF
# Team Standards
${IMPORTS}
# Project-Specific
$PROJECT_SPECIFIC_CONTENT
# Project Overrides
$PROJECT_OVERRIDES_CONTENT
EOF
fi

# Setup .claude directory
mkdir -p .claude/commands .claude/skills .claude/hooks

# Helper function: symlink a file if it doesn't already exist (preserves user files)
symlink_file() {
  local src="$1"
  local dest="$2"
  if [ ! -e "$dest" ]; then
    ln -sfn "$src" "$dest"
  fi
}

# Symlink hooks (all hooks, profile-independent - settings.json controls which run)
for hook in "$SCRIPT_DIR/.claude/hooks/"*; do
  [ -e "$hook" ] || continue
  symlink_file "$hook" ".claude/hooks/$(basename "$hook")"
done

# Generate merged settings.json (general + profile-specific)
merge_settings > .claude/settings.json

# Symlink commands (profile-dependent + always include switch-profile)
for cmd in $COMMANDS; do
  [ -n "$cmd" ] && [ "$cmd" != "null" ] && symlink_file "$SCRIPT_DIR/.claude/commands/$cmd" ".claude/commands/$cmd"
done
symlink_file "$SCRIPT_DIR/.claude/commands/switch-profile.md" ".claude/commands/switch-profile.md"

# Symlink skills (profile-dependent, supports subdirectories)
for skill in $SKILLS; do
  if [ -n "$skill" ] && [ "$skill" != "null" ]; then
    skill_dir=$(dirname "$skill")
    mkdir -p ".claude/skills/$skill_dir"
    symlink_file "$SCRIPT_DIR/.claude/skills/$skill" ".claude/skills/$skill"
  fi
done

# Store active profile
echo "$PROFILE" > .claude/active-profile

# Different message for init vs switch
if [ "$IS_NEW_SETUP" = true ]; then
  echo "✓ TOB Claude config initialized with '$PROFILE' profile"
else
  echo "✓ Switched to '$PROFILE' profile"
fi
