# Development Workflow

## Product OS: Idea to Delivery

The complete lifecycle from business idea to production release:

```
1. /intake      →  Business idea → PRD + Epic
2. /breakdown   →  PRD → User Stories (INVEST)
3. /sprint-plan →  Stories → Sprint Commitment
4. [Build]      →  Execute sprint work
5. /release     →  Version bump + Changelog + Tag
6. /retro       →  Retrospective → Improvements
```

## Phase 1: /intake

Capture a business use case and transform it into a structured PRD:
- Problem/Context, Target Audience, Success Criteria
- Creates `docs/prd/<slug>.md`
- Drafts GitHub Epic Issue

Use `--auto` to chain through all phases automatically.

## Phase 2: /breakdown

Break the PRD into sprint-sized user stories following INVEST:
- **I**ndependent, **N**egotiable, **V**aluable
- **E**stimable, **S**mall, **T**estable
- Creates GitHub Story Issues (5-15 per epic)

## Phase 3: /sprint-plan

Plan the sprint from the backlog:
- Set Sprint Goal
- Apply WIP limits (3-5 in progress)
- Commit stories based on capacity

## Phase 4: Build

Execute the sprint work:
- Use `/create` for new projects
- Implement stories one by one
- Mark stories done when complete

## Phase 5: /release

When sprint work is complete:
- Determine SemVer bump (major/minor/patch)
- Generate changelog from commits
- Create git tag and GitHub Release

## Phase 6: /retro

End-of-sprint retrospective:
- What went well / What to improve
- Create action items as GitHub Issues
- Feed improvements back into process

## Key Principle

**GitHub Issues are the single source of truth.**

All work items, PRDs, stories, and improvements are tracked as GitHub Issues.
This ensures visibility, traceability, and collaboration.

## Automatic Chaining

Use `--auto` flag to run the full cycle:

```
/intake --auto "Build user dashboard"
```

This chains: `/intake` → `/breakdown` → `/sprint-plan` → `/release` → `/retro`
