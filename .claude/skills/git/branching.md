# Git Branching Patterns

## Branch Naming Convention

Use `type/short-description` format:

| Type | Purpose | Example |
|------|---------|---------|
| `feature/` | New functionality | `feature/user-auth` |
| `fix/` | Bug fixes | `fix/login-redirect` |
| `chore/` | Maintenance tasks | `chore/update-deps` |
| `docs/` | Documentation | `docs/api-reference` |
| `refactor/` | Code improvements | `refactor/simplify-payment` |

## Branch Rules

- Always branch from `main` (or `develop` if using gitflow)
- Keep branch names lowercase with hyphens
- Delete branches after merging
- Never commit directly to `main`

## Environment Branches (Cloudflare)

| Branch | Environment | Auto-Deploy |
|--------|-------------|-------------|
| `develop` | dev | Yes |
| `staging` | staging | Yes |
| `main` | prod | Yes |

## Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature main

# Work on feature
git add .
git commit -m "feat: add feature"

# Push and create PR
git push -u origin feature/my-feature
gh pr create
```
