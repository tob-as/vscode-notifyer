# Tech Stack Clarification

## RedwoodSDK vs Redwood GraphQL

**CRITICAL:** We use **RedwoodSDK**, NOT Redwood GraphQL.

| Framework | Description | Status | Our Usage |
|-----------|-------------|--------|-----------|
| **Redwood GraphQL**<br/>(RedwoodJS) | GraphQL-first fullstack framework with Prisma ORM | Winding down,<br/>migrating to Cedar fork | ❌ **NOT USED** |
| **RedwoodSDK**<br/>(rwsdk) | Vite plugin for React on Cloudflare Workers | Active 1.x,<br/>official Cloudflare support | ✅ **OUR DEFAULT** |

---

## RedwoodSDK Details

### What It Is

RedwoodSDK is a **Vite plugin** that enables fullstack React applications on Cloudflare Workers.

### Key Features

- **React Server Components (RSC)**
- **Server Functions** for backend logic
- **Server-Side Rendering (SSR)**
- **Cloudflare-native** (Workers, D1, KV, R2)
- **Vite-based** bundling and dev server

### Version

- **Current:** 1.x (stable)
- **Migration:** 0.x → 1.x documented and complete
- **Maintained by:** Cloudflare

### Runtime

- **Platform:** Cloudflare Workers (edge compute)
- **Database:** Cloudflare D1 (SQLite at edge)
- **Storage:** R2 (object), KV (key-value)
- **Auth:** Cloudflare Access (Zero Trust)

---

## No Lifecycle Risk

### Why RedwoodSDK is Safe

1. **Maintained by Cloudflare** as part of Workers ecosystem
2. **No dependency** on Redwood GraphQL's lifecycle
3. **Official Cloudflare framework** with long-term support
4. **1.x is stable** with clear migration path

### Redwood GraphQL Sunset

Redwood GraphQL (the original RedwoodJS) is transitioning to a community fork (Cedar).
**This does NOT affect RedwoodSDK** - they are separate projects with different maintainers.

---

## When to Use What

| Use Case | Framework |
|----------|-----------|
| Fullstack app with UI | **RedwoodSDK** |
| API-only Worker | **Hono** or vanilla Worker |
| Static site | **Cloudflare Pages** |
| GraphQL API | **NOT Redwood GraphQL** - use Hono + GraphQL Yoga |

---

## Tech Stack Overview

### Frontend

- **React 18** with Server Components
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **TypeScript** strict mode

### Backend

- **Cloudflare Workers** (serverless edge compute)
- **Hono** for API routes (serverless projects)
- **RedwoodSDK** for fullstack (includes routing)

### Data

- **Cloudflare D1** (SQLite database)
- **Prisma** ORM for type-safe queries
- **Cloudflare KV** for caching
- **Cloudflare R2** for file storage

### Auth & Security

- **Cloudflare Access** (Zero Trust authentication)
- **Google Auth** for login
- All apps internal-only by default

### Testing

- **Vitest** for unit/integration tests
- **React Testing Library** for components
- **Playwright** for E2E tests

### CI/CD

- **GitHub Actions** for automation
- **Quality gates** (lint, format, typecheck, test, build)
- **Automated deployment** to Cloudflare

### Email

- **Resend** for transactional emails
- Integrated per-project (not platform service yet)

---

## References

- [RedwoodSDK Docs](https://docs.rwsdk.com/)
- [Cloudflare RedwoodSDK Guide](https://developers.cloudflare.com/workers/frameworks/redwood/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
