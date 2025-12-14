# /create - Initialize New Project

Create a new project with TOB Claude setup. Uses GitHub repository creation for proper version control.

## Usage

```
/create <project-name> [profile]
```

## Arguments

- **project-name** (required): Name for the project (kebab-case)
- **profile** (optional): `redwood` | `serverless` | `end-user` (default: `redwood`)

## Execution Steps

### Step 1: Parse Arguments

Extract from user input:
1. `project-name` - the first argument after `/create`
2. `profile` - the second argument (optional, default: `redwood`)

Example inputs:
- `/create my-app` → name: `my-app`, profile: `redwood`
- `/create my-app serverless` → name: `my-app`, profile: `serverless`
- `/create my-app end-user` → name: `my-app`, profile: `end-user`

### Step 2: Validate Input

Check the project name:
- Contains only lowercase letters, numbers, hyphens
- No spaces or special characters
- Not empty

If invalid, output:
```
Invalid project name. Use lowercase letters, numbers, and hyphens only (kebab-case).
Example: my-cool-app
```
And stop.

### Step 3: Create GitHub Repository

```bash
gh repo create the-original-body/<project-name> --private --clone --gitignore Node
```

If repo creation fails (already exists or permissions issue):
```
Repository creation failed. Check that:
1. You're authenticated with GitHub (gh auth status)
2. A repo with this name doesn't already exist
```
And stop.

### Step 4: Navigate to Project

```bash
cd /home/coder/workspace/repos/<project-name>
```

### Step 5: Add Upstream Remote

```bash
git remote add upstream https://github.com/the-original-body/tob-claude-internal.git
```

This allows future updates via `/update` command.

### Step 6: Run Setup Script

```bash
/home/coder/workspace/tob-claude-internal/setup-claude.sh <profile>
```

If setup fails, show the error and suggest:
```
Setup failed. Check that setup-claude.sh exists and has correct permissions.
```

### Step 7: Create CLAUDE_SCOPE.md

Create a scope lock file for multi-repo safety:

```bash
cat > CLAUDE_SCOPE.md << 'EOF'
# Scope Lock

**Project:** <project-name>
**Path:** /home/coder/workspace/repos/<project-name>
**Profile:** <profile>
**Created:** <YYYY-MM-DD>

## Boundaries

This file marks the repository boundaries for Claude Code sessions.
All file operations should be contained within this repository unless explicitly requested.

## Tab Title Convention

When working in this project, the Claude Code tab should display:
```
[TOB] <project-name> — SCOPE LOCK
```
EOF
```

### Step 8: Initial Commit

```bash
git add -A
git commit -m "feat: initial project setup with <profile> profile

🤖 Generated with Claude Code"
git push -u origin main
```

### Step 9: Open in VS Code

```bash
code /home/coder/workspace/repos/<project-name>
```

### Step 10: Output Summary

```
✓ Created GitHub repo: the-original-body/<project-name>
✓ Cloned to /home/coder/workspace/repos/<project-name>
✓ Added upstream remote for future updates
✓ Applied '<profile>' profile
✓ Pushed initial commit
✓ Opening in VS Code...

→ Switch to the new window and run /design to start planning your app.
→ Use /update later to sync with tob-claude-internal improvements.
```

## Error Handling

| Error | Message |
|-------|---------|
| No project name | "Usage: /create <project-name> [profile]" |
| Invalid characters | "Invalid project name. Use lowercase letters, numbers, and hyphens only." |
| Repo exists | "Repository already exists. Choose a different name or delete the existing repo." |
| gh not authenticated | "Not authenticated with GitHub. Run: gh auth login" |
| Setup fails | Show error output from setup-claude.sh |
| Invalid profile | "Unknown profile '<profile>'. Available: redwood, serverless, end-user" |

## Available Profiles

| Profile | Description | When to Use |
|---------|-------------|-------------|
| `redwood` | Fullstack with RedwoodSDK (RSC, Prisma, D1) - **default** | Apps with UI |
| `serverless` | Pure Cloudflare Workers API (TypeScript) | API-only services |
| `end-user` | Simplified workflow for non-developers | Non-technical users |

## Examples

```
/create okr-dashboard              # Redwood fullstack app (default)
/create api-gateway serverless     # API-only worker
/create landing-page end-user      # Simple app for non-dev
```

## What Gets Created

```
<project-name>/
├── CLAUDE.md              # Team standards imports
├── CLAUDE_SCOPE.md        # Scope lock for this project
├── .claude/
│   ├── active-profile     # Current profile marker
│   ├── settings.json      # Claude Code settings
│   ├── setup-version.yml  # Version tracking
│   ├── commands/          # Symlinked commands
│   ├── skills/            # Symlinked skills
│   ├── agents/            # Symlinked agents
│   └── hooks/             # Symlinked hooks
├── .github/
│   └── workflows/         # CI/CD workflows (from templates)
└── [profile-specific files]
```
