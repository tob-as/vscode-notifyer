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

### Product Commands

| Command | Description |
|---------|-------------|
| `/intake` | Business use case to PRD |
| `/breakdown` | PRD to user stories (INVEST) |
| `/sprint-plan` | Sprint planning with WIP limits |
| `/release` | SemVer release with changelog |
| `/retro` | Sprint retrospective |

## Documentation

See [docs/INDEX.md](docs/INDEX.md) for complete documentation index.

Key guides:
- [Product OS](docs/PRODUCT_OS.md) - End-to-end process overview
- [First Deploy](docs/FIRST_DEPLOY.md) - Cloudflare Workers deployment
- [Testing Guide](docs/TESTING.md) - Vitest setup and patterns
- [Security Policy](docs/SECURITY.md) - Zero Trust requirements
- [Versioning](docs/VERSIONING.md) - SemVer guidelines
- [Release Process](docs/RELEASE_PROCESS.md) - Branch strategy

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

**Phase:** Wave 7 (Product OS)
**Version:** 0.6

Wave 7 changes:
- Product Operating System: /intake → /breakdown → /sprint-plan → /release → /retro
- 7 new agents: product-owner, researcher, sprint-planner, qa-tester, release-manager, docs-keeper, retro-facilitator
- GitHub Issue Forms (feature, story, bug, security, retro-improvement)
- Release Drafter automation
- SemVer and Conventional Commits documentation
