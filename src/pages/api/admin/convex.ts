import type { APIRoute } from 'astro';
import { verifyJWT } from '../../../middleware';

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const cronSecret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Validate admin session cookie
  const authCookie = cookies.get('admin_auth');
  if (!authCookie?.value || !ADMIN_PASSWORD) {
    console.error('[admin/convex] Missing cookie or ADMIN_PASSWORD env var');
    return new Response(JSON.stringify({ error: 'Unauthorized: missing session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = await verifyJWT(authCookie.value, ADMIN_PASSWORD);
  if (!payload) {
    console.error('[admin/convex] JWT verification failed');
    return new Response(JSON.stringify({ error: 'Unauthorized: invalid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (payload.exp < Date.now()) {
    console.error('[admin/convex] JWT expired', payload.exp, Date.now());
    return new Response(JSON.stringify({ error: 'Unauthorized: session expired' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!convexUrl || !cronSecret) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { method?: string; path?: string; args?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { method, path, args = {} } = body;

  if (!method || !path || (method !== 'query' && method !== 'mutation')) {
    return new Response(JSON.stringify({ error: 'Invalid method or path' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const endpoint = method === 'query' ? '/api/query' : '/api/mutation';
  const argsWithToken = { ...args, adminToken: cronSecret };

  try {
    const convexRes = await fetch(`${convexUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, args: argsWithToken }),
    });

    const convexJson = await convexRes.json();
    if (convexJson && 'error' in convexJson) {
      console.error('[admin/convex] Convex error:', path, convexJson.error);
    }
    return new Response(JSON.stringify(convexJson), {
      status: convexRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[admin/convex] Fetch/parse error:', path, error?.message);
    return new Response(JSON.stringify({ error: error.message || 'Convex request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
