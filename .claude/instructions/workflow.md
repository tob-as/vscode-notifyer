# Development Workflow

## The Core Loop

Building apps follows a simple two-phase pattern:

```
1. Plan    →  Discuss your idea, refine requirements
2. /design →  Create design specification (no code)
3. /build  →  Execute the design (no decisions)
4. Iterate →  Test, refine, repeat
```

## Phase 1: Plan (Conversation)

Before running any commands, discuss your app idea:
- What problem does it solve?
- Who will use it?
- What are the core features?

Claude will help refine your concept. Take your time here - good planning prevents rework.

## Phase 2: /design

When your idea is clear, run `/design`. This command:
- Asks clarifying questions about tech stack, UI, data model
- Creates `.design/spec.md` (what to build)
- Creates `.design/contracts.md` (component APIs)
- Makes NO code changes

The design phase captures all decisions. Review the files before proceeding.

## Phase 3: /build

When design is approved, run `/build`. This command:
- Reads `.design/` files
- Launches specialized agents in parallel
- Creates all code exactly as specified
- Runs the application

Build does NOT make design decisions. If something is unclear, it stops and asks you to update `.design/` files.

## Iteration

After `/build` completes:
- Test the running app
- Report issues or request changes
- For bug fixes: Claude fixes directly
- For design changes: Update `.design/` files, re-run `/build`

## Key Principle

**Design decisions and code execution are separate.**

- `/design` = WHAT to build (decisions)
- `/build` = HOW to build it (execution)

This separation ensures consistent, predictable results.

## Future Commands

- `/plan` - Strategic planning for complex multi-phase projects
- `/polish` - UI/UX refinement after initial build
