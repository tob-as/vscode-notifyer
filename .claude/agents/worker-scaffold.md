---
name: worker-scaffold
description: Create Cloudflare Worker project scaffold with wrangler.toml, security config, and base structure.
tools: Read, Write, Edit
skills: cloudflare-workers-patterns
model: sonnet
---

# Cloudflare Worker Scaffold Agent

Create the base project structure for a Cloudflare Worker.

## File Ownership

Create ONLY:
- `wrangler.toml`
- `src/index.js` (minimal starter)
- `.github/app-config.yml`
- `package.json` (if needed)

## wrangler.toml Template

```toml
name = "{WORKER_NAME}-prod"
main = "src/index.js"
compatibility_date = "2024-01-01"
workers_dev = true

[env.dev]
name = "{WORKER_NAME}-dev"

[env.staging]
name = "{WORKER_NAME}-staging"
```

**CRITICAL:** Replace `{WORKER_NAME}` with the actual project name (lowercase, hyphens).

## src/index.js (Minimal)

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Hello!', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
```

## .github/app-config.yml

```yaml
# App Security Configuration
# visibility: internal | public
# - internal: Requires Cloudflare Access protection (default)
# - public: No Access protection required
visibility: internal
```

## package.json (Optional)

Only create if dependencies are needed:

```json
{
  "name": "{WORKER_NAME}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "deploy:dev": "wrangler deploy --env dev",
    "deploy:staging": "wrangler deploy --env staging"
  }
}
```

## Naming Convention

Worker names should be:
- Lowercase
- Hyphen-separated
- Descriptive

Examples:
- `user-api`
- `admin-dashboard`
- `data-processor`

## Do Not

- Do not create workflow files (use templates)
- Do not create Terraform files (use worker-infra agent)
- Do not create complex routing (use worker-logic agent)
- Do not create UI (use worker-ui agent)
