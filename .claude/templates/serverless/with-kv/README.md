# KV Storage Add-on

Cloudflare KV is a global, low-latency key-value store.

## Setup

### 1. Create KV Namespace

```bash
# Create for each environment
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "CACHE" --env dev
wrangler kv:namespace create "CACHE" --env staging
```

### 2. Update wrangler.toml

Add the namespace IDs from the output:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "<prod-kv-id>"

[env.dev]
[[env.dev.kv_namespaces]]
binding = "CACHE"
id = "<dev-kv-id>"

[env.staging]
[[env.staging.kv_namespaces]]
binding = "CACHE"
id = "<staging-kv-id>"
```

## Usage

```javascript
// Read
const value = await env.CACHE.get('key');
const jsonValue = await env.CACHE.get('key', 'json');

// Write
await env.CACHE.put('key', 'value');
await env.CACHE.put('key', JSON.stringify(data));

// Write with TTL (expires in 1 hour)
await env.CACHE.put('key', 'value', { expirationTtl: 3600 });

// Delete
await env.CACHE.delete('key');

// List keys
const { keys } = await env.CACHE.list({ prefix: 'user:' });
```

## Best Practices

- Use prefixes for organization: `user:123`, `session:abc`
- Set TTL for cache entries
- KV is eventually consistent - not for real-time sync
- Max value size: 25MB
