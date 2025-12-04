#!/bin/bash
# setup-tob-claude.sh - Initialize TOB Claude config in any project
# Run this from your project directory

# Get the directory where this script lives (= tob-claude-setup root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Convert to ~/ relative path for @ imports
CONFIG_REPO_HOME="~${SCRIPT_DIR#$HOME}"

# Create CLAUDE.md with instruction imports if it doesn't exist
if [ ! -f "CLAUDE.md" ]; then
  echo "# $(basename "$PWD")" > CLAUDE.md
  echo "" >> CLAUDE.md

  # Import all instruction files using ~/ path
  for file in "$SCRIPT_DIR"/.claude/instructions/*.md; do
    [ -f "$file" ] && echo "@$CONFIG_REPO_HOME/.claude/instructions/$(basename "$file")" >> CLAUDE.md
  done

  echo "" >> CLAUDE.md
  echo "## Project-Specific" >> CLAUDE.md
fi

# Symlink shared .claude resources
mkdir -p .claude
for dir in commands agents skills settings; do
  if [ -d "$SCRIPT_DIR/.claude/$dir" ]; then
    ln -sfn "$SCRIPT_DIR/.claude/$dir" ".claude/$dir"
  fi
done

echo "✓ TOB Claude config initialized"
