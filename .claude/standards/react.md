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

## Do Not

- No class components
- No index as key
- No useEffect for data fetching (use Server Components)
- No prop drilling (pass only what's needed)
