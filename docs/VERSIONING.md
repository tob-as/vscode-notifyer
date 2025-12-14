# Versioning

We follow [Semantic Versioning 2.0.0](https://semver.org/).

## Version Format

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

---

## When to Bump

### MAJOR (X.0.0)

Bump major when you make incompatible API changes:

- Remove or rename public API
- Change function signatures
- Change database schema (requires migration)
- Change configuration format
- Remove features

**Example**: `1.2.3` → `2.0.0`

### MINOR (0.X.0)

Bump minor when you add functionality in a backwards compatible manner:

- New API endpoints
- New optional parameters
- New features
- New configuration options

**Example**: `1.2.3` → `1.3.0`

### PATCH (0.0.X)

Bump patch when you make backwards compatible bug fixes:

- Bug fixes
- Performance improvements
- Documentation updates
- Dependency updates (non-breaking)

**Example**: `1.2.3` → `1.2.4`

---

## Pre-Release Versions

For work-in-progress releases:

```
1.0.0-alpha.1    # Alpha release
1.0.0-beta.1     # Beta release
1.0.0-rc.1       # Release candidate
```

Pre-release versions have lower precedence than the associated normal version.

---

## Breaking Change Checklist

Before releasing a major version, verify:

- [ ] Breaking changes documented in CHANGELOG
- [ ] Migration guide provided
- [ ] Deprecation warnings in previous minor release
- [ ] All tests passing
- [ ] Team notified

---

## Version in Code

Version is stored in:

- `package.json` (Node.js projects)
- `VERSION` file (alternative)
- Git tags (`v1.2.3`)

All should stay in sync. The `/release` command handles this automatically.

---

## Release Labels

PRs should have one of these labels:

| Label | Bump | Use When |
|-------|------|----------|
| `release:major` | Major | Breaking changes |
| `release:minor` | Minor | New features |
| `release:patch` | Patch | Bug fixes |
| `release:skip` | None | No release needed |

Release Drafter uses these to determine the next version.

---

## FAQ

**Q: What about 0.x.y versions?**
A: During initial development (0.x.y), minor bumps may include breaking changes. Once you hit 1.0.0, follow strict SemVer.

**Q: When should we go to 1.0.0?**
A: When the API is stable and production-ready. Don't rush it, but don't stay at 0.x forever.

**Q: What's a breaking change?**
A: Any change that requires users to modify their code, configuration, or data to continue working.
