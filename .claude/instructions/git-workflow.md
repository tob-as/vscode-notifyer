# Git Workflow

## Branches

Use `feature/[description]` for all work. Keep descriptions short and lowercase with hyphens.

```
feature/user-auth
feature/export-csv
feature/fix-login-bug
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

## Before Committing

Run these checks—all must pass:

```bash
uv run ruff check .          # Lint
uv run ruff format --check . # Format check
uv run mypy .                # Type check
uv run pytest                # Tests
```

Or fix and format automatically:

```bash
uv run ruff check --fix .    # Lint + autofix
uv run ruff format .         # Format
```

## Rules

- Commit after completing a logical unit of work
- Never commit broken code
- Push only when explicitly asked
- Never push directly to `main`
