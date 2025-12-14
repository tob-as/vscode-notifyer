/**
 * {{APP_NAME}} - Cloudflare Worker
 *
 * Minimal starter template. Customize the fetch handler for your needs.
 */

export interface Env {
  // Add your bindings here, e.g.:
  // MY_KV: KVNamespace;
  // MY_DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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
