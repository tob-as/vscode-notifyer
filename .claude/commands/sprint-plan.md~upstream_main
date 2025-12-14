# /sprint-plan - Sprint Planning

Select and commit to stories for the upcoming sprint.

## Usage

```
/sprint-plan [capacity]
/sprint-plan --auto [capacity]   # Auto-chain to /release after sprint
```

Where capacity is optional team availability (e.g., "3 devs, 2 weeks").

## Orchestration

When `--auto` flag is provided (or inherited from chain):
1. Create sprint plan
2. Execute the sprint (implement stories)
3. When sprint is complete, **automatically invoke `/release`**
4. Then chain to `/retro`

**Sprint Completion Detection:** The agent monitors story completion. When all committed stories are done (or sprint time ends), it triggers the next phase.

## Process

### Step 1: Review Backlog

Fetch open issues with `type:feature` or `type:bug` labels.
Sort by:
1. Priority labels
2. Dependencies (blockers first)
3. Age (older issues considered)

### Step 2: Capacity Check

If capacity provided, estimate how many stories fit.
Default assumption: 3-5 stories per sprint per developer.

### Step 3: Propose Sprint

Output sprint proposal:

```markdown
## Sprint [N] Proposal

### Sprint Goal
[One sentence describing the sprint's focus]

### Committed Stories

| # | Story | Type | Impact | Risk |
|---|-------|------|--------|------|
| 1 | [Title] | feature | minor | low |
| 2 | [Title] | bug | patch | medium |

### Stretch Goals
- [Story that could be pulled in if time allows]

### Blocked / Waiting
- [Stories not ready for this sprint]

### Dependencies
- Story 3 depends on Story 1
- External: [Any external dependencies]
```

### Step 4: Confirm

Ask user to confirm or adjust the sprint selection.

## WIP Limits

Recommend WIP limits:
- In Progress: max 2 per developer
- In Review: max 3 total

## Output

1. Sprint proposal with committed stories
2. Sprint goal statement
3. Risk assessment

## Do Not

- Over-commit (leave buffer for unknowns)
- Include stories with unresolved blockers
- Skip the sprint goal
- Assign specific developers (that's their choice)
