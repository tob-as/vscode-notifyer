# Sentry Integration

Error monitoring for Cloudflare Workers and React apps.

## Setup

### 1. Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and create a new project
2. Select "JavaScript" for frontend or "Cloudflare" for workers
3. Copy the DSN

### 2. Add Secret

```bash
# Add DSN to wrangler secrets
wrangler secret put SENTRY_DSN --env dev
wrangler secret put SENTRY_DSN --env staging
wrangler secret put SENTRY_DSN --env prod
```

### 3. Frontend Integration

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 0.1, // 10% of transactions
});

// Wrap app with error boundary
root.render(
  <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
    <App />
  </Sentry.ErrorBoundary>
);
```

### 4. Worker Integration

```typescript
// src/index.ts
interface Env {
  SENTRY_DSN: string;
}

async function reportToSentry(
  error: Error,
  request: Request,
  env: Env
): Promise<void> {
  // Simple Sentry error reporting
  const sentryPayload = {
    exception: {
      values: [
        {
          type: error.name,
          value: error.message,
          stacktrace: {
            frames: parseStacktrace(error.stack || ""),
          },
        },
      ],
    },
    request: {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
    },
    tags: {
      environment: env.ENVIRONMENT || "production",
    },
  };

  await fetch(
    `https://sentry.io/api/PROJECT_ID/store/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": `Sentry sentry_key=${env.SENTRY_DSN.split("@")[0].split("//")[1]}`,
      },
      body: JSON.stringify(sentryPayload),
    }
  );
}

function parseStacktrace(stack: string) {
  return stack.split("\n").map((line) => ({
    filename: line,
    function: "unknown",
  }));
}

// Usage in worker
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      // Report to Sentry in background
      ctx.waitUntil(reportToSentry(error as Error, request, env));

      // Return error response
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
```

### 5. Using @sentry/cloudflare (Recommended)

```bash
npm install @sentry/cloudflare
```

```typescript
// src/index.ts
import * as Sentry from "@sentry/cloudflare";

export default {
  async fetch(request, env, ctx) {
    return Sentry.withSentry(
      {
        dsn: env.SENTRY_DSN,
        tracesSampleRate: 0.1,
      },
      async () => {
        // Your handler code
        return await handleRequest(request, env);
      }
    );
  },
};
```

## GitHub Actions Integration

Add to your workflow:

```yaml
- name: Create Sentry Release
  uses: getsentry/action-release@v1
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: your-org
    SENTRY_PROJECT: your-project
  with:
    environment: ${{ steps.env.outputs.env_name }}
```

## Best Practices

1. **Sample Rate**: Keep `tracesSampleRate` low (0.1 = 10%) to avoid hitting quotas
2. **Environment Tags**: Always set environment to distinguish dev/staging/prod
3. **Source Maps**: Upload source maps for readable stack traces
4. **Error Boundaries**: Use React error boundaries to catch rendering errors
5. **Background Reporting**: Use `ctx.waitUntil()` to not block response
