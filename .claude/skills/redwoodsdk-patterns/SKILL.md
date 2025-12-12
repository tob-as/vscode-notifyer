---
name: redwoodsdk-patterns
description: RedwoodSDK patterns for building fullstack React apps on Cloudflare Workers. Covers routing, server functions, React Server Components, and data fetching.
allowed-tools: WebFetch, Read, Grep, Glob
---

# RedwoodSDK Patterns

RedwoodSDK is the React framework for Cloudflare Workers - SSR, RSC, and Server Functions out of the box.

## When to Use This Skill

- Creating RedwoodSDK applications
- Working with React Server Components
- Implementing Server Functions
- Setting up routing with layouts
- Integrating D1/KV/R2 storage

## Fetch Latest Docs When Needed

If unsure about current best practices, fetch from:
- **RedwoodSDK Docs**: https://docs.rwsdk.com/
- **API Reference**: https://docs.rwsdk.com/reference/sdk-worker/
- **Cloudflare Guide**: https://developers.cloudflare.com/workers/framework-guides/web-apps/redwoodsdk/

## App Entry Point

```tsx
// src/worker.tsx
import { defineApp } from "rwsdk/worker";
import { index, layout, route } from "rwsdk/router";
import { Document } from "./app/Document";
import { Home } from "./app/routes/Home";
import { Dashboard } from "./app/routes/Dashboard";

const app = defineApp([
  layout(Document, [
    index([Home]),
    route("dashboard", [Dashboard]),
    route("settings", [Settings]),
  ]),
]);

export default app;
```

## Document Layout

```tsx
// src/app/Document.tsx
export function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>App</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

## Server Functions

Use `"use server"` for backend logic:

```tsx
// src/app/actions/items.ts
"use server";

import { getContext } from "rwsdk/worker";

export async function getItems() {
  const { env } = getContext();
  const { results } = await env.DB.prepare(
    "SELECT * FROM items ORDER BY created_at DESC"
  ).all();
  return results;
}

export async function createItem(formData: FormData) {
  const { env } = getContext();
  const title = formData.get("title") as string;

  await env.DB.prepare(
    "INSERT INTO items (title) VALUES (?)"
  ).bind(title).run();

  return { success: true };
}

export async function deleteItem(id: number) {
  const { env } = getContext();
  await env.DB.prepare(
    "DELETE FROM items WHERE id = ?"
  ).bind(id).run();

  return { success: true };
}
```

## React Server Components (Default)

```tsx
// Server Component - can fetch data directly
import { getItems } from "../actions/items";

export async function ItemList() {
  const items = await getItems();

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
```

## Client Components

Add `"use client"` only for interactivity:

```tsx
// src/app/components/Counter.tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

## Form Handling with Server Functions

```tsx
// src/app/routes/CreateItem.tsx
import { createItem } from "../actions/items";

export function CreateItem() {
  return (
    <form action={createItem}>
      <input type="text" name="title" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

## Client-Side Form with Interactivity

```tsx
"use client";

import { useState } from "react";
import { createItem } from "../actions/items";

export function CreateItemForm() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const formData = new FormData(e.target as HTMLFormElement);
    await createItem(formData);

    setPending(false);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" required />
      <button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

## Accessing Environment Context

```tsx
// In Server Functions
import { getContext } from "rwsdk/worker";

export async function getData() {
  const { env, request } = getContext();

  // Access D1 database
  const items = await env.DB.prepare("SELECT * FROM items").all();

  // Access KV storage
  const cached = await env.CACHE.get("key");

  // Access request info
  const url = new URL(request.url);

  return items.results;
}
```

## Route Parameters

```tsx
// src/worker.tsx
import { route, param } from "rwsdk/router";

const app = defineApp([
  layout(Document, [
    route("items", [
      index([ItemList]),
      route(param("id"), [ItemDetail]),
    ]),
  ]),
]);

// src/app/routes/ItemDetail.tsx
import { getContext } from "rwsdk/worker";

export async function ItemDetail() {
  const { params, env } = getContext();
  const item = await env.DB.prepare(
    "SELECT * FROM items WHERE id = ?"
  ).bind(params.id).first();

  if (!item) {
    return <div>Not found</div>;
  }

  return <div>{item.title}</div>;
}
```

## Middleware Pattern

```tsx
// src/middleware/auth.ts
import { getContext } from "rwsdk/worker";

export async function requireAuth() {
  const { request, env } = getContext();

  const sessionId = getCookie(request, "session");
  if (!sessionId) {
    return Response.redirect("/login");
  }

  const session = await env.SESSIONS.get(sessionId, "json");
  if (!session) {
    return Response.redirect("/login");
  }

  return null; // Continue to route
}

// Apply in router
import { middleware } from "rwsdk/router";

route("dashboard", [
  middleware(requireAuth),
  Dashboard,
]);
```

## Multi-Environment Config

```jsonc
// wrangler.jsonc
{
  "name": "app-prod",
  "main": "src/worker.tsx",
  "compatibility_date": "2024-01-01",

  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "app-db-prod",
      "database_id": "xxx"
    }
  ],

  "env": {
    "dev": {
      "name": "app-dev",
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "app-db-dev",
          "database_id": "yyy"
        }
      ]
    },
    "staging": {
      "name": "app-staging",
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "app-db-staging",
          "database_id": "zzz"
        }
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
npx wrangler deploy

# Database operations
npx wrangler d1 execute DB --file=schema.sql --env dev
npx wrangler d1 execute DB --file=schema.sql --env staging
npx wrangler d1 execute DB --file=schema.sql
```

## Verify Existing Patterns

```bash
# Find server functions
grep -r '"use server"' src/ --include="*.ts" --include="*.tsx"

# Find client components
grep -r '"use client"' src/ --include="*.ts" --include="*.tsx"

# Find route definitions
grep -r "defineApp\|route\|layout" src/ --include="*.tsx"

# Find context usage
grep -r "getContext" src/ --include="*.ts" --include="*.tsx"
```

## Do Not

- No using `"use client"` unless needed for interactivity
- No direct database access from client components
- No hardcoding environment-specific values
- No importing server functions in client code (only call them)
- No blocking the render with heavy operations
