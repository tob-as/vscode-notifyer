# /retro - Sprint Retrospective

Facilitate a sprint retrospective and capture action items.

## Usage

```
/retro [sprint-number]
```

## Process

### Step 1: Gather Data

Review the sprint:
- Completed stories (closed issues)
- Incomplete stories (still open)
- PRs merged
- Incidents or blockers encountered

### Step 2: Facilitate Discussion

Prompt for feedback in three categories:

```markdown
## Sprint [N] Retrospective

### What Went Well
- [Positive observation]

### What Could Be Improved
- [Area for improvement]

### Action Items
- [Specific improvement to implement]
```

### Step 3: Capture Metrics

```markdown
### Sprint Metrics

| Metric | Value |
|--------|-------|
| Stories Committed | X |
| Stories Completed | Y |
| Completion Rate | Y/X % |
| Bugs Found | Z |
| Incidents | N |
```

### Step 4: Create Meta Issues

For each action item, draft a GitHub Issue using the Retro Improvement template:

```
Title: [Meta]: [Improvement description]
Labels: type:meta
```

### Step 5: Output

Save retrospective to `docs/retros/sprint-[N].md`:

```markdown
# Sprint [N] Retrospective
Date: YYYY-MM-DD

## Summary
[Brief sprint summary]

## What Went Well
- ...

## What Could Be Improved
- ...

## Action Items
| Item | Owner | Issue |
|------|-------|-------|
| [Action] | TBD | #[number] |

## Metrics
[Sprint metrics table]
```

## Retro Formats

Default: Start/Stop/Continue
Alternative: 4Ls (Liked, Learned, Lacked, Longed For)

Ask user preference if not specified.

## Output

1. Retrospective document saved
2. Meta issues drafted for action items
3. Summary of key takeaways

## Do Not

- Skip metrics collection
- Create action items without clear ownership path
- Blame individuals (focus on process)
- Archive retros that haven't been reviewed
