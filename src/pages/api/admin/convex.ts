import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const cronSecret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Validate admin session cookie (middleware already protects this route, but double-check)
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

  const client = new ConvexHttpClient(convexUrl);
  const argsWithToken = { ...args, adminToken: cronSecret };

  try {
    let value: unknown;
    if (method === 'query') {
      value = await client.query(path as any, argsWithToken as any);
    } else {
      value = await client.mutation(path as any, argsWithToken as any);
    }
    return new Response(JSON.stringify({ value }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Convex request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
