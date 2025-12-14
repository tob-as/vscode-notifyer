# First Deploy Guide

Step-by-step guide to deploy your first Cloudflare Worker.

## Prerequisites

- [ ] GitHub repository created (via `/create` command)
- [ ] Cloudflare account access
- [ ] `wrangler` CLI installed (`npm install -g wrangler`)
- [ ] `gh` CLI installed and authenticated

## Step 1: Authenticate with Cloudflare

```bash
wrangler login
```

This opens a browser for OAuth authentication.

Verify:
```bash
wrangler whoami
```

## Step 2: Configure wrangler.toml

Your `wrangler.toml` should look like:

```toml
name = "your-app-prod"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.dev]
name = "your-app-dev"

[env.staging]
name = "your-app-staging"
```

## Step 3: Set Up D1 Database (if needed)

### Create Database

```bash
# Create for each environment
wrangler d1 create your-app-db-dev
wrangler d1 create your-app-db-staging
wrangler d1 create your-app-db-prod
```

### Add to wrangler.toml

```toml
[[d1_databases]]
binding = "DB"
database_name = "your-app-db-prod"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[env.dev]
[[env.dev.d1_databases]]
binding = "DB"
database_name = "your-app-db-dev"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Run Migrations

```bash
wrangler d1 execute your-app-db-dev --file=migrations/0001_init.sql
```

## Step 4: Set Up GitHub Secrets

Required secrets for CI/CD:

```bash
# Get your API token from Cloudflare Dashboard
# Account → API Tokens → Create Token → Edit Cloudflare Workers

gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
```

For Access policies:
```bash
gh secret set CLOUDFLARE_ACCESS_TOKEN
```

## Step 5: Test Locally

```bash
npm install
npx wrangler dev
```

Visit http://localhost:8787

## Step 6: Manual First Deploy

Before enabling CI/CD, do a manual deploy:

```bash
# Deploy to dev
npx wrangler deploy --env dev

# Test dev
curl https://your-app-dev.your-subdomain.workers.dev/health

# If good, deploy to production
npx wrangler deploy
```

## Step 7: Set Up Cloudflare Access

### Create Access Application

Via Terraform (recommended):
```bash
cd infra/cloudflare-access
terraform init
terraform apply
```

Or via Dashboard:
1. Zero Trust → Access → Applications
2. Add Application → Self-Hosted
3. Configure domain and policies

### Verify Access

1. Visit your app URL
2. Should redirect to Cloudflare Access login
3. Authenticate with your IdP
4. Should reach your app

## Step 8: Enable CI/CD

Push to trigger GitHub Actions:

```bash
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

Watch the Actions tab for deployment status.

## Step 9: Verify Deployment

### Check Worker Status

```bash
wrangler tail
```

### Test Endpoints

```bash
# Health check
curl https://your-app.original-body.dev/health

# With auth (if Access is enabled)
# Use browser or get JWT from Access
```

## Troubleshooting

### "Authentication error"

```bash
wrangler logout
wrangler login
```

### "Worker not found"

Check `wrangler.toml` has correct name matching your account.

### "D1 database not found"

Verify database ID in `wrangler.toml` matches what was created.

### GitHub Actions failing

1. Check secrets are set correctly
2. Check workflow file syntax
3. Check Cloudflare API token has correct permissions

## Environment URLs

After deployment:

| Environment | URL |
|-------------|-----|
| Development | `your-app-dev.your-subdomain.workers.dev` |
| Staging | `your-app-staging.your-subdomain.workers.dev` |
| Production | `your-app.original-body.dev` |

## Next Steps

- [ ] Set up custom domain (if needed)
- [ ] Configure monitoring/alerts
- [ ] Add more team members to Access
- [ ] Set up staging environment
