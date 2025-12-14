#!/bin/bash
# setup-claude.sh - Initialize TOB Claude config in any project
# Usage: setup-claude.sh [profile]
#
# If no profile is specified, auto-detects based on project files:
#   - package.json with @redwoodjs/sdk → redwood
#   - wrangler.toml (without Redwood) → serverless
#   - otherwise → base
#
# Examples:
#   setup-claude.sh           # Auto-detect profile
#   setup-claude.sh redwood   # Force redwood profile
#   setup-claude.sh serverless --with-d1

set -e

# Get the directory where this script lives (= tob-claude-internal root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ============================================================
# AUTO-DETECTION
# ============================================================
detect_profile() {
  # 1. Has RedwoodSDK in package.json?
  if [ -f "package.json" ] && grep -q "@redwoodjs/sdk" package.json 2>/dev/null; then
    echo "redwood"
  # 2. Has wrangler.toml but no Redwood?
  elif [ -f "wrangler.toml" ]; then
    echo "serverless"
  # 3. Unknown = base setup
  else
    echo "base"
  fi
}

# ============================================================
# PARSE ARGUMENTS
# ============================================================
PROFILE=""
WORKER_TYPE="ui"
WITH_KV=false
WITH_D1=false
WITH_AUTH=false

for arg in "$@"; do
  case $arg in
    --type=*)
      WORKER_TYPE="${arg#*=}"
      ;;
    --with-kv)
      WITH_KV=true
      ;;
    --with-d1)
      WITH_D1=true
      ;;
    --with-auth)
      WITH_AUTH=true
      WITH_KV=true  # Auth requires KV for sessions
      WITH_D1=true  # Auth requires D1 for users
      ;;
    -*)
      echo "Unknown option: $arg"
      exit 1
      ;;
    *)
      PROFILE="$arg"
      ;;
  esac
done

# Auto-detect if no profile specified
if [ -z "$PROFILE" ]; then
  PROFILE=$(detect_profile)
  echo "✓ Auto-detected profile: $PROFILE"
else
  echo "✓ Using profile: $PROFILE"
fi

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
  echo "Error: jq is required but not installed"
  echo ""
  echo "Install with:"
  echo "  macOS:  brew install jq"
  echo "  Ubuntu: sudo apt-get install jq"
  echo "  Alpine: apk add jq"
  exit 1
fi

# ============================================================
# SETTINGS MERGE
# ============================================================
merge_settings() {
  local general="$SCRIPT_DIR/.claude/settings/general.json"
  local profile_settings="$SCRIPT_DIR/.claude/settings/$PROFILE.json"

  # Get scope from profile manifest
  local scope=$(jq -r '.scope // "serverless"' "$MANIFEST")
  local scope_settings="$SCRIPT_DIR/.claude/templates/settings/$scope.settings.json"

  # Fallback to serverless scope if profile-specific scope doesn't exist
  if [ ! -f "$scope_settings" ]; then
    scope_settings="$SCRIPT_DIR/.claude/templates/settings/serverless.settings.json"
  fi

  local result=""

  if [ ! -f "$profile_settings" ]; then
    # No profile-specific settings, just use general
    result=$(cat "$general")
  else
    # Deep merge: profile overrides general, permission arrays concatenate
    result=$(jq -s '
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
    ' "$general" "$profile_settings")
  fi

  # Merge scope settings (file path permissions - SCOPE LOCK)
  if [ -f "$scope_settings" ]; then
    result=$(echo "$result" | jq --slurpfile scope "$scope_settings" '
      .permissions.read = ($scope[0].permissions.read // ["**/*"]) |
      .permissions.write = ($scope[0].permissions.write // [])
    ')
  fi

  echo "$result"
}

# ============================================================
# BUILD IMPORTS
# ============================================================
CONFIG_REPO_HOME="~${SCRIPT_DIR#$HOME}"

# Parse instructions from manifest
INSTRUCTIONS=$(jq -r '.instructions[]' "$MANIFEST" 2>/dev/null)

# Build imports list for CLAUDE.md
IMPORTS=""
for instr in $INSTRUCTIONS; do
  IMPORTS="$IMPORTS@$CONFIG_REPO_HOME/.claude/instructions/$instr"$'\n'
done

# ============================================================
# CLAUDE.MD SETUP
# ============================================================
IS_NEW_SETUP=false
if [ ! -f "CLAUDE.md" ]; then
  IS_NEW_SETUP=true
fi

has_standard_structure() {
  [ -f "CLAUDE.md" ] && \
  grep -q "^# Team Standards" CLAUDE.md && \
  grep -q "^# Project-Specific" CLAUDE.md && \
  grep -q "^# Project Overrides" CLAUDE.md
}

if [ "$IS_NEW_SETUP" = true ]; then
  cat > CLAUDE.md << EOF
# Team Standards
${IMPORTS}
# Project-Specific

# Project Overrides

EOF
elif ! has_standard_structure; then
  echo "⚠️  CLAUDE.md has non-standard structure - please restructure manually"
  echo "   Required sections: # Team Standards, # Project-Specific, # Project Overrides"
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

# ============================================================
# .CLAUDE DIRECTORY SETUP
# ============================================================
mkdir -p .claude/commands .claude/skills .claude/hooks

# Symlink agents directory
if [ -d "$SCRIPT_DIR/.claude/agents" ]; then
  ln -sfn "$SCRIPT_DIR/.claude/agents" ".claude/agents"
fi

# Helper function: symlink with force (always update)
symlink_force() {
  local src="$1"
  local dest="$2"
  ln -sfn "$src" "$dest"
}

# Symlink ALL hooks
for hook in "$SCRIPT_DIR/.claude/hooks/"*; do
  [ -e "$hook" ] || continue
  symlink_force "$hook" ".claude/hooks/$(basename "$hook")"
done

# Generate merged settings.json (includes SCOPE LOCK)
merge_settings > .claude/settings.json

# ============================================================
# SYMLINK ALL SKILLS (profile-independent)
# ============================================================
echo "  Linking skills..."
for skill in "$SCRIPT_DIR/.claude/skills/"*; do
  [ -e "$skill" ] || continue
  skill_name=$(basename "$skill")

  # Skip _legacy folders
  [[ "$skill_name" == _* ]] && continue

  symlink_force "$skill" ".claude/skills/$skill_name"
done

# ============================================================
# SYMLINK ALL COMMANDS (profile-independent)
# ============================================================
echo "  Linking commands..."
for cmd in "$SCRIPT_DIR/.claude/commands/"*.md; do
  [ -f "$cmd" ] || continue
  cmd_name=$(basename "$cmd")
  symlink_force "$cmd" ".claude/commands/$cmd_name"
done

# ============================================================
# VERSION MARKER
# ============================================================
echo "$PROFILE" > .claude/active-profile

cat > .claude/setup-version.yml << EOF
version: "2.0.0"
profile: "$PROFILE"
setup_date: "$(date +%Y-%m-%d)"
tob_claude_commit: "$(cd "$SCRIPT_DIR" && git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
auto_detected: $([ -z "$1" ] && echo "true" || echo "false")
EOF

# ============================================================
# SERVERLESS PROFILE: Copy templates
# ============================================================
if [ "$PROFILE" = "serverless" ]; then
  TEMPLATE_DIR="$SCRIPT_DIR/.claude/templates/serverless"
  PROJECT_NAME=$(basename "$PWD")
  WORKER_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

  if [ -d "$TEMPLATE_DIR/base" ]; then
    echo ""
    echo "Setting up Cloudflare Workers project..."

    copy_if_missing() {
      local src="$1"
      local dest="$2"
      if [ ! -e "$dest" ] && [ -f "$src" ]; then
        mkdir -p "$(dirname "$dest")"
        cp "$src" "$dest"
        echo "  ✓ Created: $dest"
      fi
    }

    # Copy templates
    copy_if_missing "$TEMPLATE_DIR/base/wrangler.toml" "wrangler.toml"
    copy_if_missing "$TEMPLATE_DIR/base/.github/workflows/deploy-cloudflare.yml" ".github/workflows/deploy-cloudflare.yml"
    copy_if_missing "$SCRIPT_DIR/.claude/templates/shared/ci/claude-compliance.yml" ".github/workflows/claude-compliance.yml"

    # Replace placeholders
    for file in wrangler.toml .github/workflows/*.yml; do
      [ -f "$file" ] && sed -i "s/{{WORKER_NAME}}/$WORKER_NAME/g" "$file" 2>/dev/null || true
    done
  fi
fi

# ============================================================
# DONE
# ============================================================
echo ""
if [ "$IS_NEW_SETUP" = true ]; then
  echo "✓ TOB Claude config initialized with '$PROFILE' profile"
else
  echo "✓ Updated to '$PROFILE' profile"
fi
echo "  All skills and commands are now available."
