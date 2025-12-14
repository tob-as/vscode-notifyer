# Secrets Management

How to handle secrets across local development, CI/CD, and production.

## The Four Layers

| Layer | Secret Storage | Access Method |
|-------|----------------|---------------|
| Developer Global | `~/.tob/env-setup.sh` | `CLAUDE_ENV_FILE` (Claude Code sessions) |
| Local Dev | `.dev.vars` file | `wrangler dev` reads automatically |
| CI/CD | GitHub Secrets | Injected as environment variables |
| Production | Cloudflare Secrets | `wrangler secret put` |

---

## Developer Global Secrets (NEW)

### Purpose

Personal credentials that persist across ALL Claude Code sessions and projects.

### Setup

1. Create `~/.tob/env-setup.sh`:
   ```bash
   #!/bin/bash
   # TOB Global Secrets (lokal, NICHT committen)

   export CLOUDFLARE_ACCOUNT_ID="your-account-id"
   export CLOUDFLARE_API_TOKEN="your-api-token"
   export RESEND_API_KEY="re_xxxxx"
   ```

2. Make executable:
   ```bash
   chmod +x ~/.tob/env-setup.sh
   ```

3. Add to shell config (`~/.bashrc` or `~/.zshrc`):
   ```bash
   export CLAUDE_ENV_FILE=~/.tob/env-setup.sh
   ```

4. Reload terminal:
   ```bash
   source ~/.bashrc
   ```

### Benefits

- Secrets available in EVERY Claude Code session
- No repeated "paste your API key" prompts
- Centralized credential management
- Never committed to any repo

### Getting Credentials

See [ONBOARDING.md](ONBOARDING.md) for how to obtain:
- Cloudflare API Token
- Resend API Key
- Other service credentials

---

## Local Development

### .dev.vars File

Create `.dev.vars` in your project root (git-ignored):

```bash
# .dev.vars
DATABASE_URL=d1://local
API_KEY=dev-key-12345
EXTERNAL_SERVICE_TOKEN=test-token
```

Wrangler automatically loads this file during `wrangler dev`.

### Template File

Commit a template for team reference:

```bash
# .dev.vars.example
DATABASE_URL=d1://local
API_KEY=your-api-key-here
EXTERNAL_SERVICE_TOKEN=get-from-1password
```

### Getting Secrets Locally

1. Check `.dev.vars.example` for required variables
2. Get values from 1Password or team lead
3. Copy to `.dev.vars` and fill in values

## CI/CD (GitHub Actions)

### Setting Secrets

```bash
# Via GitHub CLI
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
gh secret set API_KEY

# Or via GitHub UI: Settings → Secrets and variables → Actions
```

### Using in Workflows

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    steps:
      - name: Deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        run: npx wrangler deploy
```

### Required CI Secrets

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | Deploy workers |
| `CLOUDFLARE_ACCOUNT_ID` | Account identifier |
| `CF_ACCESS_CLIENT_ID` | E2E tests on Access-protected apps |
| `CF_ACCESS_CLIENT_SECRET` | E2E tests on Access-protected apps |

### Creating CF Access Service Token

For E2E tests to bypass Cloudflare Access authentication:

1. Go to [Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate: Access → Service Auth → Service Tokens
3. Click "Create Service Token"
4. Name it (e.g., "CI E2E Tests")
5. Copy **Client ID** and **Client Secret** immediately (secret shown only once)
6. Add to GitHub Secrets:
   ```bash
   gh secret set CF_ACCESS_CLIENT_ID
   gh secret set CF_ACCESS_CLIENT_SECRET
   ```

**Usage in E2E tests:**

Tests send these headers to bypass Access:
```typescript
extraHTTPHeaders: {
  'CF-Access-Client-Id': process.env.CF_ACCESS_CLIENT_ID,
  'CF-Access-Client-Secret': process.env.CF_ACCESS_CLIENT_SECRET,
}
```

## Production Secrets

### Setting via Wrangler

```bash
# Set a secret
wrangler secret put API_KEY
# Enter value when prompted

# Set for specific environment
wrangler secret put API_KEY --env production

# List secrets (names only, not values)
wrangler secret list
```

### Setting via Dashboard

1. Cloudflare Dashboard → Workers & Pages
2. Select your worker
3. Settings → Variables → Secrets
4. Add variable

### Accessing in Worker

```typescript
export interface Env {
  API_KEY: string;
  DATABASE_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Secrets available via env object
    const apiKey = env.API_KEY;
    // ...
  }
};
```

## Secret Rotation

### Steps

1. Generate new secret value
2. Set new secret in production: `wrangler secret put SECRET_NAME`
3. Deploy worker (no code change needed)
4. Verify functionality
5. Revoke old secret in external service

### Zero-Downtime Rotation

For secrets shared with external services:
1. Add new secret as `SECRET_NAME_NEW`
2. Update code to try both
3. Deploy
4. Update external service
5. Remove old secret

## Do Not

- Commit `.dev.vars` (add to `.gitignore`)
- Log secret values
- Pass secrets via URL parameters
- Store secrets in wrangler.toml
- Use the same secrets across environments

## Checklist for New Projects

1. [ ] Copy `.dev.vars.example` to `.dev.vars`
2. [ ] Fill in local development values
3. [ ] Set GitHub secrets for CI/CD
4. [ ] Set production secrets via wrangler
5. [ ] Verify secrets work in each environment
