# /update - Sync with Upstream

Sync this project with the latest tob-claude-internal improvements.

## Usage

```
/update
```

No arguments needed. Detects upstream automatically.

## When to Use

- After tob-claude-internal receives new skills, agents, or standards
- When you want the latest CI/CD workflows
- Periodically to stay current with team conventions

## Execution Steps

### Step 1: Verify Upstream Remote

```bash
git remote get-url upstream
```

If upstream is not set:
```
No upstream remote configured.

This project was likely created before /create v2.
Add upstream manually:
  git remote add upstream https://github.com/the-original-body/tob-claude-internal.git

Then run /update again.
```
And stop.

### Step 2: Fetch Upstream Changes

```bash
git fetch upstream
```

### Step 3: Check Current Branch

```bash
git branch --show-current
```

If on `main`:
```
⚠️  You're on main branch. Creating sync branch for safety.
```

### Step 4: Create Sync Branch

```bash
git checkout -b chore/sync-upstream-$(date +%Y%m%d)
```

### Step 5: Attempt Merge

```bash
git merge upstream/main --no-commit --no-ff
```

### Step 6: Handle Conflicts

Check for conflicts:
```bash
git diff --name-only --diff-filter=U
```

**Conflict Resolution Playbook:**

| Path Pattern | Resolution | Reason |
|--------------|------------|--------|
| `.claude/**` | upstream wins | Team standards |
| `docs/**` | upstream wins | Shared documentation |
| `CLAUDE.md` (Team Standards section) | upstream wins | Team imports |
| `CLAUDE.md` (Project-Specific section) | local wins | Your customizations |
| `CLAUDE.md` (Project Overrides section) | local wins | Your overrides |
| `src/**` | local wins | Your application code |
| `prisma/**` | local wins | Your data model |
| `wrangler.toml` | local wins | Your worker config |
| `package.json` | merge manually | Depends on context |

For each conflict:
1. Identify the file
2. Apply the resolution rule above
3. Stage the resolved file

```bash
git checkout --theirs <file>  # upstream wins
git checkout --ours <file>    # local wins
git add <file>
```

### Step 7: Commit Merge

```bash
git commit -m "chore: sync with upstream tob-claude-internal

Merged latest team standards and improvements.

🤖 Generated with Claude Code"
```

### Step 8: Re-run Setup Script

The setup script ensures symlinks are current:

```bash
PROFILE=$(cat .claude/active-profile)
/home/coder/workspace/tob-claude-internal/setup-claude.sh $PROFILE
```

### Step 9: Create PR (Optional)

If changes were pulled:
```bash
gh pr create --title "chore: sync with upstream" --body "$(cat <<'EOF'
## Summary
- Synced with latest tob-claude-internal improvements
- Applied conflict resolution per playbook

## Changes from Upstream
[List key changes from the merge]

🤖 Generated with Claude Code
EOF
)"
```

### Step 10: Output Summary

```
✓ Fetched upstream changes
✓ Created branch: chore/sync-upstream-YYYYMMDD
✓ Merged upstream/main
✓ Resolved [N] conflicts
✓ Re-ran setup script
✓ PR created: [URL]

Review the changes, then merge the PR.
If no conflicts, you can merge immediately.
```

## No Changes Scenario

If upstream has no new changes:
```
✓ Already up to date with upstream.

No changes to sync.
```

## Error Handling

| Error | Resolution |
|-------|------------|
| No upstream remote | Guide user to add it |
| Uncommitted changes | Ask user to commit or stash first |
| Merge conflicts | Apply playbook, explain resolutions |
| Network error | Retry or check connectivity |

## What Gets Updated

| Category | Update Behavior |
|----------|-----------------|
| Skills | Symlinks updated automatically |
| Agents | Symlinks updated automatically |
| Commands | Symlinks updated automatically |
| Workflows | May need manual merge |
| Standards | Imported via CLAUDE.md @references |

## Manual Steps After Update

1. Review the PR changes
2. Test that your app still works
3. Merge the PR
4. Delete the sync branch

## Example Session

```
User: /update

Claude: Fetching upstream changes...
✓ Found 5 new commits in upstream
✓ Created branch: chore/sync-upstream-20241214

Merging...
⚠️  Conflict in .github/workflows/claude-compliance.yml
   → Resolved: taking upstream version (team standards)

✓ Merged successfully
✓ Re-ran setup with 'redwood' profile

PR created: https://github.com/the-original-body/my-app/pull/42

Review and merge when ready.
```
