/**
 * Authentication Middleware for workers-users integration
 *
 * Usage:
 *   import { verifySession, requireAuth } from './auth-middleware.js';
 *
 *   // Check session
 *   const session = await verifySession(request, env);
 *
 *   // Or use middleware
 *   const authResponse = await requireAuth(request, env);
 *   if (authResponse) return authResponse; // Returns 401 if not authenticated
 */

/**
 * Get session cookie from request
 * @param {Request} request
 * @returns {string|null}
 */
function getSessionCookie(request) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));

  return sessionCookie ? sessionCookie.split('=')[1] : null;
}

/**
 * Verify session with session-state worker
 * @param {Request} request
 * @param {object} env - Must have SESSION_STATE_URL or SESSION_STATE service binding
 * @returns {object|null} Session data or null if invalid
 */
export async function verifySession(request, env) {
  const sessionId = getSessionCookie(request);
  if (!sessionId) return null;

  try {
    // Option 1: Service binding (recommended)
    if (env.SESSION_STATE) {
      const response = await env.SESSION_STATE.fetch(
        new Request(`https://session/get/${sessionId}`)
      );
      if (!response.ok) return null;
      return await response.json();
    }

    // Option 2: HTTP call to session-state worker
    if (env.SESSION_STATE_URL) {
      const response = await fetch(`${env.SESSION_STATE_URL}/get/${sessionId}`);
      if (!response.ok) return null;
      return await response.json();
    }

    // Option 3: Direct KV access (if session KV is bound)
    if (env.SESSIONS_KV) {
      const session = await env.SESSIONS_KV.get(sessionId, 'json');
      return session;
    }

    console.error('No session verification method configured');
    return null;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

/**
 * Middleware that returns 401 if not authenticated
 * @param {Request} request
 * @param {object} env
 * @returns {Response|null} Returns Response if unauthorized, null if OK
 */
export async function requireAuth(request, env) {
  const session = await verifySession(request, env);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return null; // Authenticated, continue
}

/**
 * Extract user info from session
 * @param {Request} request
 * @param {object} env
 * @returns {object|null} User info { userId, email, ... }
 */
export async function getCurrentUser(request, env) {
  const session = await verifySession(request, env);
  if (!session) return null;

  return {
    userId: session.userId,
    email: session.email,
    ...session
  };
}
