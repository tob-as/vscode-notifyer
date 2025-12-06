# Git Workflow

## Branches

Use `type/description` format. Keep descriptions short, lowercase, with hyphens.

```
feature/user-auth
fix/login-redirect
chore/update-deps
docs/api-reference
```

## Commits

Format: `type: description`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

```
feat: add user authentication
fix: resolve login redirect loop
refactor: simplify payment processing
```

Keep messages short. No AI attribution.

## Rules

- Commit after completing a logical unit of work
- Never commit broken code
- Push only when explicitly asked
- Never push directly to `main`
