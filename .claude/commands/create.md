# /create - Initialize New Project

Create a new project with TOB Claude setup.

## Usage

```
/create <project-name> [profile]
```

## Arguments

- **project-name** (required): Name for the project folder
- **profile** (optional): `serverless` | `redwood` | `microtool` | `end-user` (default: `serverless`)

## Execution Steps

### Step 1: Parse Arguments

Extract from user input:
1. `project-name` - the first argument after `/create`
2. `profile` - the second argument (optional, default: `serverless`)

Example inputs:
- `/create my-app` → name: `my-app`, profile: `serverless`
- `/create my-app redwood` → name: `my-app`, profile: `redwood`
- `/create my-app microtool` → name: `my-app`, profile: `microtool`
- `/create my-app end-user` → name: `my-app`, profile: `end-user`

### Step 2: Validate Input

Check the project name:
- Contains only letters, numbers, hyphens, underscores
- No spaces or special characters
- Not empty

If invalid, output:
```
Invalid project name. Use only letters, numbers, hyphens, underscores.
```
And stop.

Check folder doesn't exist:
```bash
test -d /home/coder/workspace/repos/<project-name>
```

If exists, output:
```
Project '<project-name>' already exists at /home/coder/workspace/repos/<project-name>
Choose a different name.
```
And stop.

### Step 3: Create Project Folder

```bash
mkdir -p /home/coder/workspace/repos/<project-name>
```

### Step 4: Initialize Git

```bash
cd /home/coder/workspace/repos/<project-name> && git init
```

### Step 5: Run Setup Script

```bash
cd /home/coder/workspace/repos/<project-name> && /home/coder/workspace/tob-claude-internal/setup-claude.sh <profile>
```

If setup fails, show the error and suggest:
```
Setup failed. Check that setup-claude.sh exists and has correct permissions.
```

### Step 6: Open in VS Code

```bash
code /home/coder/workspace/repos/<project-name>
```

### Step 7: Output Summary

```
✓ Created /home/coder/workspace/repos/<project-name>
✓ Initialized git repository
✓ Applied '<profile>' profile
✓ Opening in VS Code...

→ Switch to the new window and run /design to start planning your app.
```

## Error Handling

| Error | Message |
|-------|---------|
| No project name | "Usage: /create <project-name> [profile]" |
| Invalid characters | "Invalid project name. Use only letters, numbers, hyphens, underscores." |
| Folder exists | "Project '<name>' already exists. Choose a different name." |
| Setup fails | Show error output from setup-claude.sh |
| Invalid profile | "Unknown profile '<profile>'. Available: serverless, redwood, microtool, end-user" |

## Available Profiles

| Profile | Description |
|---------|-------------|
| `serverless` | Pure Cloudflare Workers (API, KV, D1) - **default** |
| `redwood` | Fullstack with RedwoodSDK (React Server Components, SSR) |
| `microtool` | React SPA + Hono API (monorepo architecture) |
| `end-user` | Simplified workflow for non-developers |

## Examples

```
/create vetbot-app
/create okr-dashboard redwood
/create simple-landing end-user
/create api-service serverless
/create fullstack-app microtool
```
