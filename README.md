# TOB Claude Internal

Meta-repository for KI-assisted development of **Serverless applications on Cloudflare**. Contains shared configurations, skills, agents, and standards optimized for Cloudflare Workers, D1, R2, KV, and Zero Trust.

## Quick Start

```bash
/create my-app      # Create new project
/intake             # Define business use case → PRD
/breakdown          # PRD → User Stories
/sprint-plan        # Plan sprint
```

That's it. Redwood. No alternatives.

### API-Only Projects

```bash
/create my-api --api-only
```

### Existing Project

```bash
cd ~/workspace/repos/my-project
setup-claude.sh              # Auto-detects profile from project files
```

Auto-detection:
- Has `@redwoodjs/sdk` in package.json → **redwood** profile
- Has `wrangler.toml` → **serverless** profile
- Otherwise → **base** profile

## Commands

| Command | Description |
|---------|-------------|
| `/create <name>` | Create new GitHub repo with template |
| `/update` | Sync from upstream templates |
| `/intake` | Business use case to PRD |
| `/breakdown` | PRD to user stories (INVEST) |
| `/sprint-plan` | Sprint planning with WIP limits |
| `/release` | SemVer release with changelog |
| `/retro` | Sprint retrospective |

Commands chain automatically: `/intake` → `/breakdown` → `/sprint-plan` → `/release` → `/retro`

## Documentation

See [docs/INDEX.md](docs/INDEX.md) for complete documentation index.

Key guides:
- [Product OS](docs/PRODUCT_OS.md) - End-to-end process overview
- [First Deploy](docs/FIRST_DEPLOY.md) - Cloudflare Workers deployment
- [Testing Guide](docs/TESTING.md) - Vitest setup and patterns
- [E2E Testing](docs/E2E_TESTING.md) - Playwright with CF Access
- [Security Policy](docs/SECURITY.md) - Zero Trust requirements
- [CI/CD Pipeline](docs/CI_CD.md) - Quality gates and deployment
- [Email](docs/EMAIL.md) - Resend integration
- [PWA](docs/PWA.md) - Progressive Web App setup
- [Secrets](docs/SECRETS.md) - Secret management across environments

## Architecture

```
.claude/
├── commands/       # Slash commands (/create, /intake, etc.)
├── agents/         # Specialized agent configurations
├── skills/         # Reusable coding patterns
├── settings/       # Permissions, hooks, model selection
├── profiles/       # Profile definitions
├── templates/      # Project templates
│   ├── serverless/ # API-only Workers
│   ├── redwood/    # Full-stack with UI
│   └── shared/     # Shared CI/compliance
└── instructions/   # Coding standards, workflows
```

## Security Model

**Zero Trust by Default:**
- All internal apps require Cloudflare Access protection
- CI blocks deployment if Access is missing
- Visibility change to public requires security review

## Status

**Phase:** Wave 9 (Profile Simplification)
**Version:** 0.8

Wave 9 changes:
- **Auto-Detection:** `setup-claude.sh` detects profile from project files
- **All Skills Available:** Skills are always symlinked, Claude chooses what to use
- **All Commands Available:** Commands are always symlinked
- **Simplified Profiles:** Profile only controls Scope Lock (write permissions)
- **Removed Obsolete Files:** end-user.json, developer.json, microtool.json deleted
