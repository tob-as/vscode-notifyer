/**
 * {{APP_NAME}} - Cloudflare Worker
 *
 * Minimal starter template. Customize the fetch handler for your needs.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // TODO: Add your routes here

    // Default response
    return new Response('Hello from {{APP_NAME}}!', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
