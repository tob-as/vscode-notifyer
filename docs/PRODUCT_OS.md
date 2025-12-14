# Product Operating System

## Overview

This document describes the end-to-end process for turning business ideas into shipped software.

```
Use Case → PRD → Epic → Stories → Sprint → Release → Retro
```

---

## The Flow

### 1. Intake (Use Case → PRD)

**Trigger**: Business need or user request identified

**Process**:
1. Run `/intake [use case]`
2. Answer clarifying questions
3. Review generated PRD in `docs/prd/<slug>.md`
4. Create Feature issue from draft

**Output**: PRD document + Epic issue

**Owner**: Product Owner

---

### 2. Breakdown (PRD → Stories)

**Trigger**: Epic approved and prioritized

**Process**:
1. Run `/breakdown [prd-file]`
2. Review generated stories (INVEST criteria)
3. Adjust scope as needed
4. Create Story issues from drafts

**Output**: 5-15 user stories linked to epic

**Owner**: Product Owner + Team

---

### 3. Sprint Planning (Backlog → Sprint)

**Trigger**: Start of sprint

**Process**:
1. Run `/sprint-plan [capacity]`
2. Review proposed commitment
3. Confirm sprint goal
4. Move stories to sprint

**Output**: Sprint commitment + sprint goal

**Owner**: Sprint Planner + Team

---

### 4. Execution (Sprint → Done)

**Trigger**: Sprint started

**Process**:
1. Pick story from sprint backlog
2. Move to In Progress
3. Implement with tests
4. Create PR with proper labels
5. Review and merge
6. Move to Done

**WIP Limits**:
- In Progress: 2 per developer
- In Review: 3 total

**Owner**: Team

---

### 5. Release (Done → Production)

**Trigger**: Sprint complete or release needed

**Process**:
1. Run `/release [major|minor|patch]`
2. Review changelog
3. Test on staging
4. Merge to main
5. Tag and publish

**Output**: Version tag + release notes

**Owner**: Release Manager

---

### 6. Retrospective (Sprint → Improvements)

**Trigger**: End of sprint

**Process**:
1. Run `/retro [sprint-number]`
2. Discuss Start/Stop/Continue
3. Vote on action items
4. Create Meta issues

**Output**: Retro summary + action items

**Owner**: Retro Facilitator

---

## Roles

| Role | Responsibility | Agent |
|------|----------------|-------|
| Product Owner | Vision, prioritization | product-owner.md |
| Researcher | Discovery, insights | researcher.md |
| Sprint Planner | Sprint coordination | sprint-planner.md |
| QA Tester | Quality assurance | qa-tester.md |
| Release Manager | Releases, versioning | release-manager.md |
| Docs Keeper | Documentation | docs-keeper.md |
| Retro Facilitator | Retrospectives | retro-facilitator.md |

---

## Commands

| Command | Purpose | Input | Output |
|---------|---------|-------|--------|
| `/intake` | Use case to PRD | Description | PRD + Issue draft |
| `/breakdown` | PRD to stories | PRD file | Story drafts |
| `/sprint-plan` | Plan sprint | Capacity | Sprint commitment |
| `/release` | Create release | Version type | Tag + changelog |
| `/retro` | Run retrospective | Sprint number | Summary + actions |

---

## GitHub Integration

### Labels
See [LABELS.md](LABELS.md) for the complete label system.

### Issue Templates
- Feature (Epic)
- Story
- Bug
- Security
- Retro Improvement

### PR Template
Standardized format with type, release impact, and checklist.

### Release Drafter
Automated changelog generation from PR labels.

---

## Metrics

Track these metrics over time:

| Metric | Target | Frequency |
|--------|--------|-----------|
| Sprint Velocity | Stable | Per sprint |
| Completion Rate | >80% | Per sprint |
| Cycle Time | Decreasing | Weekly |
| Bug Escape Rate | <10% | Per release |
| Retro Action Completion | 100% | Per sprint |

---

## Getting Started

1. **New Feature**: Start with `/intake`
2. **Planning Sprint**: Use `/sprint-plan`
3. **Releasing**: Use `/release`
4. **End of Sprint**: Run `/retro`

For detailed process documentation, see:
- [VERSIONING.md](VERSIONING.md)
- [RELEASE_PROCESS.md](RELEASE_PROCESS.md)
- [COMMITS.md](COMMITS.md)
