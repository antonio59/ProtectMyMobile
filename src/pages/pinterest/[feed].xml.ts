import type { APIRoute } from 'astro';
import pins from '../../data/pinterest-pins.json';
import { SITE_URL } from '../../lib/site';

/**
 * RSS feeds for Pinterest auto-publish, one per board:
 *   /pinterest/prevention.xml, /pinterest/travel.xml, /pinterest/nightlife.xml
 *
 * Connected in Pinterest under Settings → Create Pins in bulk → Connect RSS
 * feed. Pinterest re-reads each feed and pins new items within 24 hours, so
 * listing only pins whose publishAt has passed releases one a day on its own.
 * Rendered per request (not prerendered) so the date filter stays current.
 * Pins come from scripts/generate-pins.ts.
 */
export const prerender = false;

const FEED_TITLES: Record<string, string> = {
  prevention: 'Phone Theft Prevention Tips',
  travel: 'London Travel Safety Tips',
  nightlife: 'Nightlife Safety Tips',
};

const escapeXml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = ({ params }) => {
  const feed = params.feed ?? '';
  const title = FEED_TITLES[feed];
  if (!title) return new Response('Not found', { status: 404 });

  const now = Date.now();
  const due = pins
    .filter((p) => p.feed === feed && Date.parse(`${p.publishAt}Z`) <= now)
    .sort((a, b) => b.publishAt.localeCompare(a.publishAt));

  const items = due
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${escapeXml(p.link)}</link>
      <description>${escapeXml(p.description)}</description>
      <guid isPermaLink="false">${escapeXml(`pmm-pin-${p.setId}-${p.part}`)}</guid>
      <pubDate>${new Date(`${p.publishAt}Z`).toUTCString()}</pubDate>
      <enclosure url="${escapeXml(p.mediaUrl)}" length="${p.bytes}" type="image/jpeg" />
      <media:content url="${escapeXml(p.mediaUrl)}" medium="image" type="image/jpeg" width="1000" height="1500">
        <media:description type="plain">${escapeXml(p.altText)}</media:description>
      </media:content>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`ProtectMyMobile: ${title}`)}</title>
    <link>${SITE_URL}</link>
    <description>Illustrated UK phone theft safety guides from ProtectMyMobile.</description>
    <language>en-gb</language>
    <atom:link href="${SITE_URL}/pinterest/${feed}.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
