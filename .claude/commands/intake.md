# /intake - Business Use Case to PRD

Transform a business use case into a structured PRD (Product Requirements Document).

## Usage

```
/intake [use case description]
```

## Process

### Step 1: Gather Context

Ask clarifying questions:
- Who is the target user?
- What problem does this solve?
- What does success look like?
- Are there constraints (time, tech, scope)?

### Step 2: Create PRD

Create `docs/prd/<slug>.md` with:

```markdown
# [Feature Name]

## Problem Statement
[What problem are we solving?]

## Target Audience
[Who benefits from this?]

## Goals
- Primary: [Main objective]
- Secondary: [Nice-to-haves]

## Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]

## Scope

### In Scope
- [Feature A]
- [Feature B]

### Out of Scope
- [Explicitly excluded]

## Risks
| Risk | Mitigation |
|------|------------|
| [Risk 1] | [How to address] |

## Open Questions
- [Unresolved decision 1]

## Timeline
[No specific dates - phases only]
- Phase 1: Core functionality
- Phase 2: Enhancement
```

### Step 3: Draft GitHub Issue

Output a GitHub Issue draft using the Feature template:

```
Title: [Feature]: [Name]
Labels: type:feature
```

Include all PRD sections formatted for the issue body.

## Output

1. `docs/prd/<slug>.md` file created
2. GitHub Issue draft displayed (user copies to create)
3. Summary of next steps

## Example

```
/intake Users need to track their API usage and see billing estimates
```

Creates:
- `docs/prd/api-usage-tracking.md`
- Draft for Feature issue

## Do Not

- Create implementation details in the PRD
- Assign story points or time estimates
- Create the GitHub Issue automatically (user should review first)
