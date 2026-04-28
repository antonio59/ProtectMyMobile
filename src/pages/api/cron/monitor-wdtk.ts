import type { APIRoute } from 'astro';
import { api } from '../../../../convex/_generated/api';
import Parser from 'rss-parser';
import { getConvexClient, requireConvex, sendReportEmail } from '../../../lib/cron-utils';

const convex = getConvexClient();
const parser = new Parser();

// WhatDoTheyKnow RSS feeds to monitor
const WDTK_FEEDS = [
  'https://www.whatdotheyknow.com/feed/search/mobile%20phone%20theft',
  'https://www.whatdotheyknow.com/feed/search/phone%20theft%20statistics',
  'https://www.whatdotheyknow.com/feed/search/smartphone%20theft',
];

interface WDTKEntry {
  id: string;
  title: string;
  link: string;
  published: string;
  content: string;
  policeForce?: string;
  status?: string;
}

function extractPoliceForce(content: string): string | undefined {
  const policePatterns = [
    /Metropolitan Police/i,
    /Greater Manchester Police/i,
    /West Midlands Police/i,
    /West Yorkshire Police/i,
    /Merseyside Police/i,
    /South Yorkshire Police/i,
    /Northumbria Police/i,
    /Thames Valley Police/i,
    /Hampshire (?:Constabulary|Police)/i,
    /Kent Police/i,
    /Essex Police/i,
    /Lancashire (?:Constabulary|Police)/i,
    /Sussex Police/i,
    /Avon and Somerset (?:Constabulary|Police)/i,
    /Devon and Cornwall Police/i,
    /Nottinghamshire Police/i,
    /Leicestershire (?:Constabulary|Police)/i,
    /City of London Police/i,
    /South Wales Police/i,
    /North Wales Police/i,
    /Dyfed-Powys Police/i,
    /Gwent Police/i,
    /Police Scotland/i,
    /Police Service of Northern Ireland|PSNI/i,
    /British Transport Police/i,
  ];

  for (const pattern of policePatterns) {
    const match = content.match(pattern);
    if (match) return match[0];
  }
  return undefined;
}

function extractStatus(content: string): string {
  if (/Successful/i.test(content)) return 'successful';
  if (/Partially successful/i.test(content)) return 'partial';
  if (/Refused/i.test(content)) return 'refused';
  if (/Awaiting response/i.test(content)) return 'awaiting';
  if (/Awaiting classification/i.test(content)) return 'classification';
  return 'unknown';
}

function isRelevantEntry(item: any): WDTKEntry | null {
  const text = ((item.title || '') + ' ' + (item.content || '')).toLowerCase();
  if (!text.includes('mobile') && !text.includes('phone theft') && !text.includes('smartphone')) return null;
  return {
    id: item.id || item.link || '',
    title: item.title || '',
    link: item.link || '',
    published: item.pubDate || item.isoDate || '',
    content: item.content || '',
    policeForce: extractPoliceForce(item.content || ''),
    status: extractStatus(item.content || ''),
  };
}

async function fetchFeedEntries(feedUrl: string): Promise<WDTKEntry[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const entries: WDTKEntry[] = [];
    for (const item of feed.items || []) {
      const entry = isRelevantEntry(item);
      if (entry) entries.push(entry);
    }
    return entries;
  } catch (err) {
    console.error(`Failed to fetch feed ${feedUrl}:`, err);
    return [];
  }
}

export const GET: APIRoute = async ({ request }) => {
  const missingConvex = requireConvex(convex);
  if (missingConvex) return missingConvex;

  try {
    const feedResults = await Promise.all(WDTK_FEEDS.map(fetchFeedEntries));
    const allEntries = feedResults.flat();

    // Deduplicate by ID
    const uniqueEntries = Array.from(
      new Map(allEntries.map(e => [e.id, e])).values()
    );

    // Get existing WDTK entries from our database
    const existingEntries = await convex.query(api.wdtkEntries.list, {}) || [];
    const existingIds = new Set(existingEntries.map((e: any) => e.wdtkId));

    // Filter to only new entries
    const newEntries = uniqueEntries.filter(e => !existingIds.has(e.id));

    // Save new entries
    const saved = [];
    for (const entry of newEntries) {
      try {
        await convex.mutation(api.wdtkEntries.create, {
          adminToken: import.meta.env.CRON_SECRET || process.env.CRON_SECRET,
          wdtkId: entry.id,
          title: entry.title,
          url: entry.link,
          publishedAt: new Date(entry.published).getTime(),
          policeForce: entry.policeForce,
          status: entry.status as any,
          hasData: entry.status === 'successful' || entry.status === 'partial',
          dataImported: false,
        });
        saved.push(entry.title);
      } catch (err) {
        console.error('Failed to save entry:', entry.title, err);
      }
    }

    // Count successful responses that need data extraction
    const successfulNew = newEntries.filter(
      e => e.status === 'successful' || e.status === 'partial'
    );

    if (successfulNew.length > 0) {
      await sendReportEmail(
        `🎉 ${successfulNew.length} New FOI Responses Found on WhatDoTheyKnow`,
        `
          <h2>New Successful FOI Responses Detected</h2>
          <p>The following FOI requests have received responses with data:</p>
          <ul>
            ${successfulNew.map(e => `
              <li>
                <strong>${e.policeForce || 'Unknown Force'}</strong>: ${e.title}<br>
                <a href="${e.link}">View on WhatDoTheyKnow</a>
              </li>
            `).join('')}
          </ul>
          <p><a href="https://protectmymobile.xyz/admin/foi">Import data in Admin Dashboard</a></p>
        `
      );
    }

    return new Response(JSON.stringify({
      success: true,
      feeds_checked: WDTK_FEEDS.length,
      total_entries: uniqueEntries.length,
      new_entries: newEntries.length,
      successful_responses: successfulNew.length,
      saved: saved,
    }), { status: 200 });

  } catch (error: any) {
    console.error('WDTK monitor error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { status: 500 });
  }
};
