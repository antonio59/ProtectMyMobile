const API_SECRET = (typeof import.meta !== 'undefined' && (import.meta as any).env?.CRON_SECRET) || process.env.CRON_SECRET;

export function extractBearerToken(request: Request) {
  const header = request.headers.get('authorization');
  if (header && header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7);
  }
  return null;
}

export function requireApiKey(request: Request): Response | null {
  const key = request.headers.get('x-api-key') || extractBearerToken(request);
  if (!API_SECRET) {
    return new Response(JSON.stringify({ error: 'Server missing CRON_SECRET' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (key !== API_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): Response | null {
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (bucket.count >= limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please slow down.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': `${retryAfter}`,
        },
      }
    );
  }

  bucket.count += 1;
  return null;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
