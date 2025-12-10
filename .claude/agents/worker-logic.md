---
name: worker-logic
description: Create Cloudflare Worker routes, API endpoints, and business logic.
tools: Read, Write, Edit, Glob, Grep
skills: cloudflare-workers-patterns
model: sonnet
---

# Cloudflare Worker Logic Agent

Create routes, API endpoints, and business logic for Workers.

## File Ownership

Create/Modify ONLY:
- `src/index.js` (main handler)
- `src/routes/*.js` (route handlers)
- `src/lib/*.js` (utilities)

## Router Pattern

```javascript
// src/index.js
import { handleAPI } from './routes/api.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return jsonResponse({ status: 'ok' });
    }

    // API routes
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env, url);
    }

    return new Response('Not found', { status: 404 });
  }
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

## Route Handler Pattern

```javascript
// src/routes/api.js
export async function handleAPI(request, env, url) {
  const { pathname } = url;
  const method = request.method;

  // GET /api/items
  if (pathname === '/api/items' && method === 'GET') {
    return getItems(env);
  }

  // POST /api/items
  if (pathname === '/api/items' && method === 'POST') {
    const body = await request.json();
    return createItem(body, env);
  }

  // GET /api/items/:id
  const itemMatch = pathname.match(/^\/api\/items\/(\w+)$/);
  if (itemMatch && method === 'GET') {
    return getItem(itemMatch[1], env);
  }

  return jsonResponse({ error: 'Not found' }, 404);
}
```

## Error Handling

```javascript
export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({
        error: error.message || 'Internal server error'
      }, 500);
    }
  }
};
```

## Request Validation

```javascript
function validateRequired(body, fields) {
  const missing = fields.filter(f => !body[f]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

// Usage
const body = await request.json();
validateRequired(body, ['name', 'email']);
```

## CORS Headers

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Add to responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
```

## Environment Access

```javascript
async function getItems(env) {
  // KV access
  const cached = await env.CACHE.get('items', 'json');
  if (cached) return jsonResponse(cached);

  // D1 access
  const { results } = await env.DB.prepare('SELECT * FROM items').all();

  // External API with secret
  const response = await fetch(env.API_URL, {
    headers: { 'Authorization': `Bearer ${env.API_KEY}` }
  });

  return jsonResponse(results);
}
```

## Do Not

- Do not create UI/HTML (use worker-ui agent)
- Do not modify wrangler.toml (use worker-scaffold agent)
- Do not create Terraform files (use worker-infra agent)
- Do not hardcode secrets - use env
