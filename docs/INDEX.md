# Documentation Index

Quick reference for TOB Claude development.

## Getting Started

| Document | Description |
|----------|-------------|
| [Onboarding](ONBOARDING.md) | New developer setup (CLAUDE_ENV_FILE, credentials) |
| [Tech Stack](TECH_STACK.md) | RedwoodSDK, Cloudflare, frameworks explained |
| [First Deploy](FIRST_DEPLOY.md) | Step-by-step Cloudflare Workers deployment |
| [Secrets Management](SECRETS.md) | Four-layer secret management system |

## Product OS

| Document | Description |
|----------|-------------|
| [Product OS](PRODUCT_OS.md) | End-to-end process overview |
| [Versioning](VERSIONING.md) | SemVer guidelines |
| [Release Process](RELEASE_PROCESS.md) | Branch strategy and release flow |
| [Commits](COMMITS.md) | Conventional commits standard |
| [Labels](LABELS.md) | GitHub label system |

## Development

| Document | Description |
|----------|-------------|
| [Testing Guide](TESTING.md) | Vitest setup and testing patterns |
| [E2E Testing](E2E_TESTING.md) | Playwright with CF Access |
| [PWA](PWA.md) | Progressive Web App setup |
| [Email](EMAIL.md) | Resend email integration |
| [Cross-Skill Interaction](cross-skill-interaction.md) | How skills work together |

## CI/CD

| Document | Description |
|----------|-------------|
| [CI/CD Pipeline](CI_CD.md) | Quality gates and deployment |
| [Security](SECURITY.md) | Zero Trust, scanning, scope lock |

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
| `shared/quality/` | ESLint, Prettier, TypeScript configs |
| `shared/testing/` | Vitest, Playwright configs |
| `shared/security/` | Dependabot, CodeQL, npm audit |
| `shared/ci/` | CI/CD workflow templates |
| `shared/pwa/` | PWA manifest and config |
| `shared/email/` | Resend email templates |
| `shared/scripts/` | Preflight checks, utilities |

## Quick Commands

```bash
# Create new project
/create <project-name>
/create <name> --api-only   # API only, no UI

# Product OS workflow
/intake                     # Business idea → PRD
/breakdown                  # PRD → User Stories
/sprint-plan                # Plan sprint
/release                    # Version bump + Changelog
/retro                      # Sprint retrospective

# Automatic chaining
/intake --auto              # Runs full workflow

# Sync from upstream
/update
```
