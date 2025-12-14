# Security Policy

## Zero Trust by Default

All internal applications MUST be protected by Cloudflare Access.

### Visibility Levels

| Visibility | Access Requirement | Use Case |
|------------|-------------------|----------|
| `internal` | Cloudflare Access required | Team tools, internal apps |
| `public` | No Access required | Public APIs, webhooks |

### Enforcement

1. **CI Gate**: Deployment blocked if internal app lacks Access protection
2. **Visibility Change Audit**: Changing from internal to public requires security review
3. **Terraform Required**: Access policies must be in `infra/cloudflare-access/main.tf`

## Setting Up Access

### 1. Create Terraform Config

```hcl
# infra/cloudflare-access/main.tf
resource "cloudflare_zero_trust_access_application" "app" {
  account_id = var.cloudflare_account_id
  name       = "your-app-prod"
  domain     = "your-app-prod.your-subdomain.workers.dev"
  type       = "self_hosted"

  session_duration = "24h"
}

resource "cloudflare_zero_trust_access_policy" "allow_team" {
  account_id     = var.cloudflare_account_id
  application_id = cloudflare_zero_trust_access_application.app.id
  name           = "Allow Team"
  precedence     = 1
  decision       = "allow"

  include {
    email_domain = ["original-body.dev"]
  }
}
```

### 2. Apply Configuration

```bash
cd infra/cloudflare-access
terraform init
terraform apply
```

### 3. Verify Protection

CI will verify Access protection exists before deployment.

## Changing Visibility

To change an app from internal to public:

1. Update `.github/app-config.yml`:
   ```yaml
   visibility: public
   ```

2. Create PR with `security-review` label

3. Get approval from André or security lead

4. Merge only after approval

## Secrets

- Never commit secrets
- Use `.dev.vars` locally (git-ignored)
- Use GitHub Secrets for CI
- Use `wrangler secret` for production

See [Secrets Management](SECRETS.md) for details.

## Do Not

- Deploy internal apps without Access protection
- Change visibility without security review
- Store secrets in code or config files
- Skip the Zero Trust gate

---

## Automated Security Scanning

### Dependency Audit (npm audit)

CI runs `npm audit` to detect known vulnerabilities in dependencies.

**Policy:**
- Production dependencies: Block on `high` or `critical`
- Development dependencies: Block on `critical` only
- Daily scheduled scan for continuous monitoring

**Setup:**
Copy `.claude/templates/shared/security/npm-audit.yml` to your workflow.

### Dependabot

GitHub Dependabot automatically:
- Scans for vulnerable dependencies
- Opens PRs to update them
- Groups minor/patch updates

**Setup:**
Copy `.claude/templates/shared/security/dependabot.yml` to `.github/dependabot.yml`

### CodeQL

Static analysis for security vulnerabilities and code quality issues.

**Detects:**
- SQL injection
- XSS vulnerabilities
- Insecure API usage
- Code quality issues

**Policy:**
- Runs on PRs to `main` and `staging`
- Weekly scheduled scan
- Results in GitHub Security tab

**Setup:**
Copy `.claude/templates/shared/security/codeql.yml` to `.github/workflows/codeql.yml`

### Handling Alerts

1. **True Positive**: Fix immediately, create bug issue if complex
2. **False Positive**: Dismiss with explanation in GitHub Security tab
3. **Won't Fix**: Document reason, add to security exceptions list

## Scope Lock (Write Allowlist)

Jedes Projekt MUSS eine `.claude/settings.json` mit `permissions.write` haben.

### Warum?

- Verhindert versehentliche Cross-Repo-Schreibzugriffe
- Claude kann nur in explizit erlaubte Pfade schreiben
- CI blockiert Deployment ohne gültige Write-Allowlist

### Erlaubte Pfade

| Projekttyp | Erlaubte Pfade |
|------------|----------------|
| Meta-Repo | .claude/**, docs/**, KEINE src/** |
| Redwood | src/**, public/**, prisma/**, .claude/** |
| Serverless | src/**, .claude/**, wrangler.toml |

### Bei Scope-Verlust

1. STOP - keine weiteren Writes
2. `git status` prüfen
3. Unbeabsichtigte Änderungen mit `git restore` zurücksetzen
4. Session neu starten

### CI Enforcement

- Fail wenn `.claude/settings.json` fehlt
- Fail wenn `permissions.write` fehlt
- Fail wenn `permissions.write` = `**/*` (Wildcard)
