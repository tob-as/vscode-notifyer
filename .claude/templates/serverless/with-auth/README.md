# User Authentication Add-on

This add-on integrates [workers-users](https://github.com/devondragon/workers-users) for user management.

## Overview

workers-users provides:
- User registration
- Login/Logout
- Password reset
- Session management

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Your Worker    │────▶│   user-mgmt     │────▶│     D1          │
│  (with auth)    │     │   (Worker)      │     │   (Users DB)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │               ┌───────┴───────┐
        │               ▼               ▼
        │       ┌─────────────┐  ┌─────────────┐
        └──────▶│session-state│  │    KV       │
                │  (Worker)   │──│  (Sessions) │
                └─────────────┘  └─────────────┘
```

## Setup

### 1. Fork workers-users

```bash
# Fork https://github.com/devondragon/workers-users to your org

# Add as submodule
git submodule add https://github.com/YOUR_ORG/workers-users.git
```

### 2. Create Resources

```bash
# Create D1 database for users
wrangler d1 create users-db

# Create KV namespace for sessions
wrangler kv:namespace create "sessions"
```

### 3. Configure workers-users

Update `workers-users/packages/user-mgmt/wrangler.toml`:
```toml
[[d1_databases]]
binding = "usersDB"
database_name = "users"
database_id = "<your-d1-id>"
```

Update `workers-users/packages/session-state/wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "sessionstore"
id = "<your-kv-id>"
```

### 4. Deploy

```bash
cd workers-users
npm install
npx lerna run deploy
```

## Integration

### Check Authentication

```javascript
import { verifySession } from './auth-middleware.js';

export default {
  async fetch(request, env, ctx) {
    // Verify session for protected routes
    if (url.pathname.startsWith('/api/protected')) {
      const session = await verifySession(request, env);
      if (!session) {
        return new Response('Unauthorized', { status: 401 });
      }
      // session.userId available
    }
  }
};
```

### Auth Middleware

See `src/auth-middleware.js` for session verification helpers.

## Endpoints (from workers-users)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Register new user |
| `/api/login` | POST | Login |
| `/api/logout` | POST | Logout |
| `/api/forgot-password` | POST | Request password reset |
| `/api/reset-password` | POST | Reset password |
| `/api/session` | GET | Get current session |

## Security Notes

- Sessions stored in KV with TTL
- Passwords hashed with bcrypt
- CSRF protection recommended for production
- Use HTTPS only
