---
name: react-patterns
description: React component patterns, TypeScript interfaces, naming conventions, export/import standards. Use when creating React components, defining props, or organizing component files.
allowed-tools: Read, Grep, Glob
---

# React Standards

## Rules

- Function components only, no class components
- TypeScript interfaces for all props
- `"use client"` only for useState, useEffect, event handlers
- Use `cn()` from lib/utils for conditional classes
- **ALWAYS use default exports** for React components

## Naming

- Components: PascalCase (`ExpenseCard`)
- Files: kebab-case (`expense-card.tsx`)
- Props interfaces: `ComponentNameProps`

## Export/Import Pattern (REQUIRED)

**Export (in component files):**
```tsx
export default function ComponentName({ ...props }: ComponentNameProps) {
  // component code
}
```

**Import (in consumer files):**
```tsx
import ComponentName from '@/components/path/component-name'
```

**Never use named exports/imports** for React components. This prevents import/export mismatches between agents.

## Component Pattern

```tsx
interface ItemCardProps {
  item: Item;
  className?: string;
}

export default function ItemCard({ item, className }: ItemCardProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      {item.name}
    </div>
  );
}
```

## Lists

```tsx
{items.map((item) => (
  <ItemCard key={item.id} item={item} />
))}
```

## Verify Existing Patterns

Before creating components, search codebase for examples:
```bash
# Find component patterns
grep -r "export default function" components/ --include="*.tsx"

# Find props interfaces
grep -r "interface.*Props" components/ --include="*.tsx"

# Find cn() usage
grep -r "cn(" components/ --include="*.tsx"
```

## Do Not

- No class components
- No index as key
- No useEffect for data fetching (use Server Components)
- No prop drilling (pass only what's needed)
