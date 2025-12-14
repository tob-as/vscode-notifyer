# GitHub Labels System

## Label Axes

Labels are organized into orthogonal axes. Each Issue/PR should have exactly one **type** label.

---

## Type Labels (Required - exactly one per Issue/PR)

| Label | Color | Description |
|-------|-------|-------------|
| `type:feature` | `#1D76DB` | New functionality |
| `type:bug` | `#D73A4A` | Something isn't working |
| `type:chore` | `#FEF2C0` | Maintenance, refactoring |
| `type:security` | `#B60205` | Security-related changes |
| `type:docs` | `#0075CA` | Documentation only |
| `type:meta` | `#7057FF` | Process/tooling improvements |

---

## Area Labels (Optional)

| Label | Color | Description |
|-------|-------|-------------|
| `area:redwood-ui` | `#C5DEF5` | React/Redwood frontend |
| `area:workers-api` | `#C5DEF5` | Cloudflare Workers backend |
| `area:d1` | `#C5DEF5` | D1 Database |
| `area:r2` | `#C5DEF5` | R2 Object Storage |
| `area:kv` | `#C5DEF5` | KV Storage |
| `area:access-zero-trust` | `#C5DEF5` | Cloudflare Access/Zero Trust |
| `area:ci-cd` | `#C5DEF5` | CI/CD Pipelines |

---

## Release Labels (For PRs)

| Label | Color | Description | Version Bump |
|-------|-------|-------------|--------------|
| `release:major` | `#B60205` | Breaking changes | X.0.0 |
| `release:minor` | `#FBCA04` | New features | 0.X.0 |
| `release:patch` | `#0E8A16` | Bug fixes | 0.0.X |
| `release:skip` | `#EEEEEE` | No release needed | - |

---

## Priority Labels (Optional)

| Label | Color | Description |
|-------|-------|-------------|
| `priority:critical` | `#B60205` | Must fix immediately |
| `priority:high` | `#D93F0B` | Important, do soon |
| `priority:medium` | `#FBCA04` | Normal priority |
| `priority:low` | `#0E8A16` | Nice to have |

---

## Status Labels (Optional)

| Label | Color | Description |
|-------|-------|-------------|
| `status:blocked` | `#D73A4A` | Waiting on external dependency |
| `status:needs-review` | `#FBCA04` | Ready for review |
| `status:in-progress` | `#0E8A16` | Currently being worked on |
| `status:needs-info` | `#D876E3` | More information needed |

---

## Special Labels

| Label | Color | Description |
|-------|-------|-------------|
| `security-review-approved` | `#0E8A16` | Security review passed |
| `breaking-change` | `#B60205` | Contains breaking changes |
| `good-first-issue` | `#7057FF` | Good for newcomers |

---

## Usage Guidelines

### For Issues

1. Always add exactly one `type:*` label
2. Add relevant `area:*` labels if applicable
3. Add `priority:*` for triaging

### For PRs

1. Always add exactly one `type:*` label
2. Always add exactly one `release:*` label
3. Add `breaking-change` if applicable

### Release Drafter Integration

Release Drafter uses these labels to automatically categorize changes:
- `type:feature` → "Features"
- `type:bug` → "Bug Fixes"
- `type:security` → "Security"
- `type:chore`, `type:docs` → "Maintenance"

Version is determined by `release:*` labels.

---

## Creating Labels

Labels should be created in GitHub under Settings → Labels. Use the hex colors specified above for consistency.

For automation, labels can be created via GitHub CLI:

```bash
gh label create "type:feature" --color "1D76DB" --description "New functionality"
gh label create "type:bug" --color "D73A4A" --description "Something isn't working"
# ... etc
```
