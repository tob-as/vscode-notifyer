# Future Considerations

Items researched in Wave 8 but not implemented. These may be added in future waves based on need.

---

## AI Code Reviews (GitHub Copilot)

### What It Is

GitHub Copilot for Pull Requests can automatically review code and suggest improvements. It's a premium feature that:
- Scans PR diffs for potential bugs
- Suggests simplifications and best practices
- Can detect missing error handling
- Provides inline suggestions

### Why Not Now

- Premium feature requiring GitHub Copilot subscription
- Consumes Copilot token quota
- Early feedback shows hit-or-miss quality with false positives
- Our existing tools (ESLint, TypeScript strict, tests) catch most issues

### When to Consider

- If PRs consistently have issues that other tools miss
- If team grows and needs more review bandwidth
- If Copilot accuracy improves in future updates

### References

- [GitHub Copilot Code Review](https://docs.github.com/en/copilot/using-github-copilot/code-review)

---

## OSV Scanner

### What It Is

Google's Open Source Vulnerability Scanner. Multi-ecosystem vulnerability detection:
- Scans package-lock.json, go.mod, requirements.txt, etc.
- Uses OSV database (aggregates multiple sources)
- Can generate SBOM (Software Bill of Materials)
- GitHub Action available

### Why Not Now

- Our stack is primarily Node.js
- npm audit + Dependabot already cover Node.js well
- OSV adds value mainly for polyglot projects
- Extra CI time for marginal benefit

### When to Consider

- If we add Go, Python, or Rust services
- If we need SBOM generation for compliance
- If we want vulnerability scanning in containers

### References

- [OSV Scanner](https://github.com/google/osv-scanner)
- [OSV Database](https://osv.dev/)

---

## Storybook

### What It Is

Visual component documentation and testing tool:
- Interactive component playground
- Visual regression testing with Chromatic
- Document component APIs and variants
- Design system documentation

### Why Not Now

- Requires setup and maintenance
- Our component library is small
- Manual testing in app suffices for now
- Adds build complexity

### When to Consider

- When we have a shared component library
- When onboarding new developers frequently
- When design team needs component documentation
- When visual regression testing becomes necessary

### References

- [RedwoodSDK Storybook Guide](https://docs.rwsdk.com/how-to/use-storybook/)
- [Storybook](https://storybook.js.org/)

---

## Snyk

### What It Is

Commercial SCA (Software Composition Analysis) tool:
- Larger vulnerability database than npm audit
- Private research team finds vulnerabilities earlier
- License compliance checking
- Container and IaC scanning
- IDE integration

### Why Not Now

- Requires external account
- Free tier has limitations
- npm audit + Dependabot sufficient for current scale
- Cost for full features

### When to Consider

- If we need license compliance auditing
- If we experience vulnerability gaps with npm audit
- If we expand to containers needing image scanning
- Enterprise requirements

### References

- [Snyk](https://snyk.io/)

---

## GitHub Projects Automation

### What It Is

Advanced GitHub Projects features:
- Iteration planning (sprints)
- Velocity tracking
- Automated status updates
- Custom fields and views

### Why Not Now

- Wave 8 focused on CI/CD and quality
- GitHub Projects API requires additional setup
- Current Issue-based workflow works

### When to Consider

- Wave 9+ when sprint automation matures
- When team needs velocity metrics
- When automated sprint reports are needed

---

## Reviewing This Document

Check this document quarterly to evaluate if any items should move to active development based on:
- Team size changes
- Project complexity growth
- New compliance requirements
- Tool maturity improvements
