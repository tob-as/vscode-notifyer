# TOB Claude Internal

Meta-repository for KI-assisted development of **Serverless applications on Cloudflare**. Contains shared configurations, skills, agents, and standards optimized for Cloudflare Workers, D1, R2, KV, and Zero Trust.

## Quick Start

### New Project (Recommended)

```bash
# In Claude Code, use the /create command
/create my-project-name
```

This creates a GitHub repo with full template setup.

### Existing Project

```bash
cd ~/workspace/repos/my-project
setup-claude.sh [profile]
```

## Profiles

| Profile | Use Case | Description |
|---------|----------|-------------|
| `end-user` | Non-developers | Simplified workflow (default) |
| `serverless` | API-only Workers | Edge compute, no UI |
| `redwood` | Full-stack apps | **The only UI path** - RedwoodSDK with React Server Components |

### Decision Tree

```
What are you building?
        │
        ├── No code / KI assistance only → end-user
        │
        ├── Pure API / Worker only → serverless
        │
        └── App with UI → redwood (only option)
```

```bash
setup-claude.sh end-user    # Default - non-technical users
setup-claude.sh serverless  # Pure Workers API (no UI)
setup-claude.sh redwood     # Full-stack with UI (RedwoodSDK)
```

## Core Commands

| Command | Description |
|---------|-------------|
| `/create <name>` | Create new GitHub repo with template |
| `/design` | Design phase - create spec, no code |
| `/build` | Build phase - execute spec |
| `/update` | Sync from upstream templates |

## Documentation

See [docs/INDEX.md](docs/INDEX.md) for complete documentation index.

Key guides:
- [First Deploy](docs/FIRST_DEPLOY.md) - Cloudflare Workers deployment
- [Testing Guide](docs/TESTING.md) - Vitest setup and patterns
- [Security Policy](docs/SECURITY.md) - Zero Trust requirements
- [Secrets Management](docs/SECRETS.md) - Handling secrets

## Architecture

```
.claude/
├── commands/       # Slash commands (/design, /build, etc.)
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

**Phase:** Wave 5 (Hardening)
**Version:** 0.4

Wave 5 changes:
- Zero Trust compliance gate in CI
- Redwood contract enforcement
- Vitest testing foundation
- TypeScript-only enforcement
- Legacy cleanup complete
