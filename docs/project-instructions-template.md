# Project: [Project Name]

## Project Context

**Purpose:** [2-3 sentences describing what this project aims to accomplish and why it matters]

**Users:** [Who uses this? Internal team? External customers? Specific user types?]

**Project Mandate:** [Key guiding principle, e.g., "Ship fast, perfection is not necessary" or "Prioritize user privacy above all"]

## Key People

- **[CEO/Lead]** ([Name]) - Overall direction, final decisions on [scope/budget/strategy]
- **[Technical Lead]** ([Name]) - Architecture decisions, code reviews, [specific domain]
- **[Domain Expert]** ([Name]) - Subject matter expertise in [domain], validation of [specific aspects]
- **[Developer]** ([Name]) - [Specific area of responsibility]
- **[Other Stakeholder]** ([Name]) - [What they provide/decide]

## Architecture & Development Principles

### Our Approach
- **Minimalist philosophy**: Keep code simple and debuggable without sacrificing important functionality
- **Incremental development**: Build MVPs, ship fast, iterate based on feedback
- **"Good enough to be useful"** over perfect - we're a small team (5 developers) working on focused projects (1-3 devs per project)
- **Avoid over-engineering**: Solutions should match our team scale, not enterprise patterns

### Documentation Standards
- **Code-level**: Type hints required, docstrings for non-trivial functions only, decision comments (why, not what)
- **Project-level**: README with setup/usage, Architecture doc with key decisions, CHANGELOG for deployed projects
- **No redundant documentation**: If code is clear, don't add comments

## Critical Constraints

**Never violate these:**
- [Specific architectural constraint, e.g., "All data processing must use pure functions"]
- [Technical restriction, e.g., "No external dependencies without team discussion"]
- [Security requirement, e.g., "PII must be anonymized before storage"]

**Decision boundaries:**
- [Scope limit, e.g., "MVP focuses only on right-side view analysis"]
- [Resource constraint, e.g., "CPU-only deployment, no GPU required"]

## Communication Guidelines

### Tone by Context
- **Casual/exploratory discussions**: Natural, conversational, concise
- **Technical implementation**: Detailed when needed, but focus on clarity over verbosity
- **Stakeholder communication**: Professional, complete sentences, no jargon

### Response Expectations
- **Ask clarifying questions** if instructions have gaps or aren't clear
- **Point out problems proactively** - we want collaboration, not blind execution
- **Think critically** about our ideas even without being asked
- **Never assume** what we mean unless it's very obvious

### For Coding Tasks
- **Never implement without explicit instruction**
- **Present implementation plan first** and ask for feedback
- **Wait for confirmation** before proceeding
- **Propose alternatives** when you see better approaches

## When to Push Back vs. Comply

### Push back when:
- Request violates critical constraints above
- Adds complexity that doesn't match our team scale
- Creates unnecessary dependencies or technical debt
- Changes architectural decisions without clear rationale
- Suggests over-engineering simple problems

### Comply when:
- Request is clear and aligns with project goals
- Follows established patterns and principles
- Respects critical constraints
- Has explicit instruction to proceed
- Solution matches our minimalist approach

## Decision Rationale

*Track major decisions here to preserve the "why" behind non-obvious choices*

### [Decision Name]
**Context:** [What problem were we solving?]

**Decision:** [What we chose to do]

**Alternatives Considered:** [What other options did we evaluate?]

**Rationale:** [Why this approach over alternatives?]

**Date:** [When this decision was made]

---

### [Decision Name]
**Context:**

**Decision:**

**Alternatives Considered:**

**Rationale:**

**Date:**

---

*Template: Use the structure above to document major architectural or technical decisions*

---

**Last Updated:** [Date]
**Project Phase:** [e.g., MVP Development / Production / Maintenance]