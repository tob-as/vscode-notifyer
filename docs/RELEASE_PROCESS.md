# Release Process

## Branch Strategy

### Meta Repository (tob-claude-internal)

Simple feature branch model:

```
feature/* → PR → main
```

- All development on feature branches
- PRs reviewed before merge
- Main branch always deployable

### Project Repositories

Environment-based branches:

```
feature/* → develop → staging → main
```

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `feature/*` | Development work | - |
| `develop` | Integration | Dev environment |
| `staging` | Pre-production testing | Staging environment |
| `main` | Production | Production |

---

## Standard Release

### 1. Prepare

Ensure all work is merged to develop:

```bash
git checkout develop
git pull origin develop
```

Verify:
- All tests passing
- No unmerged PRs for this release
- Changelog entries present

### 2. Create Release

```bash
/release [major|minor|patch]
```

Or let it auto-detect from PR labels.

### 3. Review

Check generated:
- Version bump correct
- Changelog complete
- No missed changes

### 4. Staging

```bash
git checkout staging
git merge develop
git push
```

Test on staging environment.

### 5. Production

```bash
git checkout main
git merge staging
git push
git push --tags
```

### 6. Announce

- Create GitHub Release from tag
- Notify team in Slack

---

## Hotfix Release

For critical production issues:

### 1. Branch from Main

```bash
git checkout main
git pull
git checkout -b hotfix/[issue-description]
```

### 2. Fix

Implement the minimal fix.

### 3. PR to Main

Create PR directly to main with:
- `release:patch` label
- `priority:critical` label

### 4. Merge and Tag

After approval:
```bash
git checkout main
git pull
/release patch
```

### 5. Backport

Cherry-pick to develop and staging:

```bash
git checkout develop
git cherry-pick [commit-hash]
git push

git checkout staging
git cherry-pick [commit-hash]
git push
```

---

## Release Checklist

### Before Release
- [ ] All PRs for release merged
- [ ] Tests passing on all branches
- [ ] Documentation updated
- [ ] Breaking changes documented

### During Release
- [ ] Version bumped correctly
- [ ] Changelog generated
- [ ] Git tag created
- [ ] GitHub Release created

### After Release
- [ ] Deployed to production
- [ ] Smoke tests passed
- [ ] Team notified
- [ ] Customers notified (if applicable)

---

## Rollback

If issues found in production:

### Quick Rollback

Revert to previous tag:

```bash
git checkout main
git revert HEAD
git push
```

### Full Rollback

Deploy previous version:

```bash
git checkout v1.2.2  # Previous good version
# Deploy this version
```

Then investigate and fix forward.

---

## Release Schedule

- **Regular releases**: End of sprint
- **Hotfixes**: As needed
- **Major releases**: Planned with team

Avoid:
- Releasing on Fridays
- Releasing before holidays
- Releasing during incidents
