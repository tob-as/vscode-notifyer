# Team Standards
@~/workspace/tob-claude-internal/.claude/instructions/workflow.md
@~/workspace/tob-claude-internal/.claude/instructions/response-style-user.md
@~/workspace/tob-claude-internal/.claude/instructions/conflict-handling.md
@~/workspace/tob-claude-internal/.claude/instructions/security-critical.md

# Project-Specific

> Meta-repository for KI-assisted development of **Serverless applications on Cloudflare**. Contains shared configurations, skills, agents, and standards optimized for Cloudflare Workers, D1, R2, KV, and Zero Trust.

### Tech Stack

- **Cloudflare Workers** - Edge serverless compute
- **Cloudflare D1** - SQLite database at the edge
- **Cloudflare KV** - Key-value storage
- **Cloudflare R2** - S3-compatible object storage
- **Cloudflare Access** - Zero Trust security
- **Claude Code** - Primary AI coding assistant
- **Docker** - Containerized dev environments
- **Git** - Version control, branch-based workflows

### Project Structure

```
/.claude/              - Importable configs for individual users
  /commands/           - Slash commands (/pr, /fix-issue, etc.)
  /agents/             - Specialized agent configurations
  /skills/             - Reusable coding patterns and templates
  /settings/           - Hooks, automation rules, settings.json templates
  /profiles/           - Cloudflare-focused profiles (serverless, redwood)
  /instructions/       - Shared instruction sets
/docs/                 - Guides, onboarding, reference material
```

Users can import from `.claude/` into their own `~/.claude/` directory.

### Key Commands

```bash
# Claude Code
/init                    # Initialize project with CLAUDE.md
/clear                   # Clear conversation context
/compact                 # Compress conversation
/mcp                     # Manage MCP server connections
/context                 # Check token usage

# Custom commands (in /commands/)
/pr                      # Create well-documented pull request
/fix-issue [number]      # Analyze and fix GitHub issue end-to-end
```

### Code Style

- Keep configurations minimal and specific—no verbose explanations
- Use explicit patterns over implicit conventions
- Document "why" not "what"
- Provide alternatives with restrictions: "Never X. Instead use Y for [case]"
- Target 50-150 lines for CLAUDE.md files

### Development Approach

**Philosophy: Ship fast, iterate based on real usage**

- Build v0.1 first, improve after validation
- "Good enough to be useful" over perfect
- Basic coding standards yield 3x improvements—don't over-engineer
- All apps deploy to Cloudflare (Workers, Pages, D1, R2, KV)

**Implementation process:**
1. Present implementation plan first
2. Wait for feedback and confirmation
3. Build for reuse—think "could this become a skill?"
4. Keep it simple and debuggable

### Critical Constraints

**Non-negotiables:**
- All production code through André's CI/CD pipeline
- Security sign-offs from André before customer-facing deployment
- Development runs in containerized environments only
- Foundry integration is out of scope (handled by Yohann + 10x team)

**Token budget:** ~$50/day acceptable

### CLAUDE.md Hierarchy

All CLAUDE.md files are **merged**—Claude sees everything:
1. `~/.claude/CLAUDE.md` — User-level (all projects)
2. `/project/CLAUDE.md` — Project-level
3. `/project/subfolder/CLAUDE.md` — Folder-level (on-demand)

For conflicts, use explicit overrides:
```markdown
## Overrides
- Package Manager: npm (not pnpm, legacy project)
```

### Scope Lock Protocol

When working in multi-repo environments:
1. Check for `CLAUDE_SCOPE.md` to identify project boundaries
2. Tab title should display: `[TOB] project-name — SCOPE LOCK`
3. Restrict file operations to the current repository
4. Use `/update` to sync with upstream improvements

### Git Workflow

- Branch naming: `feature/[description]` or `fix/[description]`
- Never commit directly to main
- Run quality checks before committing
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- TypeScript only in src/ (no .js files)

### Do Not

- Do not over-engineer for enterprise scale—we're a small team
- Do not embed full documentation—link to docs, let Claude read selectively
- Do not create verbose CLAUDE.md files—keep under 150 lines
- Do not skip explicit override patterns when project needs differ from org standards

### Key People

- **Armin Soyka** (CEO) - Vision, strategic decisions
- **Johannes Schulz** - System-facing: meta-repo, skills, agents, standards
- **Yohann Doillon** - Daily management, syncs
- **André Laugks** - CI/CD, security sign-offs, quality gate
- **Lukas Lindner** - Person-facing: onboarding, feedback, user bridge

### Communication

- **Slack:** #claude-code (private) — `C0A1C97RCP6`
- **Secrets:** https://onetimesecret.original-body.dev/

### When to Push Back

**Push back when:**
- Request adds unnecessary complexity
- Verbose code where minimal would work
- Scope creep beyond current phase
- Over-engineering for hypothetical future needs

**Comply when:**
- Request is clear and can be built quickly
- Follows established patterns
- Keeps code simple and reusable

---

### Backlog

Persistent todos for this project. Add items here during sessions; review and clean up regularly.

- [x] Add version tracking to skills (completed Wave 3)
- [x] Document cross-skill interaction (see docs/cross-skill-interaction.md)
- [x] Redwood SDK as default UI framework (Wave 4)
- [x] TypeScript-only enforcement (Wave 4)
- [x] /create v2 with GitHub repo creation (Wave 4)
- [x] /update command for upstream sync (Wave 4)
- [x] Zero Trust compliance gate (Wave 5)
- [x] Vitest testing foundation (Wave 5)
- [x] Single Path - Redwood only for UI (Wave 6)
- [x] Smart Permissions - security-critical files (Wave 6)

---

*Last updated: 14.12.2025*
*Phase: Single Path / v0.5*
# Project Overrides

