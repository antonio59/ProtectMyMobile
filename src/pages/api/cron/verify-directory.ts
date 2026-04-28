import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { getConvexClient, requireConvex, sendReportEmail } from '../../../lib/cron-utils';

const convex = getConvexClient();

interface VerificationReport {
  checked: number;
  active: number;
  inactive: number;
  details: string[];
}

async function tryFetch(url: string): Promise<{ ok: boolean; status?: number; err?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'ProtectMyMobile/1.0 DirectoryBot' }
    });
    clearTimeout(timeoutId);
    if (res.ok || res.status === 405) return { ok: true };
    if (res.status === 403) return { ok: false, status: res.status };
    return { ok: false, status: res.status };
  } catch (err: any) {
    return { ok: false, err: err.message };
  }
}

async function checkUrlAlive(url: string): Promise<{ alive: boolean; detail: string }> {
  const head = await tryFetch(url);
  if (head.ok) return { alive: true, detail: '' };

  if (head.status === 403) {
    const get = await tryFetch(url);
    if (get.ok) return { alive: true, detail: '' };
    return { alive: false, detail: `returned 403 (HEAD) and ${get.status ?? get.err} (GET)` };
  }

  if (head.err) {
    const get = await tryFetch(url);
    if (get.ok) return { alive: true, detail: '' };
    return { alive: false, detail: `failed: ${head.err} (HEAD), then ${get.status ?? get.err} (GET)` };
  }

  return { alive: false, detail: `returned ${head.status}` };
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
  const { alive, detail } = await checkUrlAlive(url);
  const adminToken = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;

  if (alive) {
    report.active++;
    await convex.mutation(
      type === 'bank' ? api.banks.update : api.mobileProviders.update,
      { adminToken, id, lastVerified: Date.now(), active: true }
    );
  } else {
    report.inactive++;
    report.details.push(`❌ ${name} (${url}) ${detail}`);
    await convex.mutation(
      type === 'bank' ? api.banks.update : api.mobileProviders.update,
      { adminToken, id, active: false }
    );
  }
}

export const GET: APIRoute = async ({ request }) => {
  if (!convex) {
    return requireConvex(convex)!;
  }

  try {
    const [banks, providers] = await Promise.all([
      convex.query(api.banks.list, { activeOnly: false }),
      convex.query(api.mobileProviders.list, { activeOnly: false })
    ]);

    const report: VerificationReport = { checked: 0, active: 0, inactive: 0, details: [] };

    await Promise.all([
      ...(banks || []).map(b => verifyEntry(convex, report, b.website, b.name, 'bank', b._id)),
      ...(providers || []).map(p => verifyEntry(convex, report, p.website, p.name, 'provider', p._id))
    ]);

    const adminToken = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
    await convex.mutation(api.siteMetadata.updateDirectoryVerified, { adminToken, directory: 'banks' });
    await convex.mutation(api.siteMetadata.updateDirectoryVerified, { adminToken, directory: 'mobileProviders' });

    await sendReportEmail(
      `Directory Verification Report: ${report.inactive} Issues Found`,
      `
        <h2>Directory Verification Status</h2>
        <p><strong>Checked:</strong> ${report.checked}</p>
        <p><strong>Active:</strong> <span style="color:green">${report.active}</span></p>
        <p><strong>Inactive/Issues:</strong> <span style="color:red">${report.inactive}</span></p>
        <h3>Issues Detail:</h3>
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
