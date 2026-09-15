import type { APIRoute } from 'astro';
import { verifyAdminSession } from '../../../middleware';
import { getSecret } from '../../../lib/security';

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  // Validate admin session cookie (JWT signed with ADMIN_JWT_SECRET)
  if (!(await verifyAdminSession(cookies, locals))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const secret = getSecret(locals, 'CRON_SECRET');
  if (!convexUrl || !secret) {
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
  const argsWithToken = { ...args, adminToken: secret };

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
