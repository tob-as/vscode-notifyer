# /breakdown - PRD to User Stories

Break down a PRD into sprint-sized user stories following INVEST criteria.

## Usage

```
/breakdown [prd-file or issue number]
/breakdown --auto [prd-file]   # Auto-chain to /sprint-plan
```

## Orchestration

When `--auto` flag is provided (or inherited from `/intake --auto`):
1. Create user stories
2. Create GitHub Issues for each story
3. **Automatically invoke `/sprint-plan`** with the created stories

The `--auto` flag propagates through the chain.

## INVEST Criteria

Each story must be:
- **I**ndependent: Can be developed separately
- **N**egotiable: Details can be discussed
- **V**aluable: Delivers user/business value
- **E**stimable: Team can estimate effort
- **S**mall: Fits in a sprint
- **T**estable: Has clear acceptance criteria

## Process

### Step 1: Read PRD

Read the specified PRD file or fetch the GitHub Issue.

### Step 2: Identify Story Candidates

Break the feature into:
- Core functionality (MVP)
- Enhancements (post-MVP)
- Technical enablers (if needed)

Target: 5-15 stories per epic.

### Step 3: Write Stories

For each story, create:

```markdown
## Story: [Short Title]

**As a** [user type]
**I want** [goal]
**So that** [benefit]

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### Test Strategy
- [How to verify]

### Release Impact
- [ ] patch / [ ] minor / [ ] major

### Dependencies
- [Related stories or blockers]
```

### Step 4: Output

Display all stories as GitHub Issue drafts:

```
---
Story 1 of N: [Title]
Labels: type:feature
Parent: #[epic-number]
---
[Story content]
```

## Prioritization Hints

Include RICE score components for each story:
- **R**each: How many users affected?
- **I**mpact: How much value per user?
- **C**onfidence: How certain are estimates?
- **E**ffort: How much work?

## Output

1. List of story drafts (5-15)
2. Suggested priority order
3. Dependencies diagram (if complex)

## Do Not

- Create stories that can't be completed in one sprint
- Skip acceptance criteria
- Assign to individuals
- Include implementation details beyond acceptance criteria
