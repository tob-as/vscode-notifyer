# Testing Setup Skill

## Purpose

Set up comprehensive testing infrastructure: unit, component, integration, and E2E tests.

## Testing Pyramid

```
        /  E2E  \      Few, critical paths (Playwright)
       /  Integ  \     API/DB tests (Vitest)
      /   Unit    \    Many, fast (Vitest)
```

## Dependencies

```bash
npm install --save-dev \
  vitest \
  @vitejs/plugin-react \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @playwright/test \
  @vitest/coverage-v8
```

## Setup Steps

### 1. Unit/Component Tests (Vitest)

Copy from templates:
- `vitest.config.template.ts` → `vitest.config.ts`
- `test-setup.template.ts` → `src/test/setup.ts`

### 2. E2E Tests (Playwright)

Copy:
- `playwright.config.template.ts` → `playwright.config.ts`

Install browsers:
```bash
npx playwright install
```

Create E2E directory:
```
e2e/
├── smoke.spec.ts
└── fixtures/
```

### 3. Add Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Test Patterns

### Unit Test

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/utils/date';

describe('formatDate', () => {
  it('formats ISO date correctly', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
  });
});
```

### Component Test

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### Integration Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestContext } from '@/test/fixtures';

describe('User API', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestContext();
  });

  it('creates a user', async () => {
    const response = await ctx.fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(response.status).toBe(201);
    const user = await response.json();
    expect(user.name).toBe('Test');
  });
});
```

### E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('user can log in and see dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

## Coverage Thresholds

Enforce minimum coverage in CI:
- Lines: 60%
- Branches: 60%
- Functions: 60%

Increase thresholds as codebase matures.

## Do Not

- Write tests that depend on each other
- Use `sleep` or fixed timeouts
- Test implementation details
- Skip mobile viewport tests
