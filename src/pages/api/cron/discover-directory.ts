import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { Resend } from 'resend';
import { requireApiKey } from '../../../lib/security';

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(limited|ltd|plc|llp)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function mapHostNetwork(host: string): 'EE' | 'Vodafone' | 'O2' | 'Three' | 'MVNO' {
  const h = host.trim();
  if (h === 'EE') return 'EE';
  if (h === 'Vodafone') return 'Vodafone';
  if (h === 'O2') return 'O2';
  if (h === 'Three') return 'Three';
  return 'MVNO';
}

async function checkUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'ProtectMyMobile/1.0 DirectoryBot' }
    });
    clearTimeout(timeoutId);
    if (res.ok || res.status === 405) return true;
    if (res.status === 403) {
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), 5000);
      const r2 = await fetch(url, { method: 'GET', signal: c2.signal, headers: { 'User-Agent': 'ProtectMyMobile/1.0 DirectoryBot' } });
      clearTimeout(t2);
      return r2.ok;
    }
    return false;
  } catch {
    try {
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), 5000);
      const r2 = await fetch(url, { method: 'GET', signal: c2.signal, headers: { 'User-Agent': 'ProtectMyMobile/1.0 DirectoryBot' } });
      clearTimeout(t2);
      return r2.ok;
    } catch {
      return false;
    }
  }
}

async function inferWebsite(name: string, type: 'bank' | 'provider'): Promise<string | null> {
  const base = name.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/bank$/, '')
    .replace(/limited$/, '')
    .replace(/ltd$/, '')
    .replace(/plc$/, '')
    .replace(/mobile$/, '')
    .replace(/buildingsociety$/, '');

  const alts = Array.from(new Set([
    base,
    base.replace(/uk$/, ''),
    base.replace(/coop$/, 'cooperative'),
    base.replace(/cooperative$/, 'coop')
  ])).filter(s => s.length > 1);

  const tlds = type === 'bank'
    ? ['.co.uk', '.com', '.uk', '.bank']
    : ['.co.uk', '.com', '.uk'];
  const prefixes = ['https://www.', 'https://'];

  const urls: string[] = [];
  const hardcoded: Record<string, string> = {
    ctexcel: 'https://www.ctexcel.com',
    yourcoop: 'https://www.yourcoopmobile.co.uk',
    yourcooperative: 'https://www.yourcoopmobile.co.uk',
    thephonecoop: 'https://www.thephone.coop',
    cmlink: 'https://www.cmlink.co.uk',
    ecotalk: 'https://www.ecotalk.co.uk',
    honestmobile: 'https://www.honestmobile.co.uk',
    lycamobile: 'https://www.lycamobile.co.uk',
    mozillion: 'https://www.mozillion.com',
    spusu: 'https://www.spusu.co.uk',
    talkmobile: 'https://www.talkmobile.co.uk',
  };

  if (hardcoded[base]) {
    urls.push(hardcoded[base]);
  }

  for (const prefix of prefixes) {
    for (const alt of alts) {
      for (const tld of tlds) {
        urls.push(`${prefix}${alt}${tld}`);
      }
    }
  }

  for (const url of urls) {
    if (await checkUrl(url)) return url;
  }
  return null;
}

async function fetchBoEBanks(): Promise<string[]> {
  const currentYear = new Date().getFullYear();
  let csvText: string | null = null;
  for (const year of [currentYear, currentYear - 1]) {
    const url = `https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/authorisations/which-firms-does-the-pra-regulate/${year}/list-of-pra-regulated-banks.csv`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ProtectMyMobile/1.0 DirectoryBot' } });
    if (res.ok) {
      csvText = await res.text();
      break;
    }
  }
  if (!csvText) throw new Error('Failed to fetch BoE banks CSV');

  const lines = csvText.replace(/^\uFEFF/, '').split('\n');
  const results: string[] = [];
  let inUkSection = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('Banks incorporated in the UK authorised to accept deposits')) {
      inUkSection = true;
      continue;
    }
    if (trimmed.includes('Banks incorporated outside the UK') || trimmed.includes('Banks incorporated in Gibraltar')) {
      inUkSection = false;
      continue;
    }
    if (!inUkSection) continue;
    if (trimmed.startsWith('Firm Name,')) continue;
    const parts = trimmed.split(',');
    if (parts.length >= 1 && parts[0].trim() && !parts[0].includes('Firm Name')) {
      const name = parts[0].trim().replace(/^"|"$/g, '');
      if (name) results.push(name);
    }
  }
  return results;
}

async function fetchBoEBuildingSocieties(): Promise<string[]> {
  const currentYear = new Date().getFullYear();
  let csvText: string | null = null;
  for (const year of [currentYear, currentYear - 1]) {
    const url = `https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/authorisations/which-firms-does-the-pra-regulate/${year}/list-of-pra-regulated-building-societies.csv`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ProtectMyMobile/1.0 DirectoryBot' } });
    if (res.ok) {
      csvText = await res.text();
      break;
    }
  }
  if (!csvText) throw new Error('Failed to fetch BoE building societies CSV');

  const lines = csvText.replace(/^\uFEFF/, '').split('\n');
  const results: string[] = [];
  let started = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('Firm Name')) {
      started = true;
      continue;
    }
    if (!started) continue;
    const parts = trimmed.split(',');
    if (parts.length >= 1 && parts[0].trim()) {
      const name = parts[0].trim().replace(/^"|"$/g, '');
      if (name) results.push(name);
    }
  }
  return results;
}

async function fetchWikipediaMvno(): Promise<{ name: string; network: string }[]> {
  const url = 'https://en.wikipedia.org/wiki/List_of_mobile_virtual_network_operators_in_the_United_Kingdom';
  const res = await fetch(url, { headers: { 'User-Agent': 'ProtectMyMobile/1.0 DirectoryBot' } });
  if (!res.ok) throw new Error('Failed to fetch Wikipedia MVNO page');
  const html = await res.text();

  const tableMatch = html.match(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>(.*?)<\/table>/is);
  if (!tableMatch) throw new Error('Could not find MVNO table');

  const tableHtml = tableMatch[1];
  const rows = tableHtml.match(/<tr[^>]*>(.*?)<\/tr>/gis) || [];
  const results: { name: string; network: string }[] = [];

  for (const row of rows) {
    const cells = row.match(/<t[dh][^>]*>(.*?)<\/t[dh]>/gis) || [];
    if (cells.length >= 15) {
      const brand = cells[0]?.replace(/<.*?>/g, '').trim().replace(/\[.*?\]/g, '').trim() ?? '';
      const host = cells[1]?.replace(/<.*?>/g, '').trim() ?? '';
      if (brand && brand !== 'Brand' && !brand.match(/^(2G|3G|4G|5G)$/)) {
        results.push({ name: brand, network: mapHostNetwork(host) });
      }
    }
  }
  return results;
}

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
    const [existingBanks, existingProviders] = await Promise.all([
      convex.query(api.banks.list, { activeOnly: false }),
      convex.query(api.mobileProviders.list, { activeOnly: false })
    ]);

    const existingBankNames = new Set((existingBanks || []).map((b: any) => normalizeName(b.name)));
    const existingProviderNames = new Set((existingProviders || []).map((p: any) => normalizeName(p.name)));

    const [boeBanks, boeSocieties, wikiMvno] = await Promise.all([
      fetchBoEBanks(),
      fetchBoEBuildingSocieties(),
      fetchWikipediaMvno()
    ]);

    const report = {
      banksChecked: 0,
      societiesNew: 0,
      societiesPending: 0,
      banksPending: 0,
      providersChecked: 0,
      providersNew: 0,
      providersPending: 0,
      newSocieties: [] as { name: string; website: string }[],
      pendingSocieties: [] as { name: string }[],
      pendingBanks: [] as { name: string }[],
      newProviders: [] as { name: string; website: string; network: string }[],
      pendingProviders: [] as { name: string; network: string }[],
    };

    const adminToken = import.meta.env.CRON_SECRET || process.env.CRON_SECRET;

    // Only auto-create building societies (all are retail/consumer)
    for (const name of boeSocieties) {
      report.banksChecked++;
      const normalized = normalizeName(name);
      if (existingBankNames.has(normalized)) continue;

      const website = await inferWebsite(name, 'bank');
      if (website) {
        await convex.mutation(api.banks.create, {
          adminToken,
          name,
          website,
          category: 'building_society',
          active: false
        });
        report.societiesNew++;
        report.newSocieties.push({ name, website });
      } else {
        report.societiesPending++;
        report.pendingSocieties.push({ name });
      }
    }

    // Regular banks are reported for manual review only (too many corporate/non-retail)
    for (const name of boeBanks) {
      report.banksChecked++;
      const normalized = normalizeName(name);
      if (existingBankNames.has(normalized)) continue;
      report.banksPending++;
      report.pendingBanks.push({ name });
    }

    // Auto-create MVNOs (all are consumer retail)
    for (const candidate of wikiMvno) {
      report.providersChecked++;
      const normalized = normalizeName(candidate.name);
      if (existingProviderNames.has(normalized)) continue;

      const website = await inferWebsite(candidate.name, 'provider');
      if (website) {
        await convex.mutation(api.mobileProviders.create, {
          adminToken,
          name: candidate.name,
          website,
          network: candidate.network as any,
          isMvno: true,
          active: false
        });
        report.providersNew++;
        report.newProviders.push({ name: candidate.name, website, network: candidate.network });
      } else {
        report.providersPending++;
        report.pendingProviders.push({ name: candidate.name, network: candidate.network });
      }
    }

    // Send email report
    const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'ProtectMyMobile <onboarding@resend.dev>',
          to: ['protectmymobile.xyz.overlabor129@passmail.com'],
          subject: `Directory Discovery Report: ${report.societiesNew + report.providersNew} Auto-Created, ${report.banksPending + report.societiesPending + report.providersPending} Pending`,
          html: `
            <h2>Automated Directory Discovery Report</h2>
            <p>Run at: ${new Date().toISOString()}</p>
            <p><em>Note: Regular banks are no longer auto-created because the BoE list mixes retail and corporate banks. Only building societies and MVNOs are auto-created.</em></p>
            
            <h3>Building Societies</h3>
            <p>Auto-created: <span style="color:green">${report.societiesNew}</span> | Pending review: <span style="color:orange">${report.societiesPending}</span></p>
            
            ${report.newSocieties.length > 0 ? `
            <h4>New Building Societies (inactive, awaiting review)</h4>
            <ul>${report.newSocieties.map(b => `<li><strong>${b.name}</strong> — <a href="${b.website}">${b.website}</a></li>`).join('')}</ul>
            ` : ''}
            
            ${report.pendingSocieties.length > 0 ? `
            <h4>Pending Building Societies (could not infer website)</h4>
            <ul>${report.pendingSocieties.map(b => `<li><strong>${b.name}</strong></li>`).join('')}</ul>
            ` : ''}
            
            <h3>Other Banks (Manual Review Required)</h3>
            <p>${report.banksPending} banks found that are not in the database. <strong>They are NOT auto-created.</strong> Review the BoE CSV to find any new retail/challenger banks to add manually.</p>
            ${report.pendingBanks.length > 0 && report.pendingBanks.length <= 50 ? `
            <ul>${report.pendingBanks.slice(0, 50).map(b => `<li>${b.name}</li>`).join('')}</ul>
            ${report.pendingBanks.length > 50 ? `<p>...and ${report.pendingBanks.length - 50} more.</p>` : ''}
            ` : ''}
            
            <h3>Mobile Providers</h3>
            <p>Checked: ${report.providersChecked} | Auto-created: <span style="color:green">${report.providersNew}</span> | Pending review: <span style="color:orange">${report.providersPending}</span></p>
            
            ${report.newProviders.length > 0 ? `
            <h4>New Providers (inactive, awaiting review)</h4>
            <ul>${report.newProviders.map(p => `<li><strong>${p.name}</strong> — <a href="${p.website}">${p.website}</a> (host: ${p.network})</li>`).join('')}</ul>
            ` : ''}
            
            ${report.pendingProviders.length > 0 ? `
            <h4>Pending Providers (could not infer website)</h4>
            <ul>${report.pendingProviders.map(p => `<li><strong>${p.name}</strong> (host: ${p.network})</li>`).join('')}</ul>
            ` : ''}
          `
        });
      } catch (emailErr) {
        console.error('Failed to send discovery email:', emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true, report }), { status: 200 });
  } catch (error: any) {
    console.error('Directory discovery error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};
