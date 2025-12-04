#!/bin/bash
# setup-tob-claude.sh - Initialize TOB Claude config in any project
# Run this from your project directory

# Get the directory where this script lives (= tob-claude-setup root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Convert to ~/ relative path for @ imports
CONFIG_REPO_HOME="~${SCRIPT_DIR#$HOME}"

# Build list of imports
IMPORTS=""
for file in "$SCRIPT_DIR"/.claude/instructions/*.md; do
  [ -f "$file" ] && IMPORTS="$IMPORTS@$CONFIG_REPO_HOME/.claude/instructions/$(basename "$file")"$'\n'
done

if [ ! -f "CLAUDE.md" ]; then
  # Create new CLAUDE.md
  cat > CLAUDE.md << EOF
# $(basename "$PWD")

## General Instructions
${IMPORTS}
## Project-Specific

EOF
else
  # Update existing CLAUDE.md
  TEMP_FILE=$(mktemp)

  # Extract project title (first # heading) or default to directory name
  PROJECT_TITLE=$(grep -m 1 "^# " CLAUDE.md || echo "# $(basename "$PWD")")

  # Extract everything after ## Project-Specific (if it exists)
  PROJECT_SPECIFIC_CONTENT=""
  if grep -q "^## Project-Specific" CLAUDE.md; then
    PROJECT_SPECIFIC_CONTENT=$(sed -n '/^## Project-Specific/,$ p' CLAUDE.md | tail -n +2)
  fi

  # Rebuild the file with proper structure
  cat > CLAUDE.md << EOF
$PROJECT_TITLE

## General Instructions
${IMPORTS}
## Project-Specific
$PROJECT_SPECIFIC_CONTENT
EOF
fi

# Symlink shared .claude resources (individual files, preserving local ones)
mkdir -p .claude
for dir in commands agents skills settings; do
  if [ -d "$SCRIPT_DIR/.claude/$dir" ]; then
    mkdir -p ".claude/$dir"
    for file in "$SCRIPT_DIR/.claude/$dir"/*; do
      [ -f "$file" ] && ln -sfn "$file" ".claude/$dir/$(basename "$file")"
    done
  fi
done

echo "✓ TOB Claude config initialized"
