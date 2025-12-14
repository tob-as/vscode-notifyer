# [Project Name]

> Brief 2-3 sentence description of what this project does and who uses it.

## Tech Stack

### Backend
- [Framework] [version] - [brief purpose]
- [Database] [version] - [brief purpose]
- [Key dependency] [version] - [brief purpose]

### Frontend
- [Framework] [version] - [brief purpose]
- [Library] [version] - [brief purpose]

### Testing
- [Test framework] - [what it tests]

## Project Structure

```
/src/          - [Brief description]
/tests/        - [Brief description]
/docs/         - [Brief description]
/scripts/      - [Brief description]
```

## Key Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Production build
npm test                # Run all tests

# Common tasks
./scripts/[script].sh   # [What it does]
```

## Code Style & Documentation

### Code
- [Language]: [Specific convention, e.g., "Use ES modules (import/export), not CommonJS"]
- [Naming]: [Specific rule, e.g., "PascalCase for components, camelCase for functions"]
- [Pattern]: [Specific preference, e.g., "Prefer functional components with hooks"]
- [Typing]: [Specific requirement, e.g., "Always use type hints in Python"]

### Documentation
- **Function docstrings**: Required for non-trivial functions only (purpose, args, returns)
- **Decision comments**: Only when code isn't self-explanatory - explain "why" not "what"
- **No redundant docs**: If code is clear, skip the comment

## Development Approach

**Our philosophy: Ship fast, iterate later**

- Build MVPs first, enhance after validation
- "Good enough to be useful" over "perfect"
- Keep code minimal and debuggable - prioritize simplicity
- Avoid over-engineering for small team scale (1-3 developers per project)

**Implementation process:**
1. Never implement without explicit instruction
2. Present implementation plan first
3. Wait for feedback and confirmation
4. Then proceed with implementation

## Critical Constraints

**Non-negotiables:**
- [Specific constraint, e.g., "Pure functions only - bytes in, bytes/dict out"]
- [Technical restriction, e.g., "Never use localStorage in artifacts"]
- [Architectural rule, e.g., "Face blur must be LAST step in pipeline"]

## Git Workflow

- Branch naming: `feature/[ticket]-[description]` or `fix/[description]`
- Never commit directly to main
- Run tests before committing

## When to Push Back vs. Comply

**Push back when:**
- Request violates critical constraints above
- Adds features outside defined scope
- Creates technical debt without discussion
- Changes architectural decisions without rationale

**Comply when:**
- Request is clear and scope-aligned
- Follows established patterns
- Respects critical constraints
- Has explicit instruction to proceed

## Communication Style

- **For code questions**: Ask clarifying questions if requirements have gaps
- **For ideas**: Think critically and point out potential problems even without being asked
- **When uncertain**: Never assume or infer - ask for clarification unless it's obvious

---

*Last updated: [Date]*
*Maintained by: [Team/Person]*