import type { APIRoute } from 'astro';

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const cronSecret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Validate admin session cookie
  const authCookie = cookies.get('admin_auth');
  if (!authCookie?.value) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
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
    return new Response(JSON.stringify(convexJson), {
      status: convexRes.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Convex request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
