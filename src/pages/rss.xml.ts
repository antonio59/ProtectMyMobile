import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;

export async function GET(context: APIContext) {
  const client = new ConvexHttpClient(convexUrl);
  
  let items: { title: string; pubDate: Date; description: string; link: string }[] = [];
  
  try {
    const posts = await client.query(api.news.getPublishedPosts, { limit: 20 });
    items = posts.map((post: { title: string; publishedAt: number; excerpt: string; slug: string }) => ({
      title: post.title,
      pubDate: new Date(post.publishedAt),
      description: post.excerpt,
      link: `/news/${post.slug}`,
    }));
  } catch {
    // If Convex is unavailable, return empty feed
  }

  return rss({
    title: 'ProtectMyMobile News',
    description: 'Latest UK phone theft news, prevention tips, and security updates',
    site: context.site ?? 'https://protectmymobile.xyz',
    items,
    customData: `<language>en-gb</language>`,
  });
}
