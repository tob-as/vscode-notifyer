---
name: nextjs-patterns
description: Next.js 14+ App Router patterns, Server/Client component rules, Button+Link patterns, data fetching. Use when creating pages, components, layouts, or routes in Next.js apps. Checks latest docs when needed.
allowed-tools: WebFetch, Read, Grep, Glob
---

# Next.js Standards

Next.js 14+ with App Router.

## When to Use This Skill

- Creating pages, layouts, or API routes
- Implementing Server Actions or data fetching
- Working with Server vs Client Components
- Adding navigation with Button + Link patterns
- Need to verify latest Next.js patterns

## Fetch Latest Docs When Needed

If unsure about current best practices, fetch from:
- **App Router**: https://nextjs.org/docs/app/building-your-application/routing
- **Server Components**: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- **Data Fetching**: https://nextjs.org/docs/app/building-your-application/data-fetching
- **Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

## Structure
```
app/
  layout.tsx
  page.tsx
  globals.css
  [entity]/
    page.tsx          # List
    new/page.tsx      # Create
    [id]/page.tsx     # Detail
    [id]/edit/page.tsx
components/
  ui/                 # shadcn/ui
  layout/             # Navbar, etc.
lib/
  db.ts               # Prisma client
  utils.ts            # cn() helper
prisma/
  schema.prisma
```

## Rules

- Use App Router (`app/`), NOT Pages Router (`pages/`)
- Server Components by default, `"use client"` only for interactivity
- Use Server Actions for forms (`"use server"`)
- Fetch data in Server Components, not useEffect
- Use `notFound()` from next/navigation for 404s
- Use `redirect()` for redirects after mutations

## Server vs Client Components (CRITICAL)

### Server Components (Default)
**What they CAN do:**
- Fetch data from database/API
- Access backend resources directly
- Use async/await
- Keep sensitive data secure (API keys, tokens)

**What they CANNOT do:**
- ❌ Use useState, useEffect, useContext, useReducer
- ❌ Use onClick, onChange, onSubmit handlers
- ❌ Use browser APIs (localStorage, window, document)
- ❌ Use event listeners

### Client Components ("use client")
**When to add "use client":**
- Interactive elements (onClick, onChange, onSubmit)
- React hooks (useState, useEffect, useContext, etc.)
- Browser APIs (localStorage, window)
- Event listeners
- Third-party libraries that use hooks

**How to add:**
```tsx
"use client";  // Must be first line, before imports

import { useState } from 'react';
export default function MyComponent() { ... }
```

### Common Mistakes

**❌ WRONG - Event handler in Server Component:**
```tsx
export default function Page() {
  return <Button onClick={() => console.log('click')}>Click</Button>;
}
// Error: Event handlers cannot be passed to Client Component props
```

**✅ CORRECT - Create Client Component:**
```tsx
// components/my-button.tsx
"use client";
export default function MyButton() {
  return <Button onClick={() => console.log('click')}>Click</Button>;
}

// app/page.tsx (Server Component)
import MyButton from '@/components/my-button';
export default function Page() {
  return <MyButton />;
}
```

## Button + Link Patterns (CRITICAL)

### Navigation Buttons

**❌ WRONG - Button inside Link:**
```tsx
<Link href="/path">
  <Button>Click</Button>
</Link>
// Error: Breaks accessibility and styling
```

**✅ CORRECT - Use asChild prop:**
```tsx
<Button asChild>
  <Link href="/path">Click</Link>
</Button>
// Button styles, Link navigation
```

### Interactive Buttons in Server Components

**❌ WRONG - onClick in Server Component:**
```tsx
// app/page.tsx (Server Component)
export default function Page() {
  return <Button onClick={() => alert('hi')}>Click</Button>;
}
```

**✅ CORRECT - Extract to Client Component:**
```tsx
// components/alert-button.tsx
"use client";
export default function AlertButton() {
  return <Button onClick={() => alert('hi')}>Click</Button>;
}

// app/page.tsx (Server Component)
import AlertButton from '@/components/alert-button';
export default function Page() {
  return <AlertButton />;
}
```

### Delete/Confirmation Dialogs

**✅ CORRECT - Client Component with Dialog:**
```tsx
// components/delete-button.tsx
"use client";
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function DeleteButton({ id }: { id: string }) {
  const handleDelete = async () => {
    // Delete logic with Server Action or API call
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <Button onClick={handleDelete}>Confirm</Button>
      </DialogContent>
    </Dialog>
  );
}
```

## Patterns

```tsx
// Server Component (default) - Fetch data
export default async function Page() {
  const data = await prisma.item.findMany();
  return <div>{/* render */}</div>;
}

// Server Action - Form submission
async function createItem(formData: FormData) {
  "use server";
  await prisma.item.create({ data: { ... } });
  redirect("/items");
}

// Client Component - Interactivity
"use client";
export default function Interactive() {
  const [state, setState] = useState();
  return <button onClick={() => setState(...)} />;
}
```

## Verify Against Codebase

Before generating code, search existing patterns:
```bash
# Find Server Components with data fetching
grep -r "export default async function" app/ --include="*.tsx"

# Find Client Components
grep -r "\"use client\"" app/ --include="*.tsx"

# Find Server Actions
grep -r "\"use server\"" app/ --include="*.tsx"
```

## Do Not

- No Pages Router, getServerSideProps, getStaticProps
- No useEffect for data fetching
- No API routes when Server Actions work
- No `response_class` or manual JSON responses for pages
