import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.PUBLIC_CONVEX_URL!;
const adminToken = process.env.CRON_SECRET!;
const convex = new ConvexHttpClient(convexUrl);

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

async function main() {
  const [existingBanks, existingProviders] = await Promise.all([
    convex.query(api.banks.list, { activeOnly: false }),
    convex.query(api.mobileProviders.list, { activeOnly: false })
  ]);

  const existingBankNames = new Set((existingBanks || []).map((b: any) => normalizeName(b.name)));
  const existingProviderNames = new Set((existingProviders || []).map((p: any) => normalizeName(p.name)));

  console.log(`Existing banks: ${existingBankNames.size}, providers: ${existingProviderNames.size}`);

  const [boeBanks, boeSocieties, wikiMvno] = await Promise.all([
    fetchBoEBanks(),
    fetchBoEBuildingSocieties(),
    fetchWikipediaMvno()
  ]);

  console.log(`Fetched ${boeBanks.length} banks, ${boeSocieties.length} building societies, ${wikiMvno.length} MVNOs from sources`);

  const report = {
    societiesNew: 0,
    societiesPending: 0,
    banksPending: 0,
    providersNew: 0,
    providersPending: 0,
    newSocieties: [] as { name: string; website: string }[],
    pendingSocieties: [] as { name: string }[],
    pendingBanks: [] as { name: string }[],
    newProviders: [] as { name: string; website: string; network: string }[],
    pendingProviders: [] as { name: string; network: string }[],
  };

  // Only auto-create building societies
  for (const name of boeSocieties) {
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
      console.log(`✅ Created building society: ${name} -> ${website}`);
    } else {
      report.societiesPending++;
      report.pendingSocieties.push({ name });
      console.log(`⏳ Pending building society: ${name}`);
    }
  }

  // Regular banks: report only
  for (const name of boeBanks) {
    const normalized = normalizeName(name);
    if (existingBankNames.has(normalized)) continue;
    report.banksPending++;
    report.pendingBanks.push({ name });
  }

  // Auto-create MVNOs
  for (const candidate of wikiMvno) {
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
      console.log(`✅ Created provider: ${candidate.name} -> ${website}`);
    } else {
      report.providersPending++;
      report.pendingProviders.push({ name: candidate.name, network: candidate.network });
      console.log(`⏳ Pending provider: ${candidate.name}`);
    }
  }

  console.log('\n=== DISCOVERY REPORT ===');
  console.log(`Building societies: ${report.societiesNew} created, ${report.societiesPending} pending`);
  console.log(`Other banks: ${report.banksPending} pending manual review`);
  console.log(`Providers: ${report.providersNew} created, ${report.providersPending} pending`);
  console.log('\nPending banks (sample):');
  for (const b of report.pendingBanks.slice(0, 20)) {
    console.log(`  - ${b.name}`);
  }
}

main().catch(console.error);
