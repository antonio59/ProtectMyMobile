import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { getConvexClient, requireConvex, sendReportEmail } from '../../../lib/cron-utils';
import { requireApiKey } from '../../../lib/security';

const convex = getConvexClient();

interface VerificationReport {
  checked: number;
  active: number;
  inactive: number;
  uncertain: number;
  details: string[];
}

// Realistic browser UA: many bank/provider sites bot-block the default
// fetch UA with 403, which must not be treated as "site is down".
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function tryFetch(url: string, method: 'HEAD' | 'GET'): Promise<{ responded: boolean; ok: boolean; status?: number; err?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': UA }
    });
    clearTimeout(timeoutId);
    return { responded: true, ok: res.ok || res.status === 405, status: res.status };
  } catch (err: any) {
    return { responded: false, ok: false, err: err.message };
  }
}

// Any HTTP response at all (even 403/404/500) means the domain is alive:
// bot protection and WAFs answer with 403 to non-browser clients. Only a
// network-level failure on BOTH HEAD and GET is suspicious, and even then
// we do not auto-deactivate; the entry is flagged for manual review so a
// transient outage or bot block never removes a real bank from the directory.
async function checkUrlAlive(url: string): Promise<{ alive: boolean; uncertain: boolean; detail: string }> {
  const head = await tryFetch(url, 'HEAD');
  if (head.responded) {
    return head.ok || head.status === 403
      ? { alive: true, uncertain: false, detail: '' }
      : { alive: true, uncertain: true, detail: `unusual status ${head.status} (HEAD)` };
  }

  const get = await tryFetch(url, 'GET');
  if (get.responded) {
    return { alive: true, uncertain: false, detail: '' };
  }

  return { alive: false, uncertain: true, detail: `no response: ${head.err} (HEAD), ${get.err} (GET)` };
}

async function verifyEntry(
  convex: ConvexHttpClient,
  report: VerificationReport,
  url: string,
  name: string,
  type: 'bank' | 'provider',
  id: any
) {
  report.checked++;
  const { alive, uncertain, detail } = await checkUrlAlive(url);
  const adminToken = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;

  if (alive) {
    report.active++;
    if (uncertain) report.details.push(`⚠️ ${name} (${url}) ${detail}`);
    await convex.mutation(
      type === 'bank' ? api.banks.update : api.mobileProviders.update,
      { adminToken, id, lastVerified: Date.now(), active: true }
    );
  } else {
    // Never auto-deactivate on ambiguous network failures: keep the entry
    // visible and flag it for manual review in the emailed report.
    report.uncertain++;
    report.details.push(`❓ ${name} (${url}) ${detail} - left active, needs manual review`);
  }
}

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = requireApiKey(request);
  if (unauthorized) return unauthorized;

  if (!convex) {
    return requireConvex(convex)!;
  }

  try {
    const [banks, providers] = await Promise.all([
      convex.query(api.banks.list, { activeOnly: false }),
      convex.query(api.mobileProviders.list, { activeOnly: false })
    ]);

    const report: VerificationReport = { checked: 0, active: 0, inactive: 0, uncertain: 0, details: [] };

    await Promise.all([
      ...(banks || []).map(b => verifyEntry(convex, report, b.website, b.name, 'bank', b._id)),
      ...(providers || []).map(p => verifyEntry(convex, report, p.website, p.name, 'provider', p._id))
    ]);

    const adminToken = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
    await convex.mutation(api.siteMetadata.updateDirectoryVerified, { adminToken, directory: 'banks' });
    await convex.mutation(api.siteMetadata.updateDirectoryVerified, { adminToken, directory: 'mobileProviders' });

    await sendReportEmail(
      `Directory Verification Report: ${report.uncertain} Need Review`,
      `
        <h2>Directory Verification Status</h2>
        <p><strong>Checked:</strong> ${report.checked}</p>
        <p><strong>Reachable:</strong> <span style="color:green">${report.active}</span></p>
        <p><strong>Needs manual review:</strong> <span style="color:orange">${report.uncertain}</span></p>
        <p>Entries are never deactivated automatically; anything below stayed visible in the directory.</p>
        <h3>Review Detail:</h3>
        <ul>
          ${report.details.length > 0 ? report.details.map(d => `<li>${d}</li>`).join('') : '<li>No issues found.</li>'}
        </ul>
        <p>Note: Automated check performed at ${new Date().toISOString()}.</p>
      `
    );

    return new Response(JSON.stringify({ success: true, report }), { status: 200 });
  } catch (error: any) {
    console.error('Directory verification error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};
