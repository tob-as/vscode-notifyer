# Code Lifecycle

## Delete Outdated Code

**Rule:** Delete outdated code, commands, and files. Do not archive to `_legacy/` folders.

**Rationale:**
- Git history preserves everything
- Legacy folders create confusion
- Dead code is maintenance burden
- Clean codebase = faster navigation

## When to Delete

Delete without hesitation:
- Deprecated commands (superseded by new workflow)
- Unused agents
- Old templates replaced by new ones
- Dead code paths
- Unused dependencies

## How to Delete

1. Verify the item is truly unused (grep for references)
2. Delete the file(s)
3. Update any documentation that referenced it
4. Commit with clear message: `chore: remove deprecated X`

## Recovery

If something was deleted that's needed later:
```bash
# Find the commit that deleted the file
git log --diff-filter=D --summary | grep <filename>

# Restore from history
git checkout <commit>^ -- <filepath>
```

## Do Not

- Create `_legacy/`, `_old/`, `_backup/` folders
- Comment out large blocks "just in case"
- Keep unused imports or variables
- Maintain backwards compatibility shims for internal tools
