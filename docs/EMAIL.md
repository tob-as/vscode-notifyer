# Email Integration with Resend

## Overview

Transactional email for Cloudflare Workers using [Resend](https://resend.com/).

## Quick Start

### 1. Install

```bash
npm install resend
```

### 2. Get API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys
3. Create new key with send permission

### 3. Store Secret

**Local:**
```bash
# .dev.vars (git-ignored)
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Production:**
```bash
wrangler secret put RESEND_API_KEY
```

### 4. Send Email

```typescript
import { Resend } from 'resend';

const resend = new Resend(env.RESEND_API_KEY);

await resend.emails.send({
  from: 'App <noreply@yourdomain.com>',
  to: 'user@example.com',
  subject: 'Hello',
  html: '<p>Welcome!</p>',
});
```

---

## Domain Verification

For production, verify your domain:

1. Add domain in Resend dashboard
2. Add DNS records:
   - **DKIM** (TXT record)
   - **SPF** (TXT record)
   - **DMARC** (TXT record, optional but recommended)
3. Wait for verification (usually minutes)
4. Update `from` address to your verified domain

---

## Templates

Copy from `.claude/templates/shared/email/`:

| File | Purpose |
|------|---------|
| `resend-client.template.ts` | Email client with common templates |
| `email-queue.template.ts` | Background sending via Queues |

---

## Async Sending with Queues

For non-blocking email, use Cloudflare Queues:

### 1. Configure wrangler.toml

```toml
[[queues.producers]]
queue = "email-queue"
binding = "EMAIL_QUEUE"

[[queues.consumers]]
queue = "email-queue"
max_batch_size = 10
max_retries = 3
```

### 2. Queue Email in Route

```typescript
await env.EMAIL_QUEUE.send({
  to: user.email,
  subject: 'Welcome!',
  html: '<p>Thanks for signing up</p>',
});

// Returns immediately, email sent in background
```

### 3. Process Queue

```typescript
export default {
  async queue(batch, env) {
    const resend = new Resend(env.RESEND_API_KEY);
    for (const msg of batch.messages) {
      await resend.emails.send({ from: '...', ...msg.body });
      msg.ack();
    }
  },
};
```

---

## Rate Limits

| Plan | Daily | Monthly |
|------|-------|---------|
| Free | 100 | 3,000 |
| Pro | 50,000 | - |

Monitor usage in Resend dashboard.

---

## Error Handling

```typescript
const { data, error } = await resend.emails.send({ ... });

if (error) {
  console.error('Email failed:', error.message);
  // Don't throw - log and continue
  // User action should succeed even if email fails
}
```

---

## Security

- NEVER commit API keys
- Use `.dev.vars` locally (git-ignored)
- Use `wrangler secret` for production
- Escape user input in templates (XSS prevention)

---

## Common Email Types

| Type | When |
|------|------|
| Welcome | After signup |
| Password Reset | User requests reset |
| Email Verification | Confirm email ownership |
| Notification | Activity alerts |
| Receipt | After purchase |

---

## Testing

### Local Development

Resend delivers real emails even in development. Options:

1. **Use test email** - Send to your own email
2. **Check Resend logs** - Dashboard shows all sent emails
3. **Mock in tests** - Mock `resend.emails.send` in unit tests

### Integration Test

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'test-id' } }),
    },
  })),
}));
```
