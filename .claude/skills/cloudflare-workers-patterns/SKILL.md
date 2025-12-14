---
name: cloudflare-workers-patterns
description: Cloudflare Workers patterns for serverless development. Covers fetch handlers, routing, KV/D1 storage, environment variables, and security patterns.
allowed-tools: WebFetch, Read, Grep, Glob
last_verified: "2025-12-13"
target_versions:
  wrangler: "3.x"
  workers-types: "4.x"
---

# Cloudflare Workers Patterns

Cloudflare Workers for serverless edge computing. **NOT traditional servers.**

## When to Use This Skill

- Creating Cloudflare Worker fetch handlers
- Working with KV or D1 storage
- Handling environment variables and secrets
- Setting up multi-environment deployments
- Implementing API routes in Workers

## Fetch Latest Docs When Needed

If unsure about current best practices, fetch from:
- **Workers Docs**: https://developers.cloudflare.com/workers/
- **KV Docs**: https://developers.cloudflare.com/kv/
- **D1 Docs**: https://developers.cloudflare.com/d1/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/

## Worker Types

### Standalone UI Worker
HTML embedded in JavaScript using template literals.

```javascript
const HTML = `<!DOCTYPE html>
<html>
<head><title>App</title></head>
<body>
  <h1>Hello</h1>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    return new Response(HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};
```

### API Worker
JSON responses with structured routing.

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/data') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};
```

### Hybrid Worker
Combines UI and API in one worker.

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API routes
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env, url);
    }

    // Serve UI
    return new Response(HTML, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};
```

## Routing Pattern

```javascript
async function router(request, env) {
  const url = new URL(request.url);
  const method = request.method;

  // Match route and method
  if (url.pathname === '/users' && method === 'GET') {
    return getUsers(env);
  }
  if (url.pathname === '/users' && method === 'POST') {
    return createUser(request, env);
  }
  if (url.pathname.match(/^\/users\/\d+$/)) {
    const id = url.pathname.split('/')[2];
    if (method === 'GET') return getUser(id, env);
    if (method === 'DELETE') return deleteUser(id, env);
  }

  return new Response('Not found', { status: 404 });
}
```

## Environment Variables

### wrangler.toml Variables
```toml
[vars]
API_BASE_URL = "https://api.example.com"

[env.dev.vars]
API_BASE_URL = "https://dev-api.example.com"
```

### Secrets (via wrangler CLI)
```bash
wrangler secret put API_KEY --env dev
wrangler secret put API_KEY --env staging
wrangler secret put API_KEY --env prod
```

### Accessing in Worker
```javascript
export default {
  async fetch(request, env, ctx) {
    // Variables and secrets both via env
    const apiUrl = env.API_BASE_URL;
    const apiKey = env.API_KEY;
  }
};
```

## KV Storage

### wrangler.toml
```toml
[[kv_namespaces]]
binding = "MY_KV"
id = "<your-kv-namespace-id>"

[env.dev]
[[env.dev.kv_namespaces]]
binding = "MY_KV"
id = "<dev-kv-namespace-id>"
```

### Usage
```javascript
// Read
const value = await env.MY_KV.get('key');
const jsonValue = await env.MY_KV.get('key', 'json');

// Write
await env.MY_KV.put('key', 'value');
await env.MY_KV.put('key', JSON.stringify(data));

// Delete
await env.MY_KV.delete('key');

// List keys
const keys = await env.MY_KV.list({ prefix: 'user:' });
```

## D1 Database

### wrangler.toml
```toml
[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "<your-d1-database-id>"
```

### Usage
```javascript
// Query
const result = await env.DB.prepare(
  'SELECT * FROM users WHERE id = ?'
).bind(userId).first();

// Insert
await env.DB.prepare(
  'INSERT INTO users (name, email) VALUES (?, ?)'
).bind(name, email).run();

// Multiple rows
const { results } = await env.DB.prepare(
  'SELECT * FROM users'
).all();
```

## Multi-Environment Setup

### wrangler.toml
```toml
name = "my-app-prod"
main = "src/index.js"
compatibility_date = "2024-01-01"
workers_dev = true

[env.dev]
name = "my-app-dev"

[env.staging]
name = "my-app-staging"
```

### Deployment Commands
```bash
wrangler deploy              # prod
wrangler deploy --env dev    # dev
wrangler deploy --env staging # staging
```

## Security Patterns

### Internal Apps (Cloudflare Access)
All internal apps require Cloudflare Access protection. The CI pipeline blocks deploys without it.

Configuration in `.github/app-config.yml`:
```yaml
visibility: internal  # requires Access protection
# OR
visibility: public    # no protection required
```

### Request Validation
```javascript
// Validate required fields
function validateRequest(body, required) {
  for (const field of required) {
    if (!body[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// API key validation
function validateApiKey(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${env.API_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null; // Valid
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
      return new Response(JSON.stringify({
        error: error.message || 'Internal server error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
```

## CORS Handling

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const response = await handleRequest(request, env);

    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }
};
```

## Verify Existing Patterns

```bash
# Find worker entry points
grep -r "export default" src/ --include="*.js"

# Find environment variable usage
grep -r "env\." src/ --include="*.js"

# Find KV operations
grep -r "\.get\|\.put\|\.delete" src/ --include="*.js"

# Find D1 operations
grep -r "\.prepare" src/ --include="*.js"
```

## Do Not

- No using `fetch()` without error handling
- No hardcoding secrets in code - use wrangler secret
- No deploying internal apps without Cloudflare Access
- No ignoring CORS for public APIs
- No storing sensitive data in KV without encryption consideration
