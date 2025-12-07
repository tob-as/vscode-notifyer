# Tailwind + shadcn/ui Standards

Dark mode by default. Use shadcn/ui components.

## shadcn/ui Components

Import from `@/components/ui/`:
- Button, Card, Input, Label, Badge, Table, Dialog, Select, AlertDialog

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
```

## Common Classes

```tsx
// Layout
<div className="container mx-auto py-8">
<div className="flex items-center justify-between">
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="space-y-4">

// Text
<h1 className="text-3xl font-bold">
<p className="text-muted-foreground">
<span className="text-sm">

// Backgrounds
<div className="bg-background">
<div className="bg-card">

// Spacing
<div className="p-4 mt-8 mb-4">
```

## Conditional Classes

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "rounded-lg p-4",
  isActive && "bg-primary",
  className
)}>
```

## Dialog/Modal Patterns (CRITICAL)

### Full-Height Content (e.g., iframe, video)

**❌ WRONG - h-full in grid without explicit rows:**
```tsx
<DialogContent className="max-w-[90vw] w-full h-[90vh] p-0">
  <DialogHeader>
    <DialogTitle>Demo</DialogTitle>
  </DialogHeader>
  <div className="w-full h-full">
    <iframe src="..." className="w-full h-full" />
  </div>
</DialogContent>
// Problem: DialogContent uses CSS Grid layout by default
// h-full doesn't work in grid without explicit grid-template-rows
// Browser can't calculate height distribution → content collapses
```

**✅ CORRECT - Explicit grid rows:**
```tsx
<DialogContent className="max-w-[90vw] w-full h-[90vh] grid grid-rows-[auto_1fr] p-0">
  <DialogHeader>
    <DialogTitle>Demo</DialogTitle>
  </DialogHeader>
  <div className="overflow-hidden">
    <iframe src="..." className="w-full h-full" />
  </div>
</DialogContent>
// grid-rows-[auto_1fr]: header takes minimum space, content fills remaining
// overflow-hidden: prevents scrollbar issues
```

**Why This Matters:**
- shadcn/ui DialogContent uses `display: grid` by default
- Grid layout requires explicit row definitions for height distribution
- `h-full` works in flexbox (fills remaining space automatically)
- `h-full` fails in grid without `grid-template-rows` or `grid-rows-[...]`
- Common mistake: treating grid like flexbox

## Do Not

- No custom CSS files
- No other UI libraries (Bootstrap, etc.)
- No inline styles
- No CSS modules
