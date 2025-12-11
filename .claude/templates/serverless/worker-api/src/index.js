/**
 * {{APP_NAME}} - Cloudflare Worker API
 *
 * REST API template with structured routing and error handling.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS headers for API
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

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
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }
  }
};

async function handleRequest(request, env, url) {
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

function jsonResponse(data, status = 200, additionalHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...additionalHeaders
    }
  });
}
