import type { APIRoute } from 'astro';
import Parser from 'rss-parser';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { Resend } from 'resend';

// Initialize RSS parser
const parser = new Parser();

// Initialize Convex client
const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

// Helper to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Helper to categorize article
function categorizeArticle(title: string, snippet: string): 'arrest' | 'seizure' | 'law_change' | 'statistics' | 'prevention_tip' | 'other' {
  const text = (title + ' ' + snippet).toLowerCase();
  
  if (text.includes('arrest') || text.includes('jail') || text.includes('sentenc') || text.includes('charg')) return 'arrest';
  if (text.includes('seiz') || text.includes('recover') || text.includes('found')) return 'seizure';
  if (text.includes('law') || text.includes('legislat') || text.includes('gov') || text.includes('polic')) return 'law_change';
  if (text.includes('stat') || text.includes('data') || text.includes('number') || text.includes('rise') || text.includes('increase')) return 'statistics';
  if (text.includes('protect') || text.includes('prevent') || text.includes('tip') || text.includes('safe')) return 'prevention_tip';
  
  return 'other';
}

export const GET: APIRoute = async () => {
  if (!convex) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Missing PUBLIC_CONVEX_URL. Cannot perform database operations.' 
    }), { status: 500 });
  }

  try {
    // 1. Fetch Google News RSS for UK mobile theft
    const feed = await parser.parseURL('https://news.google.com/rss/search?q=UK+mobile+phone+theft+when:1d&hl=en-GB&gl=GB&ceid=GB:en');
    
    if (!feed.items || feed.items.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No new articles found' }), { status: 200 });
    }

    // 2. Get existing posts to check for duplicates
    const existingPosts = await convex.query(api.newsPosts.list, { publishedOnly: false });
      
    const existingUrls = new Set(existingPosts?.map((p: any) => p.sourceUrl) || []);
    const existingSlugs = new Set(existingPosts?.map((p: any) => p.slug) || []);
    
    const newArticles = [];
    const createdPosts = [];

    // 3. Filter and Process
    for (const item of feed.items) {
      if (!item.link || !item.title) continue;
      if (existingUrls.has(item.link)) continue;
      
      const text = (item.title + ' ' + (item.contentSnippet || '')).toLowerCase();
      const keywords = ['phone', 'mobile', 'device', 'iphone', 'samsung'];
      if (!keywords.some(k => text.includes(k))) continue;

      newArticles.push(item);
    }

    // 4. Insert into Database
    for (const article of newArticles.slice(0, 5)) {
      try {
        const slug = generateSlug(article.title!);
        if (existingSlugs.has(slug)) continue;

        const category = categorizeArticle(article.title!, article.contentSnippet || '');
        
        const newPostId = await convex.mutation(api.newsPosts.create, {
          title: article.title!,
          slug: slug,
          excerpt: article.contentSnippet?.substring(0, 150) + '...' || 'No excerpt available.',
          content: article.content || article.contentSnippet || 'Content to be curated.',
          authorName: 'Automated News Bot',
          category: category,
          sourceUrl: article.link,
          sourceName: article.source?.trim() || 'Google News',
          published: true
        });

        if (newPostId) {
          createdPosts.push({
            _id: newPostId,
            title: article.title!,
            sourceUrl: article.link,
            sourceName: article.source?.trim() || 'Google News',
            category: category
          });
        }
        
      } catch (err) {
        console.error('Failed to create post:', article.title, err);
      }
    }

    // 5. Notify Admin via Resend
    if (createdPosts.length > 0) {
      const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
      
      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          
          await resend.emails.send({
            from: 'ProtectMyMobile <onboarding@resend.dev>',
            to: ['delivered@resend.dev'],
            subject: `📢 ${createdPosts.length} New News Drafts Created`,
            html: `
              <h2>New Draft Articles Detected</h2>
              <p>The automated scraper found ${createdPosts.length} new articles:</p>
              <ul>
                ${createdPosts.map((p: any) => `
                  <li>
                    <strong>${p.title}</strong><br>
                    <span style="font-size: 0.8em; color: #666;">${p.sourceName} • ${p.category}</span><br>
                    <a href="${p.sourceUrl}">Original Link</a>
                  </li>
                `).join('')}
              </ul>
            `
          });
        } catch (emailErr) {
          console.error('Failed to send email notification:', emailErr);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${newArticles.length} new articles, created ${createdPosts.length} drafts.`,
        posts: createdPosts.map((p: any) => p.title)
      }), 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('News fetch error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { status: 500 }
    );
  }
};
