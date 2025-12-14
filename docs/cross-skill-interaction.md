# Cross-Skill Interaction Guide

How skills interact when multiple are loaded by agents.

## How Skills Load

1. Agents define `skills:` in their frontmatter
2. Skills are loaded in the order specified
3. Later skills can override or extend earlier patterns
4. Agent-specific instructions take highest precedence

```yaml
# Example agent frontmatter
---
name: ui-setup
skills: shared/react-patterns, shared/tailwind-patterns
---
```

## Loading Priority

```
1. Base skill patterns (first in list)
2. Additional skill patterns (subsequent)
3. Agent-specific instructions (highest priority)
```

## Common Skill Combinations

### Cloudflare Workers Stack
```yaml
skills: cloudflare-workers-patterns
```
- Single skill, no conflicts
- Used by: worker-scaffold, worker-logic agents

### Cloudflare + Hono Stack
```yaml
skills: cloudflare-workers-patterns, hono-patterns
```
- `cloudflare-workers-patterns`: Environment, KV/D1 access
- `hono-patterns`: Routing, middleware (takes priority for routing)
- Used by: microtool profile

### RedwoodSDK Stack
```yaml
skills: redwoodsdk-patterns, shared/react-patterns, shared/tailwind-patterns
```
- `redwoodsdk-patterns`: SSR, RSC, Server Functions
- `shared/react-patterns`: Component patterns
- `shared/tailwind-patterns`: Styling
- RedwoodSDK patterns override React for RSC-specific behavior

### Next.js Stack
```yaml
skills: nextjs-patterns, react-patterns, tailwind-patterns, prisma-patterns
```
- `nextjs-patterns`: App Router, Server Components (primary)
- `react-patterns`: Component patterns (supplementary)
- `tailwind-patterns`: Styling
- `prisma-patterns`: Database access
- Next.js patterns override React for Next.js-specific behavior

### Python Stack
```yaml
skills: fastapi-patterns, sqlalchemy-patterns, ui-design-patterns
```
- No overlaps - each skill covers a different domain
- `fastapi-patterns`: Routes, endpoints
- `sqlalchemy-patterns`: Database models
- `ui-design-patterns`: Jinja2 templates, Pico CSS

## Conflict Resolution

### Same File Domain
If two skills define patterns for the same file type:
- Later skill in list takes precedence
- Agent instructions override both

### Example: Component Exports
```yaml
# react-patterns says: use default exports
# nextjs-patterns says: use named exports for page.tsx

# Resolution: nextjs-patterns wins for page.tsx files
# react-patterns wins for regular components
```

### Best Practice
Define skills from general to specific:
```yaml
# Good: general → specific
skills: react-patterns, nextjs-patterns

# Less clear: specific → general
skills: nextjs-patterns, react-patterns
```

## File Domain Ownership

| Skill | Primary Files |
|-------|--------------|
| cloudflare-workers-patterns | src/index.js, wrangler.toml |
| hono-patterns | src/index.ts, src/routes/*.ts |
| redwoodsdk-patterns | src/app/**, src/Document.tsx |
| nextjs-patterns | app/**, components/** |
| react-patterns | *.tsx components |
| tailwind-patterns | CSS, className usage |
| prisma-patterns | prisma/schema.prisma |
| fastapi-patterns | routes/*.py, main.py |
| sqlalchemy-patterns | models/*.py, database.py |
| ui-design-patterns | templates/*.html |

## When Skills Complement Each Other

Skills are designed to work together:

1. **Infrastructure + Logic**: `cloudflare-workers-patterns` + `hono-patterns`
2. **UI + Styling**: `react-patterns` + `tailwind-patterns`
3. **Backend + Database**: `fastapi-patterns` + `sqlalchemy-patterns`

## Troubleshooting

### Conflicting Patterns
If you see inconsistent patterns:
1. Check skill loading order in agent frontmatter
2. Review which skill owns the file domain
3. Add explicit guidance in agent instructions

### Missing Patterns
If expected patterns aren't applied:
1. Verify skill is listed in agent frontmatter
2. Check skill file exists and has valid frontmatter
3. Ensure file domain matches skill scope
