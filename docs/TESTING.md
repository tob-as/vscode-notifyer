# Testing Guide

All TOB projects use Vitest with Cloudflare Workers pool.

## Setup

Testing infrastructure is included in project templates. For existing projects:

```bash
npm install -D vitest @cloudflare/vitest-pool-workers
```

## Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import { cloudflareWorkersPool } from '@cloudflare/vitest-pool-workers/config';

export default defineConfig({
  test: {
    pool: cloudflareWorkersPool(),
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.jsonc' }
      }
    }
  }
});
```

### Package Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

## Running Tests

```bash
# Run once
npm test

# Watch mode
npm run test:watch

# Type check only
npm run typecheck
```

## Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

## CI Integration

Tests run automatically before build in CI:

1. `npm run typecheck` - Fails deployment if type errors
2. `npm test` - Fails deployment if tests fail
3. `npm run build` - Only runs if above pass

## Test Placement

```
src/
  __tests__/
    example.test.ts
    api.test.ts
  routes/
    health.ts
    items.ts
```

Keep tests in `src/__tests__/` directory.

## Do Not

- Skip tests to deploy faster
- Mock Cloudflare bindings unnecessarily (pool handles this)
- Write tests after deployment
