# Developer Onboarding

Quick start guide for new team members.

---

## Prerequisites

- GitHub account with access to `the-original-body` organization
- Cloudflare account access
- Docker installed (for containerized dev)
- Claude Code CLI installed

---

## 1. Setup Global Secrets

Create `~/.tob/env-setup.sh` with your personal credentials:

```bash
#!/bin/bash
# TOB Global Secrets (lokal, NICHT committen)

# Cloudflare
export CLOUDFLARE_ACCOUNT_ID="your-account-id-here"
export CLOUDFLARE_API_TOKEN="your-api-token-here"

# Resend (for email sending)
export RESEND_API_KEY="re_xxxxxxxxxxxxx"

# Add more as needed per project
```

Make it executable:
```bash
chmod +x ~/.tob/env-setup.sh
```

---

## 2. Configure Claude Code

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# TOB Claude Env
export CLAUDE_ENV_FILE=~/.tob/env-setup.sh
```

Then reload:
```bash
source ~/.bashrc  # or ~/.zshrc
```

---

## 3. Get Your Credentials

### Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Add permissions:
   - Account: Workers Scripts: Edit
   - Account: Workers KV Storage: Edit
   - Account: D1: Edit
   - Zone: Workers Routes: Edit
5. Copy token to your `env-setup.sh`

### Cloudflare Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select any site
3. Copy Account ID from sidebar

### Resend API Key

1. Sign up at [Resend](https://resend.com/)
2. Go to API Keys
3. Create new key
4. Copy to your `env-setup.sh`

### Other Secrets

Ask your team lead for:
- Shared service accounts
- Testing credentials
- Internal API keys

---

## 4. Clone tob-claude-internal

```bash
cd ~/workspace
git clone https://github.com/the-original-body/tob-claude-internal.git
```

This is the meta-repo with all skills, agents, templates.

---

## 5. Setup Your First Project

### New Project

```bash
cd ~/workspace
claude  # Start Claude Code

# In Claude:
/create my-first-app
```

### Existing Project

```bash
cd ~/workspace/repos/existing-project

# Add upstream (for /update command)
git remote add upstream https://github.com/the-original-body/tob-claude-internal.git

# Run setup (auto-detects profile)
/home/coder/workspace/tob-claude-internal/setup-claude.sh

# Start Claude
claude
```

---

## 6. Verify Setup

Run preflight check to ensure secrets are available:

```bash
cd your-project
npm run preflight
```

Expected output:
```
✓ All required secrets present
```

If secrets missing:
```
❌ Missing required secrets:
   - RESEND_API_KEY

See docs/ONBOARDING.md for setup
```

---

## 7. Development Workflow

```bash
# Start local dev server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run typecheck
```

**NEVER run locally:**
- `wrangler deploy` (blocked - CI-only)
- `wrangler publish` (blocked - CI-only)

**Deployment happens via CI:**
1. Create PR
2. Merge to main
3. GitHub Actions deploys automatically

---

## 8. Common Commands

| Command | Description |
|---------|-------------|
| `/intake` | Start new feature (business case → PRD) |
| `/breakdown` | PRD → User Stories |
| `/sprint-plan` | Plan sprint |
| `/update` | Sync from tob-claude-internal |
| `/pr` | Create pull request |

---

## Troubleshooting

### "Missing required secrets"

1. Check `~/.tob/env-setup.sh` exists and is executable
2. Verify `CLAUDE_ENV_FILE` is exported
3. Restart Claude Code session

### "wrangler deploy blocked"

This is intentional. Deploy via CI only:
1. Push code
2. Create PR
3. Merge to main
4. CI deploys automatically

### "Hook not running"

1. Check hook is executable: `ls -l .claude/hooks/`
2. Verify `.claude/settings.json` references it
3. Restart Claude Code

---

## Next Steps

- Read [Product OS](PRODUCT_OS.md) for full workflow
- Review [Security Policy](SECURITY.md)
- Check [CI/CD Pipeline](CI_CD.md)
