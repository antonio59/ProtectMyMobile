import type { APIRoute } from 'astro';
import { verifyJWT } from '../../../middleware';

const ALLOWED_PATHS = [
  '/api/admin/seed-theft-data',
  '/api/admin/scrape-wdtk',
  '/api/admin/fetch-police-uk',
  '/api/admin/test-email',
  '/api/cron/monitor-wdtk',
  '/api/cron/send-foi-requests',
];

const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

export const GET: APIRoute = async ({ cookies, url }) => {
  // Validate admin session cookie
  const authCookie = cookies.get('admin_auth');
  if (!authCookie?.value || !ADMIN_PASSWORD) {
    console.error('[admin/proxy] Missing cookie or ADMIN_PASSWORD env var');
    return new Response(JSON.stringify({ error: 'Unauthorized: missing session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = await verifyJWT(authCookie.value, ADMIN_PASSWORD);
  if (!payload) {
    console.error('[admin/proxy] JWT verification failed');
    return new Response(JSON.stringify({ error: 'Unauthorized: invalid session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (payload.exp < Date.now()) {
    console.error('[admin/proxy] JWT expired', payload.exp, Date.now());
    return new Response(JSON.stringify({ error: 'Unauthorized: session expired' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const targetPath = url.searchParams.get('path');
  if (!targetPath || !ALLOWED_PATHS.includes(targetPath)) {
    return new Response(JSON.stringify({ error: 'Invalid path' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cronSecret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
  if (!cronSecret) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const internalUrl = new URL(targetPath, url.origin);
  for (const [key, value] of url.searchParams) {
    if (key !== 'path') internalUrl.searchParams.set(key, value);
  }

  const response = await fetch(internalUrl.toString(), {
    method: 'GET',
    headers: {
      'x-api-key': cronSecret,
    },
  });

  const body = await response.text();
  return new Response(body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  });
};
