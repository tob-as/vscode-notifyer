# Cloudflare Workers Development

## Overview

Cloudflare Workers are serverless functions running at the edge. They use the Web Standards API and deploy globally in milliseconds.

## Project Structure

```
project/
├── src/
│   └── index.js           # Worker entry point
├── wrangler.toml          # Wrangler configuration
├── .github/
│   ├── app-config.yml     # Security visibility (internal/public)
│   └── workflows/
│       ├── deploy-cloudflare.yml
│       └── deploy-cloudflare-access.yml
├── infra/
│   └── cloudflare-access/
│       ├── main.tf        # Access policies
│       └── variables.tf
└── docs/
    └── SECURITY.md
```

## Wrangler CLI

```bash
# Development
wrangler dev                    # Local development server
wrangler dev --env dev          # With dev environment

# Deployment
wrangler deploy                 # Deploy to prod
wrangler deploy --env dev       # Deploy to dev
wrangler deploy --env staging   # Deploy to staging

# Secrets
wrangler secret put SECRET_NAME --env dev
wrangler secret list --env dev

# Logs
wrangler tail                   # Stream logs
wrangler tail --env dev
```

## Multi-Environment

Three environments: `dev`, `staging`, `prod`

| Branch | Environment | Deployed Name |
|--------|-------------|---------------|
| `develop` | dev | `{worker}-dev` |
| `staging` | staging | `{worker}-staging` |
| `main` | prod | `{worker}-prod` |

wrangler.toml structure:
```toml
name = "my-worker-prod"
main = "src/index.js"

[env.dev]
name = "my-worker-dev"

[env.staging]
name = "my-worker-staging"
```

## Security

### Visibility

Set in `.github/app-config.yml`:
- `internal` - Requires Cloudflare Access (default)
- `public` - No protection required

### CI Security Check

The deploy workflow automatically:
1. Checks if app is internal or public
2. Verifies Cloudflare Access protection exists
3. **Blocks deployment** if internal app lacks protection

### Terraform Access Policies

Access policies in `infra/cloudflare-access/main.tf`:
- Dev: Specific developer emails
- Staging/Prod: Organization domain

## Secrets Management

**GitHub Secrets** (for CI):
- `CLOUDFLARE_API_TOKEN` - Worker deployment
- `CLOUDFLARE_ACCESS_TOKEN` - Zero Trust API
- `CLOUDFLARE_ACCOUNT_ID` - Account ID

**Wrangler Secrets** (for Worker):
```bash
wrangler secret put API_KEY --env dev
```

**Rules:**
- Never commit secrets to code
- Use environment-specific secrets
- Access via `env.SECRET_NAME` in worker

## Environment Badge

CI automatically injects environment badges:
- DEV: Red badge, bottom-left
- STAGING: Orange badge, bottom-left
- PROD: Green badge, bottom-left

Badges are injected into `</body>` tags - not in source code.

## Storage Options

### KV (Key-Value)
- Global, eventually consistent
- Good for: config, cache, sessions
- Limit: 25MB per value

### D1 (SQL)
- SQLite at the edge
- Good for: relational data, queries
- Full SQL support

### R2 (Blob)
- S3-compatible object storage
- Good for: files, media, backups

## Development Workflow

1. `wrangler dev` - Start local dev server
2. Make changes to `src/index.js`
3. Test locally
4. Commit and push to `develop`
5. CI deploys to dev environment
6. Test on dev URL
7. Merge to `staging` for staging deploy
8. Merge to `main` for production deploy

## Do Not

- Do not deploy internal apps without Access protection
- Do not hardcode secrets in code
- Do not ignore the security check in CI
- Do not use `console.log` extensively in production (use sparingly)
- Do not store sensitive data without considering encryption
