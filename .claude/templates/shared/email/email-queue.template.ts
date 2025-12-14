/**
 * Email Queue Handler Template
 *
 * For background/async email sending via Cloudflare Queues.
 *
 * Setup in wrangler.toml:
 * [[queues.producers]]
 * queue = "email-queue"
 * binding = "EMAIL_QUEUE"
 *
 * [[queues.consumers]]
 * queue = "email-queue"
 * max_batch_size = 10
 * max_retries = 3
 */

import { Resend } from 'resend';

// Message types for the queue
export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

// Environment bindings
interface Env {
  RESEND_API_KEY: string;
  EMAIL_QUEUE: Queue<EmailMessage>;
}

// Default sender - update for your domain
const FROM_EMAIL = 'App <noreply@yourdomain.com>';

/**
 * Queue consumer: processes email messages
 */
export async function handleEmailQueue(
  batch: MessageBatch<EmailMessage>,
  env: Env
): Promise<void> {
  const resend = new Resend(env.RESEND_API_KEY);

  for (const message of batch.messages) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: message.body.to,
        subject: message.body.subject,
        html: message.body.html,
        text: message.body.text,
        reply_to: message.body.replyTo,
      });

      if (error) {
        console.error(`Email failed: ${error.message}`, {
          to: message.body.to,
          subject: message.body.subject,
        });
        message.retry();
      } else {
        console.log(`Email sent: ${data!.id}`, {
          to: message.body.to,
          subject: message.body.subject,
        });
        message.ack();
      }
    } catch (error) {
      console.error('Email queue error:', error);
      message.retry();
    }
  }
}

/**
 * Helper to queue an email (use in route handlers)
 *
 * @example
 * await queueEmail(env.EMAIL_QUEUE, {
 *   to: user.email,
 *   subject: 'Welcome!',
 *   html: '<p>Thanks for signing up</p>',
 * });
 */
export async function queueEmail(
  queue: Queue<EmailMessage>,
  email: EmailMessage
): Promise<void> {
  await queue.send(email);
}

/**
 * Export for worker binding
 *
 * In your main worker:
 *
 * import { handleEmailQueue } from './queues/email';
 *
 * export default {
 *   async fetch(request, env) { ... },
 *   async queue(batch, env) {
 *     await handleEmailQueue(batch, env);
 *   },
 * };
 */
