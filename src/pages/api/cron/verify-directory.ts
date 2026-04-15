import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { Resend } from 'resend';
import { requireApiKey } from '../../../lib/security';

// Initialize Convex client
const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export const GET: APIRoute = async ({ request }) => {
  const unauthorized = requireApiKey(request);
  if (unauthorized) return unauthorized;

  if (!convex) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Missing PUBLIC_CONVEX_URL. Cannot perform database operations.' 
    }), { status: 500 });
  }

  try {
    // 1. Fetch Banks and Providers from Convex
    const banks = await convex.query(api.banks.list, { activeOnly: false });
    const providers = await convex.query(api.mobileProviders.list, { activeOnly: false });

    const report = {
      checked: 0,
      active: 0,
      inactive: 0,
      details: [] as string[]
    };

    const checkUrl = async (url: string, name: string, type: 'bank' | 'provider', id: any) => {
      report.checked++;
      let isActive = false;
      let issueDetail = '';

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const headResponse = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: { 'User-Agent': 'ProtectMyMobile/1.0 DirectoryBot' }
        });
        clearTimeout(timeoutId);

        if (headResponse.ok || headResponse.status === 405) {
          isActive = true;
        } else if (headResponse.status === 403) {
          // Many sites block HEAD but serve GET fine — try GET fallback
          const getController = new AbortController();
          const getTimeoutId = setTimeout(() => getController.abort(), 5000);
          const getResponse = await fetch(url, {
            method: 'GET',
            signal: getController.signal,
            headers: { 'User-Agent': 'ProtectMyMobile/1.0 DirectoryBot' }
          });
          clearTimeout(getTimeoutId);
          if (getResponse.ok) {
            isActive = true;
          } else {
            issueDetail = `returned ${headResponse.status} (HEAD) and ${getResponse.status} (GET)`;
          }
        } else {
          issueDetail = `returned ${headResponse.status}`;
        }
      } catch (err: any) {
        // HEAD failed entirely — try GET fallback before giving up
        try {
          const getController = new AbortController();
          const getTimeoutId = setTimeout(() => getController.abort(), 5000);
          const getResponse = await fetch(url, {
            method: 'GET',
            signal: getController.signal,
            headers: { 'User-Agent': 'ProtectMyMobile/1.0 DirectoryBot' }
          });
          clearTimeout(getTimeoutId);
          if (getResponse.ok) {
            isActive = true;
          } else {
            issueDetail = `failed: ${err.message} (HEAD), then returned ${getResponse.status} (GET)`;
          }
        } catch (getErr: any) {
          issueDetail = `failed: ${err.message}`;
        }
      }

      const adminToken = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
      if (isActive) {
        report.active++;
        if (type === 'bank') {
          await convex.mutation(api.banks.update, { adminToken, id, lastVerified: Date.now(), active: true });
        } else {
          await convex.mutation(api.mobileProviders.update, { adminToken, id, lastVerified: Date.now(), active: true });
        }
      } else {
        report.inactive++;
        report.details.push(`❌ ${name} (${url}) ${issueDetail}`);
        // Mark as inactive in the database
        if (type === 'bank') {
          await convex.mutation(api.banks.update, { adminToken, id, active: false });
        } else {
          await convex.mutation(api.mobileProviders.update, { adminToken, id, active: false });
        }
      }
    };

    // Check in parallel batches
    const promises = [
      ...(banks || []).map(b => checkUrl(b.website, b.name, 'bank', b._id)),
      ...(providers || []).map(p => checkUrl(p.website, p.name, 'provider', p._id))
    ];

    await Promise.all(promises);

    // Update site metadata with last verified timestamps
    const adminToken = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;
    await convex.mutation(api.siteMetadata.updateDirectoryVerified, { adminToken, directory: 'banks' });
    await convex.mutation(api.siteMetadata.updateDirectoryVerified, { adminToken, directory: 'mobileProviders' });

    // 2. Send Report via Resend
    const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'ProtectMyMobile <onboarding@resend.dev>',
          to: ['protectmymobile.xyz.overlabor129@passmail.com'],
          subject: `Directory Verification Report: ${report.inactive} Issues Found`,
          html: `
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
        });
      } catch (emailErr) {
        console.error('Failed to send email report:', emailErr);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        report 
      }), 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Directory verification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { status: 500 }
    );
  }
};
