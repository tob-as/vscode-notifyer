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
setup-claude.sh
```

This creates:
- `CLAUDE.md` with shared instruction imports
- `.claude/` folder with symlinked commands, settings, hooks

## What's Included

| Folder | Purpose |
|--------|---------|
| `.claude/instructions/` | Shared coding standards, git workflow, response style |
| `.claude/commands/` | Slash commands (`/pr`, `/fix-issue`, etc.) |
| `.claude/settings/` | Hooks for auto-formatting and safety blocks |
| `.claude/skills/` | Reusable task-specific workflows |
| `.claude/agents/` | Specialized agent configurations |

## Updating

Pull latest and re-run setup in your projects:

```bash
cd ~/Projects/OriginalBody/tob-claude-setup
git pull
```

Changes apply automatically via symlinks (except CLAUDE.md imports — those need manual update if new instruction files are added).

## Project-Specific Overrides

Edit the `## Project-Specific` section in your project's `CLAUDE.md` to add project-specific instructions that override or extend the shared ones.
