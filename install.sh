#!/bin/bash
# install.sh - Run once after cloning tob-claude-setup
# Adds setup-tob-claude.sh to PATH

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Detect shell config file
if [ -n "$ZSH_VERSION" ] || [ "$SHELL" = "/bin/zsh" ]; then
  SHELL_RC="$HOME/.zshrc"
else
  SHELL_RC="$HOME/.bashrc"
fi

# Add to PATH if not already present
if ! grep -q "tob-claude-setup" "$SHELL_RC" 2>/dev/null; then
  echo "" >> "$SHELL_RC"
  echo "# TOB Claude Setup" >> "$SHELL_RC"
  echo "export PATH=\"\$PATH:$SCRIPT_DIR\"" >> "$SHELL_RC"
  echo "✓ Added to PATH in $SHELL_RC"
  echo ""
  echo "Next steps:"
  echo "  1. Run: source $SHELL_RC (or open new terminal)"
  echo "  2. In any project, run: setup-tob-claude.sh"
else
  echo "✓ Already configured in $SHELL_RC"
fi
