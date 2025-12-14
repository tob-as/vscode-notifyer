/**
 * {{APP_NAME}} - Cloudflare Worker with Embedded UI
 *
 * This template includes a standalone HTML UI embedded in the worker.
 * The badge injection in CI will automatically add environment indicators.
 */

const STANDALONE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{APP_NAME}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .container {
      max-width: 600px;
      padding: 2rem;
      text-align: center;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(90deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #a0aec0;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(255,255,255,0.1);
      border-radius: 999px;
      font-size: 0.875rem;
    }
    .status::before {
      content: '';
      width: 8px;
      height: 8px;
      background: #68d391;
      border-radius: 50%;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>{{APP_NAME}}</h1>
    <p>Your serverless application is running on Cloudflare Workers.</p>
    <div class="status">System Online</div>
  </div>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API routes
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env, url);
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Serve the UI
    return new Response(STANDALONE_HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
};

async function handleAPI(request, env, url) {
  // TODO: Add your API routes here
  // Example:
  // if (url.pathname === '/api/data') {
  //   return new Response(JSON.stringify({ data: 'example' }), {
  //     headers: { 'Content-Type': 'application/json' }
  //   });
  // }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
