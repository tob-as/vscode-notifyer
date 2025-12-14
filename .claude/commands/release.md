# /release - Create Release

Create a new version release with changelog and git tag.

## Usage

```
/release [major|minor|patch]
```

Or without argument to auto-detect from PR labels.

## Process

### Step 1: Determine Version

1. Read current version from `package.json` or `VERSION` file
2. If type specified, bump accordingly
3. If not specified, analyze merged PRs since last release:
   - Any `release:major` → major bump
   - Any `release:minor` → minor bump
   - Otherwise → patch bump

### Step 2: Generate Changelog

Collect all PRs merged since last tag:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Features
- [PR title] (#123)

### Bug Fixes
- [PR title] (#124)

### Security
- [PR title] (#125)

### Maintenance
- [PR title] (#126)
```

Categorize by `type:*` labels.

### Step 3: Update Files

1. Update version in `package.json` (if exists)
2. Prepend to `CHANGELOG.md` (create if needed)

### Step 4: Create Tag

```bash
git add -A
git commit -m "chore: release vX.Y.Z"
git tag -a vX.Y.Z -m "Release vX.Y.Z"
```

### Step 5: Output

Display:
- New version number
- Changelog entry
- Git commands to push (don't auto-push)

```
Release vX.Y.Z prepared.

To publish:
  git push origin main
  git push origin vX.Y.Z
```

## SemVer Rules

| Change Type | Bump | Example |
|-------------|------|---------|
| Breaking API change | major | 1.0.0 → 2.0.0 |
| New feature (backwards compatible) | minor | 1.0.0 → 1.1.0 |
| Bug fix | patch | 1.0.0 → 1.0.1 |

## Do Not

- Auto-push to remote (user should review first)
- Skip changelog generation
- Release with uncommitted changes
- Release without all checks passing
