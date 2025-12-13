#!/bin/bash
# install.sh - Run once after cloning tob-claude-internal
# Installs dependencies and adds paths to shell config

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Detect shell config file
if [ -n "$ZSH_VERSION" ] || [ "$SHELL" = "/bin/zsh" ]; then
  SHELL_RC="$HOME/.zshrc"
else
  SHELL_RC="$HOME/.bashrc"
fi

echo "=== TOB Claude Setup Installation ==="
echo ""

# Check/Install uv (Python package manager)
echo "Checking dependencies..."
if ! command -v uv &> /dev/null; then
  echo "📦 Installing uv (Python package manager)..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
  echo "✓ uv installed to ~/.local/bin/uv"
else
  echo "✓ uv already installed"
fi

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
  OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  OS="linux"
else
  OS="unknown"
fi

# Install Node.js (required for Next.js stack)
if ! command -v node &> /dev/null; then
  echo "📦 Installing Node.js..."

  if [ "$OS" = "macos" ]; then
    # Check if Homebrew is available
    if command -v brew &> /dev/null; then
      brew install node
      echo "✓ Node.js installed via Homebrew"
    else
      echo "⚠️  Homebrew not found. Install Node.js manually from: https://nodejs.org"
    fi
  elif [ "$OS" = "linux" ]; then
    # Use nvm for Linux (more reliable than apt)
    if [ ! -d "$HOME/.nvm" ]; then
      echo "Installing Node.js via nvm..."
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
      export NVM_DIR="$HOME/.nvm"
      [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
      nvm install --lts
      echo "✓ Node.js installed via nvm"

      # Verify nvm was added to PATH
      if grep -q "NVM_DIR" "$SHELL_RC" 2>/dev/null; then
        echo "✓ nvm added to PATH in $SHELL_RC"
      else
        echo "⚠️  nvm not found in $SHELL_RC, adding manually..."
        echo "" >> "$SHELL_RC"
        echo "# nvm (Node Version Manager)" >> "$SHELL_RC"
        echo "export NVM_DIR=\"\$HOME/.nvm\"" >> "$SHELL_RC"
        echo "[ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"" >> "$SHELL_RC"
        echo "[ -s \"\$NVM_DIR/bash_completion\" ] && \. \"\$NVM_DIR/bash_completion\"" >> "$SHELL_RC"
        echo "✓ nvm PATH added to $SHELL_RC"
      fi
    fi
  else
    echo "⚠️  Unknown OS. Install Node.js manually from: https://nodejs.org"
  fi
else
  echo "✓ Node.js installed ($(node --version))"
fi

# Install jq (required for setup-claude.sh)
if ! command -v jq &> /dev/null; then
  echo "📦 Installing jq..."

  if [ "$OS" = "macos" ]; then
    if command -v brew &> /dev/null; then
      brew install jq
      echo "✓ jq installed via Homebrew"
    else
      echo "⚠️  Homebrew not found. Install jq manually: brew install jq"
    fi
  elif [ "$OS" = "linux" ]; then
    # Try apt first (Debian/Ubuntu), then yum (RedHat/CentOS)
    if command -v apt-get &> /dev/null; then
      sudo apt-get update && sudo apt-get install -y jq
      echo "✓ jq installed via apt"
    elif command -v yum &> /dev/null; then
      sudo yum install -y jq
      echo "✓ jq installed via yum"
    else
      echo "⚠️  Package manager not found. Install jq manually."
    fi
  else
    echo "⚠️  Unknown OS. Install jq manually."
  fi
else
  echo "✓ jq installed"
fi

echo ""
echo "Configuring PATH..."

# Add ~/.local/bin to PATH (for uv and other tools)
if ! grep -q ".local/bin" "$SHELL_RC" 2>/dev/null; then
  echo "" >> "$SHELL_RC"
  echo "# Local binaries (uv, etc.)" >> "$SHELL_RC"
  echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$SHELL_RC"
  echo "✓ Added ~/.local/bin to PATH"
else
  echo "✓ ~/.local/bin already in PATH"
fi

# Add tob-claude-internal to PATH
if ! grep -q "tob-claude-internal" "$SHELL_RC" 2>/dev/null; then
  echo "" >> "$SHELL_RC"
  echo "# TOB Claude Internal" >> "$SHELL_RC"
  echo "export PATH=\"\$PATH:$SCRIPT_DIR\"" >> "$SHELL_RC"
  echo "✓ Added tob-claude-internal to PATH"
else
  echo "✓ tob-claude-internal already in PATH"
fi

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Next steps:"
echo "  1. Run: source $SHELL_RC (or open new terminal)"
echo "  2. In any project, run: setup-claude.sh"
echo ""
echo "For /build command, ensure you have:"
echo "  - Node.js (for Next.js apps)"
echo "  - uv (for Python apps) ✓"
echo "  - jq (for setup-claude.sh)"
