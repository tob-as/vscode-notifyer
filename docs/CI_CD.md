# CI/CD Pipeline

## Overview

Automated quality gates, testing, and deployment to Cloudflare.

```
PR Created → Quality Gate → Preview Deploy
                  ↓
Merge to main → Quality Gate → Production Deploy → E2E Tests
```

---

## Quality Gate

Every PR must pass before merge:

| Check | Command | Threshold |
|-------|---------|-----------|
| Lint | `npm run lint` | 0 errors |
| Format | `npm run format:check` | All formatted |
| TypeScript | `npm run typecheck` | 0 errors |
| Tests | `npm run test:coverage` | 60% coverage |
| Build | `npm run build` | Success |

**Template:** `.claude/templates/shared/ci/quality-gate.yml`

---

## Deployment Pipeline

### Preview Deployments (PRs)

Every PR gets a preview URL:

1. PR opened/updated
2. Build runs
3. Deploy to `preview` environment
4. Comment with preview URL

**Template:** `.claude/templates/shared/ci/preview-deploy.yml`

### Production Deployment

Triggered on merge to `main`:

1. Wait for quality gate
2. Deploy to production
3. Run E2E tests
4. Notify on failure

**Template:** `.claude/templates/shared/ci/deploy-cloudflare.yml`

---

## Required Secrets

Configure in GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers access |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `CF_ACCESS_CLIENT_ID` | Service token for Access-protected apps |
| `CF_ACCESS_CLIENT_SECRET` | Service token secret |

### Creating Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → My Profile → API Tokens
2. Create Token → "Edit Cloudflare Workers" template
3. Add permissions:
   - Account: Workers Scripts: Edit
   - Account: Workers KV Storage: Edit
   - Account: D1: Edit (if using D1)
   - Zone: Workers Routes: Edit
4. Copy token to GitHub Secrets

### Creating CF Access Service Token

For E2E tests on Access-protected apps:

1. Zero Trust Dashboard → Access → Service Auth → Service Tokens
2. Create Service Token
3. Copy Client ID and Secret to GitHub Secrets

---

## Setup

### 1. Copy Workflow Templates

```bash
mkdir -p .github/workflows

# Quality gate (required)
cp .claude/templates/shared/ci/quality-gate.yml .github/workflows/

# Deployment (choose based on needs)
cp .claude/templates/shared/ci/deploy-cloudflare.yml .github/workflows/deploy.yml
cp .claude/templates/shared/ci/preview-deploy.yml .github/workflows/preview.yml
```

### 2. Add Required Scripts

Ensure `package.json` has:

```json
{
  "scripts": {
    "lint": "eslint src/",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "build": "vite build"
  }
}
```

### 3. Configure Secrets

Add secrets in GitHub repo settings → Secrets and variables → Actions.

---

## Branch Protection

Configure in GitHub repo settings:

1. Settings → Branches → Add rule
2. Branch name: `main`
3. Enable:
   - Require status checks to pass
   - Select: `Quality Gate`
   - Require branches to be up to date
   - Require pull request reviews (optional)

---

## Workflow Customization

### Skip CI

Add to commit message:
```
fix: typo in README [skip ci]
```

### Manual Deploy

Use workflow dispatch:
1. Actions → Deploy → Run workflow
2. Select environment
3. Run

### Environment Variables

Add to workflow:
```yaml
env:
  NODE_ENV: production
  API_URL: ${{ secrets.API_URL }}
```

---

## Monitoring

### GitHub Actions

- Actions tab shows all runs
- Failed runs show logs
- Re-run failed jobs if transient

### Cloudflare Dashboard

- Workers & Pages → your worker
- Logs, Analytics, Errors

---

## Troubleshooting

### "Quality Gate failed"

Check which job failed in Actions → Quality Gate → failed job.

### "Deployment failed"

1. Check Cloudflare API token permissions
2. Verify account ID
3. Check wrangler.toml configuration

### "E2E tests failed after deploy"

1. Check if app is healthy
2. Verify CF Access token for protected apps
3. Check BASE_URL is correct
