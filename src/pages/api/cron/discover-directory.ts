import type { APIRoute } from 'astro';
import { getConvexClient, requireConvex, sendReportEmail } from '../../../lib/cron-utils';
import { requireApiKey } from '../../../lib/security';
import { runDiscovery, buildDiscoveryReportHtml } from '../../../lib/directory-discovery';

const convex = getConvexClient();

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = requireApiKey(request);
  if (unauthorized) return unauthorized;

  if (!convex) {
    return requireConvex(convex)!;
  }

  try {
    const adminToken = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
    if (!adminToken) {
      return new Response(JSON.stringify({ success: false, error: 'Missing CRON_SECRET' }), { status: 500 });
    }

    const report = await runDiscovery(convex, adminToken);

    await sendReportEmail(
      `Directory Discovery Report: ${report.societiesNew + report.providersNew} Auto-Created, ${report.banksPending + report.societiesPending + report.providersPending} Pending`,
      buildDiscoveryReportHtml(report)
    );

    return new Response(JSON.stringify({ success: true, report }), { status: 200 });
  } catch (error: any) {
    console.error('Directory discovery error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};
