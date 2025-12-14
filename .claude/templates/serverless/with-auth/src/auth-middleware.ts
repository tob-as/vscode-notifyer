/**
 * Authentication Middleware for workers-users integration
 *
 * Usage:
 *   import { verifySession, requireAuth } from './auth-middleware';
 *
 *   // Check session
 *   const session = await verifySession(request, env);
 *
 *   // Or use middleware
 *   const authResponse = await requireAuth(request, env);
 *   if (authResponse) return authResponse; // Returns 401 if not authenticated
 */

export interface SessionData {
  userId: string;
  email: string;
  [key: string]: unknown;
}

export interface AuthEnv {
  SESSION_STATE?: Fetcher;
  SESSION_STATE_URL?: string;
  SESSIONS_KV?: KVNamespace;
}

/**
 * Get session cookie from request
 */
function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));

  return sessionCookie ? sessionCookie.split('=')[1] : null;
}

/**
 * Verify session with session-state worker
 */
export async function verifySession(request: Request, env: AuthEnv): Promise<SessionData | null> {
  const sessionId = getSessionCookie(request);
  if (!sessionId) return null;

  try {
    // Option 1: Service binding (recommended)
    if (env.SESSION_STATE) {
      const response = await env.SESSION_STATE.fetch(
        new Request(`https://session/get/${sessionId}`)
      );
      if (!response.ok) return null;
      return await response.json() as SessionData;
    }

    // Option 2: HTTP call to session-state worker
    if (env.SESSION_STATE_URL) {
      const response = await fetch(`${env.SESSION_STATE_URL}/get/${sessionId}`);
      if (!response.ok) return null;
      return await response.json() as SessionData;
    }

    // Option 3: Direct KV access (if session KV is bound)
    if (env.SESSIONS_KV) {
      const session = await env.SESSIONS_KV.get(sessionId, 'json');
      return session as SessionData | null;
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
 */
export async function requireAuth(request: Request, env: AuthEnv): Promise<Response | null> {
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
 */
export async function getCurrentUser(request: Request, env: AuthEnv): Promise<SessionData | null> {
  return await verifySession(request, env);
}
