# TOB Claude Internal

Meta-repository for KI-assisted development of **Serverless applications on Cloudflare**. Contains shared configurations, skills, agents, and standards optimized for Cloudflare Workers, D1, R2, KV, and Zero Trust.

## Quick Start

```bash
/create my-app
/design
/build
```

That's it. Redwood. No alternatives.

### API-Only Projects

```bash
/create my-api --api-only
```

### Existing Project

```bash
cd ~/workspace/repos/my-project
setup-claude.sh redwood     # Full-stack with UI (default)
setup-claude.sh serverless  # API-only (no UI)
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

**Phase:** Wave 6 (Single Path)
**Version:** 0.5

Wave 6 changes:
- Single Path: Redwood is the ONLY UI framework
- No profile selection - automatic stack detection
- Smart Permissions: rm + tree auto-allowed
- Security-critical files require explicit approval
