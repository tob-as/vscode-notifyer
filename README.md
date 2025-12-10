# TOB Claude Setup

Shared Claude Code configurations for TOB projects. Run the setup script once to get standardized instructions, commands, and hooks in any project.

## Quick Start

### 1. Clone this repo (once)

```bash
cd ~/Projects/OriginalBody  # or wherever you keep TOB repos
git clone git@github.com:OriginalBody/tob-claude-setup.git
```

### 2. Install (once)

```bash
cd tob-claude-setup
./install.sh
source ~/.zshrc  # or open new terminal
```

### 3. Setup any project

```bash
cd ~/Projects/OriginalBody/my-project
setup-claude.sh [profile]
```

This creates:
- `CLAUDE.md` with shared instruction imports
- `.claude/` folder with symlinked commands, settings, hooks

## Profiles

| Profile | Use Case | Description |
|---------|----------|-------------|
| `end-user` | Non-developers | Simplified workflow for building apps (default) |
| `developer` | Developers | Full coding standards, git workflow |
| `serverless` | Cloudflare Workers | Edge serverless with security, multi-env |

```bash
setup-claude.sh end-user    # Default
setup-claude.sh developer   # For developers
setup-claude.sh serverless  # For Cloudflare Workers
```

---

## Serverless Profile (Cloudflare Workers)

The serverless profile sets up a complete Cloudflare Workers project with:

- Multi-environment deployment (dev/staging/prod)
- Cloudflare Access security (blocks unprotected internal apps)
- Environment badges (DEV=red, STAGING=orange, PROD=green)
- Terraform for Access policies
- GitHub Actions CI/CD

### Basic Setup

```bash
cd my-new-worker
setup-claude.sh serverless
```

### With Options

```bash
# API-only worker (no UI)
setup-claude.sh serverless --type=api

# With KV storage
setup-claude.sh serverless --with-kv

# With D1 database
setup-claude.sh serverless --with-d1

# With user authentication (includes KV + D1)
setup-claude.sh serverless --with-auth

# Combine options
setup-claude.sh serverless --type=api --with-d1
```

### What Gets Created

```
project/
├── src/
│   └── index.js              # Worker code
├── wrangler.toml             # Multi-environment config
├── .github/
│   ├── app-config.yml        # Security visibility (internal/public)
│   └── workflows/
│       ├── deploy-cloudflare.yml
│       └── deploy-cloudflare-access.yml
├── infra/
│   └── cloudflare-access/
│       ├── main.tf           # Access policies
│       └── variables.tf
└── docs/
    └── SECURITY.md
```

### Required GitHub Secrets

Add these to your repository:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Worker deployment |
| `CLOUDFLARE_ACCESS_TOKEN` | Zero Trust API |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID |

### Security Model

**Secure by default:**
- All apps are `internal` unless explicitly marked `public`
- CI blocks deploys if internal app lacks Cloudflare Access
- Access policies managed via Terraform

Change visibility in `.github/app-config.yml`:
```yaml
visibility: internal  # Requires Access protection
# OR
visibility: public    # No protection (use carefully)
```

### Branch → Environment

| Branch | Environment | Worker Name |
|--------|-------------|-------------|
| `develop` | dev | `{name}-dev` |
| `staging` | staging | `{name}-staging` |
| `main` | prod | `{name}-prod` |

### User Authentication

For apps requiring user registration/login, use the `--with-auth` flag which integrates [workers-users](https://github.com/devondragon/workers-users):

```bash
setup-claude.sh serverless --with-auth
```

See `.claude/templates/serverless/with-auth/README.md` for setup instructions.

---

## What's Included

| Folder | Purpose |
|--------|---------|
| `.claude/instructions/` | Shared coding standards, git workflow, response style |
| `.claude/commands/` | Slash commands (`/design`, `/build`, etc.) |
| `.claude/settings/` | Permissions, hooks, model selection |
| `.claude/skills/` | Reusable task-specific patterns |
| `.claude/agents/` | Specialized agent configurations |
| `.claude/profiles/` | Profile definitions |
| `.claude/templates/` | Project templates (serverless, etc.) |

## Updating

Pull latest and re-run setup in your projects:

```bash
cd ~/Projects/OriginalBody/tob-claude-setup
git pull
```

Changes apply automatically via symlinks (except CLAUDE.md imports — those need manual update if new instruction files are added).

## Project-Specific Overrides

Edit the `## Project-Specific` section in your project's `CLAUDE.md` to add project-specific instructions that override or extend the shared ones.
