import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { requireApiKey } from '../../../lib/security';

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

// Search queries to find mobile theft FOI data
const SEARCH_QUERIES = [
  'mobile+phone+theft+statistics',
  'phone+theft+data',
  'smartphone+theft',
  'mobile+theft+incidents',
];

interface WDTKRequest {
  id: string;
  title: string;
  url: string;
  authority: string;
  status: string;
  date: string;
}

async function fetchWDTKSearchPage(query: string, page: number = 1): Promise<WDTKRequest[]> {
  const url = `https://www.whatdotheyknow.com/search/${query}/all?page=${page}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ProtectMyMobile Research Bot (foi@protectmymobile.xyz)',
      },
    });
    
    if (!response.ok) return [];
    
    const html = await response.text();
    const requests: WDTKRequest[] = [];
    
    // Parse request links - looking for patterns like /request/request_name
    const requestMatches = html.matchAll(/<a[^>]+href="(\/request\/[^"]+)"[^>]*>([^<]+)<\/a>/gi);
    
    for (const match of requestMatches) {
      const path = match[1];
      const title = match[2].trim();
      
      // Skip pagination and other links
      if (path.includes('page=') || path.includes('#') || !title) continue;
      
      // Extract authority from nearby content
      const authorityMatch = html.match(new RegExp(`${path}"[^>]*>[^<]*</a>[^]*?<a[^>]+href="/body/([^"]+)"[^>]*>([^<]+)</a>`, 'i'));
      
      // Determine status from nearby content
      let status = 'unknown';
      const statusPatterns = [
        { pattern: /Successful/i, status: 'successful' },
        { pattern: /Partially successful/i, status: 'partial' },
        { pattern: /Refused/i, status: 'refused' },
        { pattern: /Awaiting response/i, status: 'awaiting' },
      ];
      
      const contextStart = html.indexOf(path);
      const context = html.slice(contextStart, contextStart + 500);
      
      for (const { pattern, status: s } of statusPatterns) {
        if (pattern.test(context)) {
          status = s;
          break;
        }
      }
      
      requests.push({
        id: path.replace('/request/', ''),
        title,
        url: `https://www.whatdotheyknow.com${path}`,
        authority: authorityMatch ? authorityMatch[2].trim() : 'Unknown',
        status,
        date: new Date().toISOString(),
      });
    }
    
    // Deduplicate by ID
    const seen = new Set<string>();
    return requests.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
    
  } catch (err) {
    console.error(`Failed to fetch ${url}:`, err);
    return [];
  }
}

// Check if a request contains relevant mobile theft data
function isRelevantRequest(title: string, authority: string): boolean {
  const titleLower = title.toLowerCase();
  const authorityLower = authority.toLowerCase();
  
  // Must be about mobile/phone theft
  const hasPhoneKeyword = /mobile|phone|smartphone|device|handset/i.test(titleLower);
  const hasTheftKeyword = /theft|stolen|robbery|snatch|crime/i.test(titleLower);
  
  // Should be from a police force
  const isPoliceForce = /police|constabulary|met|psni/i.test(authorityLower);
  
  return hasPhoneKeyword && hasTheftKeyword && isPoliceForce;
}

// Extract police force name from authority
function extractPoliceForce(authority: string): string | undefined {
  const patterns: Record<string, string> = {
    'metropolitan police': 'Metropolitan Police Service',
    'met police': 'Metropolitan Police Service',
    'the met': 'Metropolitan Police Service',
    'greater manchester': 'Greater Manchester Police',
    'west midlands': 'West Midlands Police',
    'west yorkshire': 'West Yorkshire Police',
    'merseyside': 'Merseyside Police',
    'south yorkshire': 'South Yorkshire Police',
    'northumbria': 'Northumbria Police',
    'thames valley': 'Thames Valley Police',
    'hampshire': 'Hampshire Constabulary',
    'kent police': 'Kent Police',
    'essex': 'Essex Police',
    'lancashire': 'Lancashire Constabulary',
    'sussex': 'Sussex Police',
    'avon and somerset': 'Avon and Somerset Police',
    'devon and cornwall': 'Devon and Cornwall Police',
    'nottinghamshire': 'Nottinghamshire Police',
    'leicestershire': 'Leicestershire Police',
    'city of london': 'City of London Police',
    'south wales': 'South Wales Police',
    'north wales': 'North Wales Police',
    'dyfed': 'Dyfed-Powys Police',
    'gwent': 'Gwent Police',
    'police scotland': 'Police Scotland',
    'psni': 'Police Service of Northern Ireland',
    'british transport': 'British Transport Police',
  };
  
  const authorityLower = authority.toLowerCase();
  for (const [pattern, name] of Object.entries(patterns)) {
    if (authorityLower.includes(pattern)) return name;
  }
  return undefined;
}

export const GET: APIRoute = async ({ url, request }) => {
  const unauthorized = requireApiKey(request);
  if (unauthorized) return unauthorized;

  if (!convex) {
    return new Response(JSON.stringify({ error: 'Missing CONVEX_URL' }), { status: 500 });
  }

  const maxPages = parseInt(url.searchParams.get('pages') || '5');
  
  try {
    const allRequests: WDTKRequest[] = [];
    
    // Fetch multiple pages from each search query
    for (const query of SEARCH_QUERIES) {
      for (let page = 1; page <= maxPages; page++) {
        const requests = await fetchWDTKSearchPage(query, page);
        allRequests.push(...requests);
        
        // Rate limiting
        await new Promise(r => setTimeout(r, 500));
      }
    }
    
    // Deduplicate
    const uniqueRequests = Array.from(
      new Map(allRequests.map(r => [r.id, r])).values()
    );
    
    // Filter to relevant requests
    const relevantRequests = uniqueRequests.filter(r => 
      isRelevantRequest(r.title, r.authority)
    );
    
    // Save to Convex
    const saved = [];
    const skipped = [];
    
    for (const req of relevantRequests) {
      try {
        // Check if already exists
        const existing = await convex.query(api.wdtkEntries.getByWdtkId, { 
          wdtkId: req.id 
        });
        
        if (existing) {
          skipped.push(req.title);
          continue;
        }
        
        const policeForce = extractPoliceForce(req.authority);
        const hasData = req.status === 'successful' || req.status === 'partial';
        
        await convex.mutation(api.wdtkEntries.create, {
          adminToken: import.meta.env.CRON_SECRET || process.env.CRON_SECRET,
          wdtkId: req.id,
          title: req.title,
          url: req.url,
          publishedAt: Date.now(),
          policeForce,
          status: (req.status as any) || 'unknown',
          hasData,
          dataImported: false,
        });
        
        saved.push({ title: req.title, policeForce, status: req.status });
      } catch (err) {
        console.error('Failed to save:', req.title, err);
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      totalFound: uniqueRequests.length,
      relevant: relevantRequests.length,
      saved: saved.length,
      skipped: skipped.length,
      entries: saved,
    }), { status: 200 });
    
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
