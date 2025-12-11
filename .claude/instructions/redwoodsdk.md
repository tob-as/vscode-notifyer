# RedwoodSDK Development Standards

RedwoodSDK is the React framework for Cloudflare - built for Workers from the first line of code.

## Core Concepts

### Project Structure
```
src/
├── worker.tsx          # Entry point (defineApp)
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── routes/
│       └── [route]/
│           └── page.tsx
└── shared/
    └── ui/             # Shared components
```

### Entry Point Pattern
```tsx
// src/worker.tsx
import { defineApp } from "rwsdk/worker";
import { index, layout, route } from "rwsdk/router";
import { Document } from "./app/Document";
import { Home } from "./app/routes/Home";

const app = defineApp([
  layout(Document, [
    index([Home]),
    route("dashboard", [Dashboard]),
  ]),
]);

export default app;
```

## Server Functions

Use `"use server"` directive for backend logic:

```tsx
// src/app/actions.ts
"use server";

export async function createItem(formData: FormData) {
  const title = formData.get("title") as string;
  // Access D1, KV, etc. via context
  return { success: true };
}
```

## React Server Components

Default is Server Components. Add `"use client"` only when needed:

```tsx
// Server Component (default)
export function ProductList({ products }) {
  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}

// Client Component (interactive)
"use client";
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Environment & Bindings

Access D1, KV, R2 via environment:

```tsx
// In Server Functions
import { getContext } from "rwsdk/worker";

export async function getData() {
  const { env } = getContext();
  const result = await env.DB.prepare("SELECT * FROM items").all();
  return result.results;
}
```

## Multi-Environment Setup

wrangler.jsonc configuration:
```jsonc
{
  "name": "app-prod",
  "compatibility_date": "2024-01-01",
  "main": "src/worker.tsx",

  // D1 Database
  "d1_databases": [
    { "binding": "DB", "database_name": "app-db-prod", "database_id": "xxx" }
  ],

  // Environments
  "env": {
    "dev": {
      "name": "app-dev",
      "d1_databases": [
        { "binding": "DB", "database_name": "app-db-dev", "database_id": "yyy" }
      ]
    },
    "staging": {
      "name": "app-staging",
      "d1_databases": [
        { "binding": "DB", "database_name": "app-db-staging", "database_id": "zzz" }
      ]
    }
  }
}
```

## Development Commands

```bash
# Start dev server
npm run dev

# Deploy to environment
npx wrangler deploy --env dev
npx wrangler deploy --env staging
npx wrangler deploy              # Production

# Database operations
npx wrangler d1 execute DB --file=schema.sql --env dev
```

## Auth Integration

Use workers-users middleware:

```tsx
// src/middleware/auth.ts
import { getContext } from "rwsdk/worker";

export async function requireAuth() {
  const { request, env } = getContext();
  const session = await verifySession(request, env);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  return null; // Continue
}
```

## Best Practices

1. **Keep Server Components by default** - Only use `"use client"` for interactivity
2. **Server Functions for mutations** - Database writes go through Server Functions
3. **Environment separation** - Always use --env flag for non-production
4. **Type safety** - Use TypeScript throughout
5. **Co-locate related code** - Routes, actions, and types together
