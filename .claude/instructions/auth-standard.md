# Authentication Standard

## Cloudflare Access First

All TOB applications use **Cloudflare Access** as the primary authentication layer.

### Why Cloudflare Access?

- Zero Trust security model
- SSO integration (Google Workspace, etc.)
- No session management code needed
- Automatic JWT validation at the edge
- Per-environment access policies

### How It Works

1. **User visits app** → Cloudflare intercepts request
2. **Access checks identity** → User authenticates via IdP
3. **JWT injected** → `Cf-Access-Jwt-Assertion` header added
4. **Worker receives request** → JWT already validated

### Extracting User Info

```typescript
// src/lib/auth.ts
export interface AccessUser {
  email: string;
  sub: string;  // Unique user ID
  iat: number;
  exp: number;
}

export function getAccessUser(request: Request): AccessUser | null {
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) return null;

  // JWT is already validated by Cloudflare Access
  // Just decode the payload (no verification needed)
  const [, payload] = jwt.split('.');
  const decoded = JSON.parse(atob(payload));

  return {
    email: decoded.email,
    sub: decoded.sub,
    iat: decoded.iat,
    exp: decoded.exp
  };
}
```

### Usage in Worker

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const user = getAccessUser(request);

    if (!user) {
      // This shouldn't happen if Access is configured correctly
      return new Response('Unauthorized', { status: 401 });
    }

    // User is authenticated
    console.log(`Request from: ${user.email}`);

    // ... handle request
  }
};
```

## Role-Based Access (RBAC)

For apps needing roles beyond "authenticated":

### D1-Based User Roles

```sql
-- migrations/0001_users.sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_email ON users(email);
```

### Role Check

```typescript
export async function getUserWithRole(request: Request, env: Env) {
  const accessUser = getAccessUser(request);
  if (!accessUser) return null;

  const dbUser = await env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(accessUser.email).first();

  if (!dbUser) {
    // Auto-create user on first access
    await env.DB.prepare(
      'INSERT INTO users (id, email, role) VALUES (?, ?, ?)'
    ).bind(crypto.randomUUID(), accessUser.email, 'user').run();

    return { ...accessUser, role: 'user' };
  }

  return { ...accessUser, role: dbUser.role };
}

export function requireRole(user: { role: string }, required: string): boolean {
  const hierarchy = ['user', 'editor', 'admin'];
  return hierarchy.indexOf(user.role) >= hierarchy.indexOf(required);
}
```

## Environment-Based Access Policies

| Environment | Access Policy |
|-------------|---------------|
| Production | Specific email addresses or groups |
| Staging | All `@original-body.dev` emails |
| Development | Developer emails only |

Configure in Terraform:
```hcl
# infra/cloudflare-access/main.tf
resource "cloudflare_access_policy" "prod" {
  application_id = cloudflare_access_application.app.id
  zone_id        = var.zone_id
  name           = "Production Access"
  precedence     = 1
  decision       = "allow"

  include {
    email = ["approved@example.com"]
    email_domain = ["original-body.dev"]
  }
}
```

## When NOT to Use Cloudflare Access

**Public APIs** that need to be called by external services:
- Use API keys stored in secrets
- Validate via custom middleware

```typescript
export function validateApiKey(request: Request, env: Env): boolean {
  const apiKey = request.headers.get('X-API-Key');
  return apiKey === env.API_KEY;
}
```

## workers-users (Optional)

For apps needing external user management (non-SSO users):
- Self-registration
- Password authentication
- Email verification

This is **separate** from Cloudflare Access and should be used only when:
1. External customers need accounts
2. Public registration is required
3. SSO is not available for the user base

## Do Not

- Roll your own JWT validation (Access does this)
- Store passwords for internal users (use SSO)
- Skip Access for internal tools
- Hardcode user lists in code (use D1)
