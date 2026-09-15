import type { APIRoute } from 'astro';
import { api } from '../../../../convex/_generated/api';
import { getConvexClient, requireConvex } from '../../../lib/cron-utils';
import { requireApiKey, getSecret } from '../../../lib/security';

const convex = getConvexClient();

// Deletes personal data past its privacy-policy retention period. Triggered
// daily by the Cloudflare cron trigger (30 4 * * *).
export const GET: APIRoute = async ({ request, locals }) => {
  const unauthorized = await requireApiKey(request, locals);
  if (unauthorized) return unauthorized;
  const convexError = requireConvex(convex);
  if (convexError) return convexError;

  try {
    const adminToken = getSecret(locals, 'CRON_SECRET');
    const result = await convex!.mutation(api.dataRetention.purgeExpired, { adminToken });
    console.log('Data retention purge:', result);
    return new Response(JSON.stringify({ success: true, ...result }), { status: 200 });
  } catch (error: any) {
    console.error('Data retention purge error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};
