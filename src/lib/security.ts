// Secrets come from runtime Worker bindings. Never read them via
// import.meta.env: Vite inlines import.meta.env at build time, so a local
// `pnpm run build` with .env present would bake real secrets into
// dist/server. The process.env fallback exists only for plain-Node
// contexts; under workerd the process polyfill does not expose secret
// bindings anyway.
import { env as cfWorkerEnv } from "cloudflare:workers";

export type EnvLike = Record<string, string | undefined>;

export function getEnv(locals: unknown): EnvLike {
  try {
    // Older adapters exposed locals.runtime.env; Astro v6 made it a
    // throwing getter, so this must stay inside try/catch.
    const runtime = (locals as { runtime?: { env?: EnvLike } } | undefined)?.runtime?.env;
    if (runtime) return runtime;
  } catch { /* fall through to cloudflare:workers */ }
  if (cfWorkerEnv) return cfWorkerEnv as unknown as EnvLike;
  return (typeof process !== 'undefined' ? process.env : {}) as EnvLike;
}

export function getSecret(locals: unknown, name: string): string | undefined {
  const value = getEnv(locals)[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

async function sha256(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

// Constant-time comparison so the key length/value can't leak via timing.
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const [ba, bb] = await Promise.all([sha256(a), sha256(b)]);
  let diff = ba.length ^ bb.length;
  for (let i = 0; i < Math.max(ba.length, bb.length); i++) {
    diff |= (ba[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diff === 0;
}

function extractBearerToken(request: Request) {
  const header = request.headers.get('authorization');
  if (header && header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7);
  }
  return null;
}

export async function requireApiKey(request: Request, locals: unknown): Promise<Response | null> {
  const key = request.headers.get('x-api-key') || extractBearerToken(request);
  const secret = getSecret(locals, 'CRON_SECRET');
  if (!secret) {
    return new Response(JSON.stringify({ error: 'Server missing CRON_SECRET' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!key || !(await timingSafeEqual(key, secret))) {
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

