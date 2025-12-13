#!/bin/bash
# setup-claude.sh - Initialize or switch TOB Claude config in any project
# Usage: setup-claude.sh [profile] [options]
#
# Profiles (Cloudflare-focused):
#   end-user   - For non-developers building apps (default)
#   serverless - For Cloudflare Workers (pure API/Worker)
#   redwood    - For RedwoodSDK fullstack apps (SSR, RSC)
#   microtool  - For React + Hono microtools (monorepo)
#
# Serverless options:
#   --type=ui|api     Worker type (default: ui)
#   --with-kv         Add KV storage
#   --with-d1         Add D1 database
#   --with-auth       Add user authentication (workers-users)
#
# Examples:
#   setup-claude.sh serverless
#   setup-claude.sh serverless --type=api
#   setup-claude.sh serverless --with-d1 --with-auth
#   setup-claude.sh redwood
#   setup-claude.sh microtool

set -e

# Get the directory where this script lives (= tob-claude-internal root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Parse arguments
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

# Default profile
PROFILE="${PROFILE:-end-user}"

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

# Validate profile templates exist
validate_profile_templates() {
  local profile="$1"
  local missing=""

  # Check for required template directories per profile
  case "$profile" in
    serverless)
      [ ! -d "$SCRIPT_DIR/.claude/templates/serverless/base" ] && missing="$missing serverless/base"
      ;;
    redwood)
      [ ! -d "$SCRIPT_DIR/.claude/templates/redwood/base" ] && missing="$missing redwood/base"
      ;;
    microtool)
      [ ! -d "$SCRIPT_DIR/.claude/templates/microtool/base" ] && missing="$missing microtool/base"
      ;;
  esac

  # Check shared templates (warning only)
  if [ ! -f "$SCRIPT_DIR/.claude/templates/shared/ci/claude-compliance.yml" ]; then
    echo "Warning: claude-compliance.yml not found - compliance checks will not be copied"
  fi

  if [ -n "$missing" ]; then
    echo "Error: Missing template directories:$missing"
    echo ""
    echo "Please ensure tob-claude-internal is up to date:"
    echo "  cd $SCRIPT_DIR && git pull"
    exit 1
  fi
}

validate_profile_templates "$PROFILE"

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

# Check if CLAUDE.md has standard structure
has_standard_structure() {
  [ -f "CLAUDE.md" ] && \
  grep -q "^# Team Standards" CLAUDE.md && \
  grep -q "^# Project-Specific" CLAUDE.md && \
  grep -q "^# Project Overrides" CLAUDE.md
}

if [ "$IS_NEW_SETUP" = true ]; then
  # Create new CLAUDE.md
  cat > CLAUDE.md << EOF
# Team Standards
${IMPORTS}
# Project-Specific

# Project Overrides

EOF
elif ! has_standard_structure; then
  # CLAUDE.md exists but doesn't have standard structure - refactor it automatically
  echo "⚠️  CLAUDE.md has non-standard structure - restructuring automatically..."
  echo ""

  # Check if claude CLI is available
  if ! command -v claude &> /dev/null; then
    echo "Error: 'claude' CLI not found"
    echo ""
    echo "The Claude CLI is required to refactor non-standard CLAUDE.md files."
    echo "Install from: https://docs.anthropic.com/claude-code"
    echo ""
    echo "Alternatively, manually restructure CLAUDE.md with these sections:"
    echo "  # Team Standards"
    echo "  @path/to/instructions..."
    echo "  # Project-Specific"
    echo "  # Project Overrides"
    exit 1
  fi

  # Create backup
  cp CLAUDE.md CLAUDE.md.backup
  echo "✓ Backup created: CLAUDE.md.backup"

  # Invoke Claude to restructure the file
  echo "✓ Invoking Claude to restructure CLAUDE.md..."
  cat "$SCRIPT_DIR/.claude/agents/refactor-claude-md.md" | claude

  # Replace the placeholder with actual imports (using awk to handle multiline)
  if grep -q "\[IMPORTS_PLACEHOLDER\]" CLAUDE.md; then
    TEMP_FILE=$(mktemp)
    awk -v imports="$IMPORTS" '{gsub(/\[IMPORTS_PLACEHOLDER\]/, imports)}1' CLAUDE.md > "$TEMP_FILE"
    mv "$TEMP_FILE" CLAUDE.md
    echo "✓ Team Standards imports added"
  else
    echo "⚠️  Warning: Could not find [IMPORTS_PLACEHOLDER] in restructured CLAUDE.md"
    echo "   You may need to manually add Team Standards section"
  fi
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

# Symlink agents and standards directories (used by /build command)
if [ -d "$SCRIPT_DIR/.claude/agents" ]; then
  ln -sfn "$SCRIPT_DIR/.claude/agents" ".claude/agents"
fi
if [ -d "$SCRIPT_DIR/.claude/standards" ]; then
  ln -sfn "$SCRIPT_DIR/.claude/standards" ".claude/standards"
fi

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

# Create version marker for compliance tracking
cat > .claude/setup-version.yml << EOF
version: "1.0.0"
profile: "$PROFILE"
setup_date: "$(date +%Y-%m-%d)"
tob_claude_commit: "$(cd "$SCRIPT_DIR" && git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
EOF

# ============================================================
# SERVERLESS PROFILE: Copy templates and setup project
# ============================================================
if [ "$PROFILE" = "serverless" ]; then
  TEMPLATE_DIR="$SCRIPT_DIR/.claude/templates/serverless"
  PROJECT_NAME=$(basename "$PWD")
  WORKER_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  APP_NAME="$PROJECT_NAME"

  echo ""
  echo "Setting up Cloudflare Workers project..."
  echo "  Worker name: $WORKER_NAME"
  echo "  Type: $WORKER_TYPE"

  # Copy base templates (only if files don't exist)
  copy_if_missing() {
    local src="$1"
    local dest="$2"
    if [ ! -e "$dest" ]; then
      mkdir -p "$(dirname "$dest")"
      cp "$src" "$dest"
      echo "  ✓ Created: $dest"
    fi
  }

  # Copy base templates
  if [ -d "$TEMPLATE_DIR/base" ]; then
    # Workflows
    copy_if_missing "$TEMPLATE_DIR/base/.github/workflows/deploy-cloudflare.yml" ".github/workflows/deploy-cloudflare.yml"
    copy_if_missing "$TEMPLATE_DIR/base/.github/workflows/deploy-cloudflare-access.yml" ".github/workflows/deploy-cloudflare-access.yml"
    copy_if_missing "$SCRIPT_DIR/.claude/templates/shared/ci/claude-compliance.yml" ".github/workflows/claude-compliance.yml"
    copy_if_missing "$TEMPLATE_DIR/base/.github/app-config.yml" ".github/app-config.yml"

    # Terraform
    copy_if_missing "$TEMPLATE_DIR/base/infra/cloudflare-access/main.tf" "infra/cloudflare-access/main.tf"
    copy_if_missing "$TEMPLATE_DIR/base/infra/cloudflare-access/variables.tf" "infra/cloudflare-access/variables.tf"

    # Wrangler config
    copy_if_missing "$TEMPLATE_DIR/base/wrangler.toml" "wrangler.toml"

    # Docs
    copy_if_missing "$TEMPLATE_DIR/base/docs/SECURITY.md" "docs/SECURITY.md"
  fi

  # Copy worker type template
  WORKER_TEMPLATE_DIR="$TEMPLATE_DIR/worker-$WORKER_TYPE"
  if [ -d "$WORKER_TEMPLATE_DIR" ]; then
    copy_if_missing "$WORKER_TEMPLATE_DIR/src/index.js" "src/index.js"
  else
    # Fallback to base
    copy_if_missing "$TEMPLATE_DIR/base/src/index.js" "src/index.js"
  fi

  # Replace placeholders in all created files
  replace_placeholders() {
    local file="$1"
    if [ -f "$file" ]; then
      # Use different sed syntax for macOS vs Linux
      if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/{{WORKER_NAME}}/$WORKER_NAME/g" "$file" 2>/dev/null || true
        sed -i '' "s/{{APP_NAME}}/$APP_NAME/g" "$file" 2>/dev/null || true
      else
        sed -i "s/{{WORKER_NAME}}/$WORKER_NAME/g" "$file" 2>/dev/null || true
        sed -i "s/{{APP_NAME}}/$APP_NAME/g" "$file" 2>/dev/null || true
      fi
    fi
  }

  # Replace placeholders in all template files
  for file in wrangler.toml src/index.js .github/workflows/*.yml infra/cloudflare-access/*.tf docs/SECURITY.md; do
    replace_placeholders "$file"
  done

  # Add-ons info
  if [ "$WITH_KV" = true ]; then
    echo "  📦 KV storage: Add namespace ID to wrangler.toml"
  fi
  if [ "$WITH_D1" = true ]; then
    echo "  📦 D1 database: Add database ID to wrangler.toml"
  fi
  if [ "$WITH_AUTH" = true ]; then
    echo "  📦 Auth: See docs for workers-users integration"
  fi

  echo ""
  echo "Next steps:"
  echo "  1. Update infra/cloudflare-access/main.tf with your:"
  echo "     - Cloudflare subdomain ({{CLOUDFLARE_SUBDOMAIN}})"
  echo "     - Email domain ({{EMAIL_DOMAIN}})"
  echo "     - Developer emails for dev environment"
  echo "  2. Add GitHub secrets:"
  echo "     - CLOUDFLARE_API_TOKEN"
  echo "     - CLOUDFLARE_ACCESS_TOKEN"
  echo "     - CLOUDFLARE_ACCOUNT_ID"
  echo "  3. Run: wrangler dev"
  echo ""
fi

# Different message for init vs switch
if [ "$IS_NEW_SETUP" = true ]; then
  echo "✓ TOB Claude config initialized with '$PROFILE' profile"
else
  echo "✓ Switched to '$PROFILE' profile"
fi
