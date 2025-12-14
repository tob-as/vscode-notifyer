# Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/).

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (Required)

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no feature/fix |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD changes |
| `build` | Build system changes |

### Scope (Optional)

The area of the codebase affected:
- `api`
- `ui`
- `db`
- `auth`
- `ci`
- etc.

### Subject (Required)

- Imperative mood: "add" not "added" or "adds"
- No capitalization
- No period at end
- Max 50 characters

### Body (Optional)

- Explain what and why
- Wrap at 72 characters
- Separate from subject with blank line

### Footer (Optional)

- Reference issues: `Fixes #123`
- Breaking changes: `BREAKING CHANGE: description`
- Co-authors: `Co-Authored-By: Name <email>`

---

## Examples

### Simple

```
feat: add user authentication
```

### With Scope

```
fix(api): handle null response from external service
```

### With Body

```
refactor(db): optimize query performance

Replaced N+1 queries with eager loading.
Reduces API response time by 40%.
```

### Breaking Change

```
feat(api)!: change authentication endpoint

BREAKING CHANGE: /auth/login now returns JWT instead of session cookie.
Migration guide in docs/migration-v2.md.
```

### With Issue Reference

```
fix: prevent duplicate form submission

Debounce submit button to prevent double-clicks.

Fixes #456
```

---

## Commit Message Checklist

- [ ] Type is correct
- [ ] Subject is imperative mood
- [ ] Subject under 50 characters
- [ ] Body explains why (if needed)
- [ ] Issues referenced
- [ ] Breaking changes noted

---

## Tools

### Commitlint

Validates commit messages:

```json
{
  "extends": ["@commitlint/config-conventional"]
}
```

### Commitizen

Interactive commit helper:

```bash
npx cz
```

---

## Tips

1. **One logical change per commit**
   - Don't mix refactoring with features
   - Don't mix formatting with fixes

2. **Write for the reviewer**
   - Clear subject tells them what
   - Body tells them why

3. **Reference context**
   - Link to issues
   - Link to discussions
   - Link to documentation

4. **Think about the changelog**
   - `feat` and `fix` appear in changelog
   - Make subjects user-facing when possible
