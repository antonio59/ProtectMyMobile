import type { APIRoute } from 'astro';
import { verifyAdminSession } from '../../../middleware';
import { getSecret } from '../../../lib/security';

const ALLOWED_PATHS = [
  '/api/admin/seed-theft-data',
  '/api/admin/scrape-wdtk',
  '/api/admin/fetch-police-uk',
  '/api/admin/test-email',
  '/api/cron/monitor-wdtk',
  '/api/cron/send-foi-requests',
];

export const GET: APIRoute = async ({ cookies, url, locals }) => {
  // Validate admin session cookie (JWT signed with ADMIN_JWT_SECRET)
  if (!(await verifyAdminSession(cookies, locals))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
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

  const cronSecret = getSecret(locals, 'CRON_SECRET');
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
