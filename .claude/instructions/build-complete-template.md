# Build Complete Output Template

When a build, setup, or deployment completes, ALWAYS use this standardized output structure.

## Standard Template

```
✓ [Action] Complete

BLOCKERS (if any):
- [ ] Missing: RESEND_API_KEY (see docs/ONBOARDING.md)
- [ ] Missing: Access Policy (run: cd infra/cloudflare-access && terraform apply)
- [ ] Missing: GitHub Secrets (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)

LOCAL DEVELOPMENT:
npm run dev          # Start local server (http://localhost:5173)
npm test             # Run tests
npm run lint         # Check code quality
npm run typecheck    # TypeScript validation

DEPLOYMENT:
✗ DO NOT RUN: wrangler deploy (blocked - CI-only)
✓ Deployment via CI:
  1. git push
  2. Create PR: gh pr create
  3. Merge to main (after approval)
  4. GitHub Actions deploys automatically

  See: .github/workflows/deploy.yml

SMOKE TEST:
- [ ] Visit http://localhost:5173
- [ ] Check /health endpoint returns 200
- [ ] Verify Cloudflare Access login
- [ ] Test core user flow
```

---

## Rules

### 1. BLOCKERS FIRST

If ANY of these are missing, show BLOCKERS section at the top:
- Required environment variables
- Cloudflare Access Policy
- GitHub Secrets
- Database migrations
- External service configuration

**Never say "Build Complete" if critical dependencies are missing.**

### 2. NEVER Suggest Local Deploy

**Forbidden phrases:**
- "Run: wrangler deploy"
- "Deploy with: wrangler publish"
- "Next: deploy to Cloudflare"

**Instead:**
- "Deployment via CI (see .github/workflows/deploy.yml)"
- "Merge to main triggers automatic deployment"

### 3. ALWAYS Reference CI

Every deployment instruction must:
- Point to the GitHub Actions workflow
- Explain the PR → Merge → Auto-deploy flow
- Mention required approvals if any

### 4. INCLUDE Smoke Test

Provide a minimal checklist to verify the app works:
- Visit URL
- Check health endpoint
- Verify auth
- Test one core flow

### 5. NO Manual Secrets/Accounts

**Bad:**
```
Next steps:
1. Create Resend account
2. Get API key
3. Add to wrangler.toml
```

**Good:**
```
BLOCKERS:
- [ ] Missing: RESEND_API_KEY

Setup: See docs/ONBOARDING.md
```

---

## Examples

### Example 1: Successful Build (No Blockers)

```
✓ Worker Build Complete

LOCAL DEVELOPMENT:
npm run dev          # http://localhost:8787
npm test
npm run lint

DEPLOYMENT:
✗ DO NOT RUN: wrangler deploy (CI-only)
✓ Merge to main → Auto-deploys to production

SMOKE TEST:
- [ ] curl http://localhost:8787/health
- [ ] Check logs: wrangler tail
```

### Example 2: Build with Blockers

```
✓ Worker Scaffold Created

BLOCKERS:
- [ ] Missing: RESEND_API_KEY
  Setup: docs/ONBOARDING.md

- [ ] Missing: Cloudflare Access Policy
  Run: cd infra/cloudflare-access && terraform init && terraform apply

Cannot run locally until blockers are resolved.

See: docs/ONBOARDING.md for setup instructions.
```

### Example 3: After Deploy (CI)

```
✓ Deployment Complete

PRODUCTION:
https://my-app.your-domain.com

SMOKE TEST:
- [ ] Visit production URL
- [ ] Verify Zero Trust login
- [ ] Check /health endpoint
- [ ] Monitor errors: wrangler tail --env production

ROLLBACK (if needed):
gh pr revert <pr-number>
```

---

## Integration

Add this instruction reference to all agent configurations:

- `worker-scaffold.md`
- `ui-setup.md`
- `prisma-schema.md`
- Any agent that completes a build/setup

Add to agent instructions:
```markdown
@~/workspace/tob-claude-internal/.claude/instructions/build-complete-template.md
```

---

## Detection

Use this template when:
- A build completes (`npm run build` succeeds)
- A scaffold/setup finishes
- A deployment completes (in CI)
- User asks "what now?" or "how do I run this?"

---

## Do Not

- Say "Build Complete" if blockers exist (say "Scaffold Created" instead)
- Suggest wrangler deploy/publish commands
- Provide "Next steps" that require manual credential setup
- Skip the smoke test checklist
- Forget to mention CI workflow for deployment
