---
name: hono-patterns
description: Hono patterns for building APIs on Cloudflare Workers. Covers routing, middleware, validation, error handling, and database access.
allowed-tools: WebFetch, Read, Grep, Glob
last_verified: "2025-12-13"
target_versions:
  hono: "4.x"
  wrangler: "3.x"
---

# Hono API Patterns

Hono is an ultra-fast, lightweight web framework for Cloudflare Workers.

## When to Use This Skill

- Creating Hono API applications
- Implementing REST endpoints
- Setting up middleware chains
- Handling request validation
- Working with D1/KV storage

## Fetch Latest Docs When Needed

If unsure about current best practices, fetch from:
- **Hono Docs**: https://hono.dev/
- **Cloudflare Guide**: https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/
- **Middleware**: https://hono.dev/docs/guides/middleware

## Basic App Structure

```typescript
// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

type Env = {
  DB: D1Database;
  KV: KVNamespace;
  API_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('/*', logger());
app.use('/*', cors());

// Routes
app.get('/', (c) => c.text('Hello Hono!'));
app.get('/api/health', (c) => c.json({ status: 'ok' }));

export default app;
```

## Route Handlers

### GET with Parameters

```typescript
app.get('/api/items/:id', async (c) => {
  const id = c.req.param('id');
  const item = await c.env.DB.prepare(
    'SELECT * FROM items WHERE id = ?'
  ).bind(id).first();

  if (!item) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json(item);
});
```

### GET with Query Parameters

```typescript
app.get('/api/items', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10');
  const offset = parseInt(c.req.query('offset') || '0');

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM items LIMIT ? OFFSET ?'
  ).bind(limit, offset).all();

  return c.json({ items: results, limit, offset });
});
```

### POST with JSON Body

```typescript
app.post('/api/items', async (c) => {
  const body = await c.req.json<{ title: string; data?: object }>();

  const result = await c.env.DB.prepare(
    'INSERT INTO items (title, data) VALUES (?, ?) RETURNING *'
  ).bind(body.title, JSON.stringify(body.data || {})).first();

  return c.json(result, 201);
});
```

### PUT/PATCH

```typescript
app.put('/api/items/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{ title: string }>();

  const result = await c.env.DB.prepare(
    'UPDATE items SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'
  ).bind(body.title, id).first();

  if (!result) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json(result);
});
```

### DELETE

```typescript
app.delete('/api/items/:id', async (c) => {
  const id = c.req.param('id');

  const existing = await c.env.DB.prepare(
    'SELECT id FROM items WHERE id = ?'
  ).bind(id).first();

  if (!existing) {
    return c.json({ error: 'Not found' }, 404);
  }

  await c.env.DB.prepare('DELETE FROM items WHERE id = ?').bind(id).run();

  return c.json({ success: true });
});
```

## Route Groups

```typescript
// routes/items.ts
import { Hono } from 'hono';

type Env = {
  DB: D1Database;
};

const items = new Hono<{ Bindings: Env }>();

items.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM items').all();
  return c.json(results);
});

items.get('/:id', async (c) => {
  const id = c.req.param('id');
  const item = await c.env.DB.prepare(
    'SELECT * FROM items WHERE id = ?'
  ).bind(id).first();
  return item ? c.json(item) : c.json({ error: 'Not found' }, 404);
});

items.post('/', async (c) => {
  const body = await c.req.json();
  // ... create item
  return c.json({ id: 1 }, 201);
});

export { items };

// src/index.ts
import { items } from './routes/items';
app.route('/api/items', items);
```

## Middleware

### Custom Auth Middleware

```typescript
import { createMiddleware } from 'hono/factory';

type Variables = {
  userId: string;
};

const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Verify token (e.g., check KV or call auth service)
  const session = await c.env.KV.get(`session:${token}`, 'json');

  if (!session) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  c.set('userId', session.userId);
  await next();
});

// Apply to routes
app.use('/api/protected/*', authMiddleware);

// Access in handler
app.get('/api/protected/profile', (c) => {
  const userId = c.get('userId');
  return c.json({ userId });
});
```

### API Key Middleware

```typescript
const apiKeyMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const apiKey = c.req.header('X-API-Key');

  if (apiKey !== c.env.API_KEY) {
    return c.json({ error: 'Invalid API key' }, 403);
  }

  await next();
});
```

## Error Handling

```typescript
import { HTTPException } from 'hono/http-exception';

// Global error handler
app.onError((err, c) => {
  console.error('Error:', err);

  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  return c.json({ error: 'Internal Server Error' }, 500);
});

// Throwing errors in handlers
app.get('/api/items/:id', async (c) => {
  const item = await getItem(c.req.param('id'));

  if (!item) {
    throw new HTTPException(404, { message: 'Item not found' });
  }

  return c.json(item);
});

// Not found handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});
```

## Request Validation with Zod

```typescript
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const createItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  data: z.record(z.any()).optional(),
});

app.post(
  '/api/items',
  zValidator('json', createItemSchema),
  async (c) => {
    const body = c.req.valid('json');
    // body is typed: { title: string; description?: string; data?: Record<string, any> }

    const result = await c.env.DB.prepare(
      'INSERT INTO items (title, description) VALUES (?, ?) RETURNING *'
    ).bind(body.title, body.description || null).first();

    return c.json(result, 201);
  }
);

// Query validation
const listQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

app.get(
  '/api/items',
  zValidator('query', listQuerySchema),
  async (c) => {
    const { limit, offset } = c.req.valid('query');
    // ...
  }
);
```

## D1 Database Patterns

```typescript
// Simple query
const { results } = await c.env.DB.prepare('SELECT * FROM items').all();

// Parameterized query
const item = await c.env.DB.prepare(
  'SELECT * FROM items WHERE id = ?'
).bind(id).first();

// Insert with returning
const newItem = await c.env.DB.prepare(
  'INSERT INTO items (title) VALUES (?) RETURNING *'
).bind(title).first();

// Batch operations
const batch = [
  c.env.DB.prepare('INSERT INTO items (title) VALUES (?)').bind('Item 1'),
  c.env.DB.prepare('INSERT INTO items (title) VALUES (?)').bind('Item 2'),
];
await c.env.DB.batch(batch);
```

## KV Storage Patterns

```typescript
// Get value
const value = await c.env.KV.get('key');
const jsonValue = await c.env.KV.get('key', 'json');

// Set value with TTL
await c.env.KV.put('key', 'value', {
  expirationTtl: 3600 // 1 hour
});

// Set JSON
await c.env.KV.put('key', JSON.stringify(data));

// Delete
await c.env.KV.delete('key');

// List with prefix
const { keys } = await c.env.KV.list({ prefix: 'user:' });
```

## Multi-Environment Config

```toml
# wrangler.toml
name = "api-prod"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "api-db-prod"
database_id = "xxx"

[env.dev]
name = "api-dev"
[[env.dev.d1_databases]]
binding = "DB"
database_name = "api-db-dev"
database_id = "yyy"

[env.staging]
name = "api-staging"
[[env.staging.d1_databases]]
binding = "DB"
database_name = "api-db-staging"
database_id = "zzz"
```

## Development Commands

```bash
# Start dev server
npx wrangler dev

# Deploy
npx wrangler deploy --env dev
npx wrangler deploy --env staging
npx wrangler deploy

# Logs
npx wrangler tail --env dev

# D1 operations
npx wrangler d1 execute DB --file=schema.sql --env dev
```

## Verify Existing Patterns

```bash
# Find route definitions
grep -r "app\.\(get\|post\|put\|delete\|patch\)" src/ --include="*.ts"

# Find middleware usage
grep -r "app\.use\|createMiddleware" src/ --include="*.ts"

# Find env bindings
grep -r "c\.env\." src/ --include="*.ts"

# Find route groups
grep -r "app\.route" src/ --include="*.ts"
```

## Do Not

- No accessing `c.req.json()` without try-catch or validation
- No hardcoding secrets - use environment bindings
- No skipping error handling in async handlers
- No returning sensitive data in error messages
- No forgetting CORS for public APIs
