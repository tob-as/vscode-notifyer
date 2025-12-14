# Email with Resend Skill

## Purpose

Send transactional emails using Resend API from Cloudflare Workers.

## When to Use

- Welcome emails after signup
- Password reset emails
- Notification emails
- Receipt/confirmation emails

## Dependencies

```bash
npm install resend
```

## Setup

### 1. Store API Key

**Local Development:**
```bash
# .dev.vars (git-ignored)
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Production:**
```bash
wrangler secret put RESEND_API_KEY
# Paste: re_xxxxxxxxxxxxx
```

### 2. Add to Worker Bindings

```toml
# wrangler.toml
[vars]
# RESEND_API_KEY comes from secrets, not vars
```

### 3. Type Definition

```typescript
// src/types/env.d.ts
interface Env {
  RESEND_API_KEY: string;
}
```

## Usage Pattern

### Basic Email

```typescript
import { Resend } from 'resend';

export async function sendEmail(env: Env, options: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = new Resend(env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: 'App <noreply@yourdomain.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    console.error('Email failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
```

### With Template

```typescript
// src/emails/welcome.ts
export function welcomeEmail(name: string) {
  return {
    subject: `Welcome, ${name}!`,
    html: `
      <h1>Welcome to Our App</h1>
      <p>Hi ${name},</p>
      <p>Thanks for signing up!</p>
    `,
  };
}

// Usage
const email = welcomeEmail(user.name);
await sendEmail(env, { to: user.email, ...email });
```

### Queue for Background Sending

For non-blocking email sending, use Cloudflare Queues:

```typescript
// src/queues/email.ts
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

// Producer (in route handler)
await env.EMAIL_QUEUE.send({
  to: user.email,
  subject: 'Welcome!',
  html: '<p>Thanks for signing up</p>',
});

// Consumer (in queue handler)
export default {
  async queue(batch: MessageBatch<EmailMessage>, env: Env) {
    const resend = new Resend(env.RESEND_API_KEY);

    for (const message of batch.messages) {
      try {
        await resend.emails.send({
          from: 'App <noreply@yourdomain.com>',
          ...message.body,
        });
        message.ack();
      } catch (error) {
        message.retry();
      }
    }
  },
};
```

## Domain Setup

1. Add domain in Resend dashboard
2. Add DNS records (DKIM, SPF, DMARC)
3. Verify domain
4. Update `from` address to use verified domain

## Rate Limits

Resend free tier:
- 100 emails/day
- 3,000 emails/month

For higher volume, upgrade plan.

## Error Handling

```typescript
try {
  await sendEmail(env, { to, subject, html });
} catch (error) {
  // Log but don't fail the request
  console.error('Email failed, user action succeeded:', error);
}
```

## Do Not

- Store API key in code or wrangler.toml
- Send emails synchronously in critical paths
- Skip domain verification for production
- Ignore rate limits
