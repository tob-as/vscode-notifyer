# End-to-End Testing with Playwright

## Overview

E2E tests verify the application works correctly in a real browser, including mobile viewports.

## Setup

### 1. Install Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### 2. Copy Config

Copy `playwright.config.template.ts` from templates to project root.

### 3. Create Test Directory

```
e2e/
├── smoke.spec.ts       # Basic smoke tests
├── auth.spec.ts        # Authentication flows
├── features/           # Feature-specific tests
│   └── *.spec.ts
└── fixtures/           # Test fixtures and helpers
    └── index.ts
```

---

## Cloudflare Access Service Token

Apps protected by Cloudflare Access require a Service Token for automated testing.

### Create Service Token

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Access** → **Service Auth** → **Service Tokens**
3. Click **Create Service Token**
4. Name: `e2e-tests-[app-name]`
5. Duration: 1 year (or as appropriate)
6. Click **Generate token**
7. **IMPORTANT**: Copy both values immediately (shown only once):
   - Client ID: `CF_ACCESS_CLIENT_ID`
   - Client Secret: `CF_ACCESS_CLIENT_SECRET`

### Configure Access Policy

1. Go to **Access** → **Applications**
2. Select your application
3. Edit the Access Policy
4. Add a new rule:
   - **Rule Name**: `E2E Tests`
   - **Action**: Service Auth
   - **Include**: Service Token = `e2e-tests-[app-name]`

### Store Secrets

**GitHub Actions:**
```yaml
env:
  CF_ACCESS_CLIENT_ID: ${{ secrets.CF_ACCESS_CLIENT_ID }}
  CF_ACCESS_CLIENT_SECRET: ${{ secrets.CF_ACCESS_CLIENT_SECRET }}
```

**Local Development:**
```bash
# .env.local (git-ignored)
CF_ACCESS_CLIENT_ID=your-client-id
CF_ACCESS_CLIENT_SECRET=your-client-secret
```

---

## Writing Tests

### Basic Test

```typescript
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/My App/);
});
```

### Mobile Test

```typescript
test.describe('Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('navigation menu works on mobile', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('nav')).toBeVisible();
  });
});
```

### Authenticated Test

```typescript
test('protected page accessible with service token', async ({ page }) => {
  // Service token headers are automatically included via config
  await page.goto('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

---

## Running Tests

```bash
# All tests
npx playwright test

# Specific browser
npx playwright test --project=chromium

# Mobile only
npx playwright test --project=mobile-chrome

# With UI
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

---

## CI Integration

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [main, staging]
  pull_request:

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test
        env:
          TEST_BASE_URL: ${{ vars.STAGING_URL }}
          CF_ACCESS_CLIENT_ID: ${{ secrets.CF_ACCESS_CLIENT_ID }}
          CF_ACCESS_CLIENT_SECRET: ${{ secrets.CF_ACCESS_CLIENT_SECRET }}

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Best Practices

1. **Mobile First**: Always test mobile viewports
2. **Data-TestID**: Use `data-testid` attributes for selectors
3. **No Sleep**: Use Playwright's built-in waiting mechanisms
4. **Isolation**: Each test should be independent
5. **CI Artifacts**: Save screenshots/videos on failure
