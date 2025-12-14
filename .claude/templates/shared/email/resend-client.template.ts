/**
 * Resend Email Client Template
 *
 * Copy to: src/lib/email.ts
 * Dependencies: npm install resend
 */

import { Resend } from 'resend';

// Update these for your app
const FROM_EMAIL = 'App <noreply@yourdomain.com>';
const FROM_NAME = 'Your App';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface EmailResult {
  id: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(
  apiKey: string,
  options: EmailOptions
): Promise<EmailResult> {
  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    reply_to: options.replyTo,
  });

  if (error) {
    throw new Error(`Email failed: ${error.message}`);
  }

  return { id: data!.id };
}

/**
 * Email templates
 */
export const templates = {
  welcome: (name: string) => ({
    subject: `Welcome to ${FROM_NAME}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1>Welcome, ${escapeHtml(name)}!</h1>
          <p>Thanks for signing up. We're excited to have you.</p>
        </body>
      </html>
    `,
  }),

  passwordReset: (resetUrl: string) => ({
    subject: `Reset your ${FROM_NAME} password`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password:</p>
          <p>
            <a href="${escapeHtml(resetUrl)}" style="
              background: #3b82f6;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              display: inline-block;
            ">Reset Password</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
        </body>
      </html>
    `,
  }),

  notification: (title: string, message: string) => ({
    subject: title,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(message)}</p>
        </body>
      </html>
    `,
  }),
};

/**
 * Escape HTML to prevent XSS in email templates
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
