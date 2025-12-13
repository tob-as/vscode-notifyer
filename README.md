# TOB Claude Internal

Meta-repository for KI-assisted development of **Serverless applications on Cloudflare**. Run the setup script once to get standardized instructions, commands, and hooks optimized for Cloudflare Workers, D1, R2, KV, and Zero Trust.

## Quick Start

### 1. Clone this repo (once)

```bash
cd ~/workspace  # or wherever you keep TOB repos
git clone git@github.com:OriginalBody/tob-claude-internal.git
```

### 2. Install (once)

```bash
cd tob-claude-internal
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

## Profiles (Cloudflare-focused)

| Profile | Use Case | Tech Stack | Description |
|---------|----------|------------|-------------|
| `end-user` | Non-developers | Flexible | Simplified workflow for building apps (default) |
| `serverless` | Pure Workers/API | Workers + KV/D1 | Edge serverless with security, multi-env |
| `redwood` | Fullstack with SSR | RedwoodSDK + React | React Server Components on Cloudflare |
| `microtool` | API + React SPA | Hono + React | Monorepo with separate frontend/backend |

### Profile Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│                    What are you building?                    │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
   No code / just        Pure API /         App with UI?
   KI assistance?        Worker only?
          │                   │                   │
          ▼                   ▼                   │
      end-user           serverless              │
                                                 │
                              ┌──────────────────┴──────────────────┐
                              │                                     │
                              ▼                                     ▼
                     Need SSR / SEO?                    SPA + API separate?
                     Server Components?
                              │                                     │
                              ▼                                     ▼
                          redwood                              microtool
```

```bash
setup-claude.sh end-user    # Default - non-technical users
setup-claude.sh serverless  # Pure Workers API
setup-claude.sh redwood     # Fullstack with SSR (RedwoodSDK)
setup-claude.sh microtool   # React SPA + Hono API (Monorepo)
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
cd ~/workspace/tob-claude-internal
git pull
```

Changes apply automatically via symlinks (except CLAUDE.md imports — those need manual update if new instruction files are added).

## Project-Specific Overrides

Edit the `## Project-Specific` section in your project's `CLAUDE.md` to add project-specific instructions that override or extend the shared ones.
