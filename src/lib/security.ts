// Runtime binding (worker secrets via process.env) wins over build-time
// inlined .env values so `wrangler secret put` rotation takes effect.
// Read lazily: workerd populates process.env per request, not at module init.
function apiSecret(): string | undefined {
  return process.env.CRON_SECRET ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.CRON_SECRET);
}

function extractBearerToken(request: Request) {
  const header = request.headers.get('authorization');
  if (header && header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7);
  }
  return null;
}

export function requireApiKey(request: Request): Response | null {
  const key = request.headers.get('x-api-key') || extractBearerToken(request);
  const secret = apiSecret();
  if (!secret) {
    return new Response(JSON.stringify({ error: 'Server missing CRON_SECRET' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (key !== secret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const MAX_BUCKETS = 10_000;

export function checkRateLimit(key: string, limit: number, windowMs: number): Response | null {
  const now = Date.now();

  // Bound memory: sweep expired buckets; if still over cap, deny new keys
  // rather than letting an attacker grow the map with spoofed IPs.
  if (rateBuckets.size >= MAX_BUCKETS) {
    for (const [k, b] of rateBuckets) {
      if (b.resetAt < now) rateBuckets.delete(k);
    }
    if (rateBuckets.size >= MAX_BUCKETS && !rateBuckets.has(key)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please slow down.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

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
  // On Cloudflare, cf-connecting-ip is set by the edge and cannot be spoofed
  // by the client. Otherwise take the last x-forwarded-for entry, which is
  // the one the trusted edge appended (the first is client-supplied).
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return parts[parts.length - 1]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

