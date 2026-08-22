// Shared directory-discovery logic for the cron route
// (src/pages/api/cron/discover-directory.ts) and the manual script
// (scripts/run-directory-discovery.ts).
import type { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const BOT_UA = 'ProtectMyMobile/1.0 DirectoryBot';

export interface DiscoveryReport {
  banksChecked: number;
  societiesNew: number;
  societiesPending: number;
  banksPending: number;
  providersChecked: number;
  providersNew: number;
  providersPending: number;
  newSocieties: Array<{ name: string; website: string }>;
  pendingSocieties: Array<{ name: string }>;
  pendingBanks: Array<{ name: string }>;
  newProviders: Array<{ name: string; website: string; network: string }>;
  pendingProviders: Array<{ name: string; network: string }>;
}

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
      headers: { 'User-Agent': BOT_UA }
    });
    clearTimeout(timeoutId);
    if (res.ok || res.status === 405) return true;
    if (res.status === 403) {
      return await checkUrlGet(url);
    }
    return false;
  } catch {
    try {
      return await checkUrlGet(url);
    } catch {
      return false;
    }
  }
}

async function checkUrlGet(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  const res = await fetch(url, { method: 'GET', signal: controller.signal, headers: { 'User-Agent': BOT_UA } });
  clearTimeout(timeoutId);
  return res.ok;
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

async function fetchBoeCsv(filename: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  for (const year of [currentYear, currentYear - 1]) {
    const url = `https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/authorisations/which-firms-does-the-pra-regulate/${year}/${filename}`;
    const res = await fetch(url, { headers: { 'User-Agent': BOT_UA } });
    if (res.ok) return res.text();
  }
  throw new Error(`Failed to fetch BoE CSV: ${filename}`);
}

async function fetchBoEBanks(): Promise<string[]> {
  const csvText = await fetchBoeCsv('list-of-pra-regulated-banks.csv');

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
  const csvText = await fetchBoeCsv('list-of-pra-regulated-building-societies.csv');

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

function stripHtmlTags(str: string): string {
  let prev;
  do {
    prev = str;
    str = str.replace(/<[^>]*>/g, '');
  } while (str !== prev);
  return str;
}

function stripWikiRefs(str: string): string {
  let prev;
  do {
    prev = str;
    str = str.replace(/\[.*?\]/g, '');
  } while (str !== prev);
  return str;
}

async function fetchWikipediaMvno(): Promise<{ name: string; network: string }[]> {
  const url = 'https://en.wikipedia.org/wiki/List_of_mobile_virtual_network_operators_in_the_United_Kingdom';
  const res = await fetch(url, { headers: { 'User-Agent': BOT_UA } });
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
      const brand = stripWikiRefs(stripHtmlTags(cells[0] ?? '')).trim();
      const host = stripHtmlTags(cells[1] ?? '').trim();
      if (brand && brand !== 'Brand' && !brand.match(/^(2G|3G|4G|5G)$/)) {
        results.push({ name: brand, network: mapHostNetwork(host) });
      }
    }
  }
  return results;
}

async function processSocieties(
  convex: ConvexHttpClient,
  names: string[],
  existingBankNames: Set<string>,
  adminToken: string,
  log: (msg: string) => void,
): Promise<Pick<DiscoveryReport, 'banksChecked' | 'societiesNew' | 'societiesPending' | 'newSocieties' | 'pendingSocieties'>> {
  let banksChecked = 0, societiesNew = 0, societiesPending = 0;
  const newSocieties: Array<{ name: string; website: string }> = [];
  const pendingSocieties: Array<{ name: string }> = [];

  for (const name of names) {
    banksChecked++;
    if (existingBankNames.has(normalizeName(name))) continue;
    const website = await inferWebsite(name, 'bank');
    if (website) {
      await convex.mutation(api.banks.create, { adminToken, name, website, category: 'building_society', active: false });
      societiesNew++;
      newSocieties.push({ name, website });
      log(`Created building society: ${name} -> ${website}`);
    } else {
      societiesPending++;
      pendingSocieties.push({ name });
      log(`Pending building society: ${name}`);
    }
  }

  return { banksChecked, societiesNew, societiesPending, newSocieties, pendingSocieties };
}

function processBanks(
  names: string[],
  existingBankNames: Set<string>,
): Pick<DiscoveryReport, 'banksChecked' | 'banksPending' | 'pendingBanks'> {
  let banksChecked = 0, banksPending = 0;
  const pendingBanks: Array<{ name: string }> = [];

  for (const name of names) {
    banksChecked++;
    if (existingBankNames.has(normalizeName(name))) continue;
    banksPending++;
    pendingBanks.push({ name });
  }

  return { banksChecked, banksPending, pendingBanks };
}

async function processProviders(
  convex: ConvexHttpClient,
  candidates: Array<{ name: string; network: string }>,
  existingProviderNames: Set<string>,
  adminToken: string,
  log: (msg: string) => void,
): Promise<Pick<DiscoveryReport, 'providersChecked' | 'providersNew' | 'providersPending' | 'newProviders' | 'pendingProviders'>> {
  let providersChecked = 0, providersNew = 0, providersPending = 0;
  const newProviders: Array<{ name: string; website: string; network: string }> = [];
  const pendingProviders: Array<{ name: string; network: string }> = [];

  for (const candidate of candidates) {
    providersChecked++;
    if (existingProviderNames.has(normalizeName(candidate.name))) continue;
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
      providersNew++;
      newProviders.push({ name: candidate.name, website, network: candidate.network });
      log(`Created provider: ${candidate.name} -> ${website}`);
    } else {
      providersPending++;
      pendingProviders.push({ name: candidate.name, network: candidate.network });
      log(`Pending provider: ${candidate.name}`);
    }
  }

  return { providersChecked, providersNew, providersPending, newProviders, pendingProviders };
}

export async function runDiscovery(
  convex: ConvexHttpClient,
  adminToken: string,
  log: (msg: string) => void = () => {},
): Promise<DiscoveryReport> {
  const [existingBanks, existingProviders] = await Promise.all([
    convex.query(api.banks.list, { activeOnly: false }),
    convex.query(api.mobileProviders.list, { activeOnly: false })
  ]);

  const existingBankNames = new Set((existingBanks || []).map((b: any) => normalizeName(b.name)));
  const existingProviderNames = new Set((existingProviders || []).map((p: any) => normalizeName(p.name)));

  log(`Existing banks: ${existingBankNames.size}, providers: ${existingProviderNames.size}`);

  const [boeBanks, boeSocieties, wikiMvno] = await Promise.all([
    fetchBoEBanks(),
    fetchBoEBuildingSocieties(),
    fetchWikipediaMvno()
  ]);

  log(`Fetched ${boeBanks.length} banks, ${boeSocieties.length} building societies, ${wikiMvno.length} MVNOs from sources`);

  const [societiesResult, banksResult, providersResult] = await Promise.all([
    processSocieties(convex, boeSocieties, existingBankNames, adminToken, log),
    Promise.resolve(processBanks(boeBanks, existingBankNames)),
    processProviders(convex, wikiMvno, existingProviderNames, adminToken, log),
  ]);

  return {
    banksChecked: societiesResult.banksChecked + banksResult.banksChecked,
    societiesNew: societiesResult.societiesNew,
    societiesPending: societiesResult.societiesPending,
    banksPending: banksResult.banksPending,
    providersChecked: providersResult.providersChecked,
    providersNew: providersResult.providersNew,
    providersPending: providersResult.providersPending,
    newSocieties: societiesResult.newSocieties,
    pendingSocieties: societiesResult.pendingSocieties,
    pendingBanks: banksResult.pendingBanks,
    newProviders: providersResult.newProviders,
    pendingProviders: providersResult.pendingProviders,
  };
}

export function buildDiscoveryReportHtml(report: DiscoveryReport): string {
  return `
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
  `;
}
