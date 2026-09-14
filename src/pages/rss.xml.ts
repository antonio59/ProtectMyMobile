import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { isUkPhoneTheftStory } from '../lib/news/geo';

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || 'https://example.convex.cloud';

export async function GET(context: APIContext) {
  const client = new ConvexHttpClient(convexUrl);
  
  let items: { title: string; pubDate: Date; description: string; link: string }[] = [];
  
  try {
    const posts = await client.query(api.newsPosts.list, { publishedOnly: true });
    items = posts
      .filter((post) => post.publishedAt)
      .filter((post) =>
        isUkPhoneTheftStory({
          title: post.title,
          excerpt: post.excerpt,
          sourceUrl: post.sourceUrl,
          sourceName: post.sourceName,
        }),
      )
      .slice(0, 20)
      .map((post) => ({
        title: post.title,
        pubDate: new Date(post.publishedAt!),
        description: post.excerpt,
        link: `/news/${post.slug}`,
      }));
  } catch {
    // If Convex is unavailable, return empty feed
  }

  return rss({
    title: 'ProtectMyMobile News',
    description: 'Latest UK phone theft news, prevention tips, and security updates',
    site: context.site ?? 'https://protectmymobile.org',
    items,
    customData: `<language>en-gb</language>`,
  });
}
