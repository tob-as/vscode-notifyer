# Hono API Development Standards

Hono is an ultra-fast, lightweight framework for building web applications on Cloudflare Workers.

## Core Concepts

### Basic App Structure
```typescript
// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Env = {
  DB: D1Database;
  KV: KVNamespace;
};

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('/*', cors());

// Routes
app.get('/api/health', (c) => c.json({ status: 'ok' }));

export default app;
```

### Route Handlers

```typescript
// GET with params
app.get('/api/items/:id', async (c) => {
  const id = c.req.param('id');
  const item = await c.env.DB.prepare('SELECT * FROM items WHERE id = ?')
    .bind(id)
    .first();

  if (!item) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json(item);
});

// POST with body
app.post('/api/items', async (c) => {
  const body = await c.req.json();

  const result = await c.env.DB.prepare(
    'INSERT INTO items (title, data) VALUES (?, ?)'
  ).bind(body.title, JSON.stringify(body.data)).run();

  return c.json({ id: result.meta.last_row_id }, 201);
});

// DELETE
app.delete('/api/items/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM items WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});
```

### Middleware Pattern

```typescript
// Custom auth middleware
const authMiddleware = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Verify token...
  c.set('userId', userId);
  await next();
};

// Apply to routes
app.use('/api/protected/*', authMiddleware);
```

### Route Groups

```typescript
// routes/items.ts
import { Hono } from 'hono';

const items = new Hono<{ Bindings: Env }>();

items.get('/', async (c) => { /* list items */ });
items.get('/:id', async (c) => { /* get item */ });
items.post('/', async (c) => { /* create item */ });

export { items };

// src/index.ts
import { items } from './routes/items';
app.route('/api/items', items);
```

### Error Handling

```typescript
import { HTTPException } from 'hono/http-exception';

// Global error handler
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Throwing errors
app.get('/api/items/:id', async (c) => {
  const item = await getItem(c.req.param('id'));
  if (!item) {
    throw new HTTPException(404, { message: 'Item not found' });
  }
  return c.json(item);
});
```

### Validation

```typescript
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const createItemSchema = z.object({
  title: z.string().min(1).max(100),
  data: z.record(z.any()).optional(),
});

app.post(
  '/api/items',
  zValidator('json', createItemSchema),
  async (c) => {
    const body = c.req.valid('json');
    // body is typed and validated
    return c.json({ success: true });
  }
);
```

## D1 Database Access

```typescript
// Simple query
const items = await c.env.DB.prepare('SELECT * FROM items').all();

// Parameterized query
const item = await c.env.DB.prepare(
  'SELECT * FROM items WHERE id = ?'
).bind(id).first();

// Insert with returning
const result = await c.env.DB.prepare(
  'INSERT INTO items (title) VALUES (?) RETURNING *'
).bind(title).first();
```

## KV Storage

```typescript
// Get value
const value = await c.env.KV.get('key');
const jsonValue = await c.env.KV.get('key', 'json');

// Set value
await c.env.KV.put('key', 'value');
await c.env.KV.put('key', JSON.stringify(data), {
  expirationTtl: 3600 // 1 hour
});

// Delete
await c.env.KV.delete('key');
```

## Multi-Environment

```toml
# wrangler.toml
name = "api-prod"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.dev]
name = "api-dev"

[env.staging]
name = "api-staging"
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
```

## Best Practices

1. **Type your environment** - Define `Env` type for bindings
2. **Use route groups** - Organize routes in separate files
3. **Validate input** - Use zod for request validation
4. **Handle errors globally** - Use `app.onError` for consistent error responses
5. **Keep handlers thin** - Extract business logic to separate functions
