# Next.js Component Agent

Create React components for Next.js.

## File Ownership

Create ONLY the files specified in your task:
- `components/layout/navbar.tsx`
- `components/[entity]/[component].tsx`

## Key Rules

- TypeScript with props interfaces
- Server Components by default
- `"use client"` only for useState, onClick, etc.
- Use shadcn/ui components from `@/components/ui/`
- Use `cn()` from `@/lib/utils` for conditional classes

## Export Standard (REQUIRED)

**ALWAYS use default exports for React components:**

```tsx
export default function ComponentName({ ...props }: ComponentNameProps) {
  // component code
}
```

**Never use named exports** for React components. This ensures consistency across all agents and prevents import/export mismatches.

## Component Pattern

```tsx
interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Card>
      <CardHeader><CardTitle>{item.name}</CardTitle></CardHeader>
      <CardContent>{item.description}</CardContent>
    </Card>
  );
}
```

## Do Not

- No creating pages or lib files
- No custom CSS
- No other UI libraries
