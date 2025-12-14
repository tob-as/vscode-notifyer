# Documentation Index

Quick reference for TOB Claude development.

## Getting Started

| Document | Description |
|----------|-------------|
| [First Deploy](FIRST_DEPLOY.md) | Step-by-step Cloudflare Workers deployment |
| [Secrets Management](SECRETS.md) | How to handle secrets across environments |

## Development

| Document | Description |
|----------|-------------|
| [Testing Guide](TESTING.md) | Vitest setup and testing patterns |
| [Cross-Skill Interaction](cross-skill-interaction.md) | How skills work together |

## Security

| Document | Description |
|----------|-------------|
| [Security Policy](SECURITY.md) | Zero Trust requirements and policies |
| [Authentication Standard](../.claude/instructions/auth-standard.md) | Cloudflare Access integration |

## Architecture

| Document | Description |
|----------|-------------|
| [CLAUDE.md Template](claude-md-template.md) | Standard CLAUDE.md structure |
| [Project Instructions](project-instructions-template.md) | How to write project instructions |
| [Claude Optimization](claude-optimization-guide.md) | Tips for effective Claude usage |

## Templates

| Template | Use Case |
|----------|----------|
| `serverless/` | API-only Cloudflare Workers |
| `redwood/` | Full-stack apps with UI (RedwoodSDK) |

## Profiles

| Profile | Description |
|---------|-------------|
| `end-user` | Non-developers building apps |
| `serverless` | API developers (no UI) |
| `redwood` | Full-stack developers (UI + API) |

## Quick Commands

```bash
# Setup new project
/create <project-name>

# Design then build
/design
/build

# Sync from upstream
/update
```
