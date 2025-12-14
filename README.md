# TOB Claude Internal

Meta-repository for KI-assisted development of **Serverless applications on Cloudflare**. Contains shared configurations, skills, agents, and standards optimized for Cloudflare Workers, D1, R2, KV, and Zero Trust.

## Quick Start

```bash
/create my-app      # Create new project
/intake             # Define business use case → PRD
/breakdown          # PRD → User Stories
/sprint-plan        # Plan sprint
```

That's it. **RedwoodSDK** (Cloudflare-native React framework). No alternatives.

> **Note:** We use [RedwoodSDK](https://docs.rwsdk.com/) (rwsdk 1.x), NOT Redwood GraphQL. See [TECH_STACK.md](docs/TECH_STACK.md) for clarification.

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
- [Onboarding](docs/ONBOARDING.md) - New developer setup
- [Tech Stack](docs/TECH_STACK.md) - RedwoodSDK, Cloudflare, tooling
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

**Phase:** Wave 10 (Engineering OS - Security Hardening)
**Version:** 0.9

Wave 10 changes:
- **Smart Permissions:** Auto-approve hook for git/npm/mkdir (no prompts)
- **Deployment Security:** wrangler deploy blocked locally, CI-only
- **Secret Management:** CLAUDE_ENV_FILE for persistent developer secrets
- **Preflight Checks:** Automatic secret validation before dev
- **Zero Trust Hardening:** workers_dev=false, Access-check in CI
- **Tech Stack Docs:** RedwoodSDK vs Redwood GraphQL clarified
