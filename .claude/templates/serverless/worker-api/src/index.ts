/**
 * {{APP_NAME}} - Cloudflare Worker API
 *
 * REST API template with structured routing and error handling.
 */

export interface Env {
  // Add your bindings here, e.g.:
  // MY_KV: KVNamespace;
  // MY_DB: D1Database;
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data: unknown, status = 200, additionalHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...additionalHeaders
    }
  });
}

async function handleRequest(request: Request, env: Env, url: URL): Promise<Response> {
  const { pathname } = url;
  const method = request.method;

  // Health check
  if (pathname === '/health') {
    return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
  }

  // API version
  if (pathname === '/api/v1') {
    return jsonResponse({
      name: '{{APP_NAME}}',
      version: '1.0.0',
      endpoints: ['/api/v1/health', '/api/v1/example']
    });
  }

  // Example resource
  if (pathname === '/api/v1/example') {
    if (method === 'GET') {
      return jsonResponse({ data: 'example response' });
    }
    if (method === 'POST') {
      const body = await request.json();
      return jsonResponse({ received: body }, 201);
    }
  }

  // TODO: Add your routes here

  return jsonResponse({ error: 'Not found' }, 404);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const response = await handleRequest(request, env, url);
      // Add CORS headers to all responses
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return jsonResponse({ error: message }, 500, corsHeaders);
    }
  }
};
