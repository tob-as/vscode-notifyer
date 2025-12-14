# Security: Cloudflare Access Protection

## Overview

All internal applications are protected by Cloudflare Zero Trust Access. The CI/CD pipeline **blocks deployment** if an internal app lacks Access protection.

## How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Push to       │────▶│  Security Check  │────▶│    Deploy       │
│   Branch        │     │  (GitHub Action) │     │    Worker       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │ Check Cloudflare │
                        │ Access API       │
                        └──────────────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
              [Protected]           [Not Protected]
                    │                     │
                    ▼                     ▼
              ✅ Continue            ❌ Block Deploy
```

## App Configuration

Each repository can define its visibility in `.github/app-config.yml`:

```yaml
# .github/app-config.yml
visibility: internal  # Options: internal, public
```

| Visibility | Access Required | Use Case |
|------------|-----------------|----------|
| `internal` | Yes | Employee-only tools, admin panels |
| `public` | No | Public-facing apps, marketing sites |

**Default:** If no config file exists, apps are treated as `internal` (secure by default).

## Security Check Process

The `security-check` job in `.github/workflows/deploy-cloudflare.yml`:

1. **Reads app config** - Determines if app is internal or public
2. **Queries Cloudflare API** - Checks if Access Application exists for the worker domain
3. **Enforces policy** - Blocks deployment if internal app lacks protection

## Adding Access Protection

### 1. Terraform Configuration

Access policies are managed in `infra/cloudflare-access/main.tf`. Update the developer emails and domain as needed.

### 2. Deploy Access Policy

The Terraform runs automatically via `.github/workflows/deploy-cloudflare-access.yml` on push to `develop`, `staging`, or `main`.

## Environment-Specific Access

| Environment | Branch | Default Access Policy |
|-------------|--------|----------------------|
| Dev | `develop` | Specific developers only |
| Staging | `staging` | All organization users |
| Production | `main` | All organization users |

## Required Secrets

Add these to your GitHub repository secrets:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Worker deployment permissions |
| `CLOUDFLARE_ACCESS_TOKEN` | Zero Trust API access |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |

## Secrets Management

### GitHub Secrets
For CI/CD workflows - add via GitHub Settings > Secrets

### App Secrets (Wrangler)
```bash
# Set a secret for the worker
wrangler secret put API_KEY --env dev

# Access in worker code
const apiKey = env.API_KEY;
```

### Rules
- Never commit secrets to code
- Use wrangler secret or GitHub Secrets
- Rotate secrets regularly

## Security Guarantees

1. **No internal app deploys without Access** - CI blocks the deployment
2. **Secure by default** - Missing config = internal
3. **Audit trail** - All checks logged in GitHub Actions
4. **Terraform-managed** - Access policies are version-controlled
