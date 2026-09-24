import { handle } from '@astrojs/cloudflare/handler';

// Minimal Workers runtime types. Kept local so the full
// @cloudflare/workers-types globals (which change Body.json() to `unknown`
// across the whole codebase) don't leak into the main program. To get full
// types here instead, run `pnpm cf-typegen` and remove the tsconfig exclude.
interface WorkerEnv {
  ASSETS?: { fetch(request: Request): Promise<Response> };
  SITE_ORIGIN?: string;
  CRON_SECRET?: string;
  [binding: string]: unknown;
}

interface WorkerExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

interface CronEvent {
  cron: string;
  scheduledTime: number;
}

// Single Worker entrypoint replacing netlify.toml + netlify/functions/*:
//   1. Host canonicalization (legacy .xyz and www hosts 301 to apex .org)
//   2. Security headers applied to every response (static assets + SSR)
//   3. Cron triggers that call the site's /api/cron/* endpoints

const CANONICAL_ORIGIN = 'https://protectmymobile.org';
const CANONICAL_HOST = 'protectmymobile.org';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]']);

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://giddy-civet-983.convex.cloud https://unpkg.com https://plausible.io; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https: blob: https://*.tile.openstreetmap.org; font-src 'self' data:; connect-src 'self' https://giddy-civet-983.convex.cloud https://api.resend.com wss://giddy-civet-983.convex.cloud https://plausible.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

function withSecurityHeaders(response: Response): Response {
  const res = new Response(response.body, response);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(name, value);
  }
  return res;
}

interface CronJob {
  name: string;
  path: string;
}

// Mirrors the old netlify/functions/scheduled-* triggers.
const CRON_JOBS: Record<string, CronJob[]> = {
  '0 8 * * *': [
    { name: 'scheduled-police-data', path: '/api/admin/fetch-police-uk?mode=recent&months=3' },
    { name: 'scheduled-wdtk', path: '/api/cron/monitor-wdtk' },
  ],
  '0 8 * * 7': [{ name: 'scheduled-news', path: '/api/cron/fetch-news' }],
  // Daily purge so retention deadlines are honoured within ~24h — the old
  // monthly run could leave expired data in place for up to ~31 days.
  '30 4 * * *': [{ name: 'scheduled-purge-data', path: '/api/cron/purge-data' }],
  '17 7 1 * *': [
    { name: 'scheduled-verify-directory', path: '/api/cron/verify-directory' },
  ],
};

async function runCronJob(env: WorkerEnv, job: CronJob): Promise<void> {
  if (!env.CRON_SECRET) {
    console.error(`[cron] ${job.name} skipped: CRON_SECRET is not set`);
    return;
  }
  const origin = env.SITE_ORIGIN || CANONICAL_ORIGIN;
  const start = Date.now();
  try {
    const res = await fetch(`${origin}${job.path}`, {
      headers: { 'x-api-key': env.CRON_SECRET, 'Content-Type': 'application/json' },
    });
    const body = await res.text();
    console.log(
      `[cron] ${job.name} ${job.path} -> ${res.status} in ${Date.now() - start}ms`,
      body.slice(0, 500),
    );
  } catch (error) {
    console.error(
      `[cron] ${job.name} ${job.path} failed after ${Date.now() - start}ms:`,
      error instanceof Error ? error.message : error,
    );
  }
}

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: WorkerExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (!LOCAL_HOSTS.has(url.hostname) && url.hostname !== CANONICAL_HOST) {
      return withSecurityHeaders(
        new Response(null, {
          status: 301,
          headers: { Location: `${CANONICAL_ORIGIN}${url.pathname}${url.search}` },
        }),
      );
    }

    // RFC 9116 also recognises /security.txt at the root; serve the canonical
    // /.well-known/ copy instead of maintaining two files.
    if (url.pathname === '/security.txt') {
      return withSecurityHeaders(
        new Response(null, {
          status: 301,
          headers: { Location: `${CANONICAL_ORIGIN}/.well-known/security.txt` },
        }),
      );
    }

    // handle() = the adapter's full pipeline: ASSETS binding for static
    // files, route matching, app.render for SSR. Env/ctx types come from
    // generated workers-types excluded from this tsconfig; resolve as any.
    const response = await handle(request, env as never, ctx as never);
    return withSecurityHeaders(response);
  },

  scheduled(event: CronEvent, env: WorkerEnv, ctx: WorkerExecutionContext): void {
    const jobs = CRON_JOBS[event.cron] ?? [];
    ctx.waitUntil(
      Promise.all(jobs.map((job) => runCronJob(env, job))).then(() => undefined),
    );
  },
};
