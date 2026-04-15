import type { APIRoute } from "astro";
import Parser from "rss-parser";
import { parse } from "node-html-parser";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Resend } from "resend";
import { requireApiKey } from "../../../lib/security";

const parser = new Parser({
  customFields: {
    item: ["media:content", "media:thumbnail", "content:encoded"],
  },
  timeout: 5000, // 5 second timeout per feed
});

interface NewsSource {
  name: string;
  url: string;
  priority: number;
}

const NEWS_SOURCES: NewsSource[] = [
  {
    name: "Google News",
    url: "https://news.google.com/rss/search?q=UK+mobile+phone+theft+when:7d&hl=en-GB&gl=GB&ceid=GB:en",
    priority: 1,
  },
  {
    name: "Google News (Smartphone)",
    url: "https://news.google.com/rss/search?q=smartphone+theft+UK+when:7d&hl=en-GB&gl=GB&ceid=GB:en",
    priority: 2,
  },
  {
    name: "Guardian UK",
    url: "https://www.theguardian.com/uk/rss",
    priority: 3,
  },
  {
    name: "Guardian UK Crime",
    url: "https://www.theguardian.com/uk/crime/rss",
    priority: 4,
  },
  // Note: BBC feed removed - returns 404
  // Note: Daily Mail feed removed - returns 404
  {
    name: "Sky News UK",
    url: "https://feeds.skynews.com/feeds/rss/uk.xml",
    priority: 5,
  },
  {
    name: "The Independent UK News",
    url: "https://www.independent.co.uk/news/uk/rss",
    priority: 6,
  },
  {
    name: "Evening Standard",
    url: "https://www.standard.co.uk/rss",
    priority: 7,
  },
  {
    name: "Metro UK News",
    url: "https://metro.co.uk/news/uk/feed/",
    priority: 8,
  },
  {
    name: "Daily Mail UK News",
    url: "https://www.dailymail.co.uk/news/uk/index.rss",
    priority: 9,
  },
  {
    name: "The Telegraph UK",
    url: "https://www.telegraph.co.uk/news/rss.xml",
    priority: 10,
  },
  {
    name: "Mirror UK News",
    url: "https://www.mirror.co.uk/news/uk-news/rss.xml",
    priority: 11,
  },
  {
    name: "ITV News",
    url: "https://www.itv.com/news/rss/",
    priority: 12,
  },
];

const IRRELEVANT_KEYWORDS = [
  "car",
  "vehicle",
  "motorbike",
  "motorcycle",
  "bicycle",
  "van",
  "truck",
  "lorry",
];

// Enhanced keyword sets with scoring weights
const HIGHLY_RELEVANT_KEYWORDS = [
  "phone theft",
  "mobile phone theft",
  "smartphone theft",
  "phone stolen",
  "mobile stolen",
  "stolen phones",
  "stolen mobile",
  "stolen smartphone",
  "iphone theft",
  "iphone stolen",
  "phone snatched",
  "mobile snatched",
  "phones seized",
  "mobile seized",
  "phone raid",
  "phones recovered",
  "pick-pocket",
  "pickpocket",
  "moped gang",
  "phone grab",
  "mobile grab",
];

const RELEVANT_KEYWORDS = [
  "phone",
  "mobile",
  "smartphone",
  "iphone",
  "android",
  "samsung",
  "device",
  "handset",
  "snatch",
  "snatched",
  "grab",
  "grabbed",
  "seized",
  "seize",
  "recovered",
  "recovery",
  "raid",
  "arrested",
  "arrest",
  "e-bike",
  "theft",
  "stolen",
  "robbed",
  "robbery",
];

const LOCATION_KEYWORDS = [
  "london",
  "westminster",
  "camden",
  "shoreditch",
  "soho",
  "brixton",
  "clapham",
  "hackney",
  "islington",
  "tube",
  "underground",
  "bus",
  "oxford street",
  "piccadilly",
  "covent garden",
  "southbank",
  "kensington",
  "chelsea",
  "manchester",
  "birmingham",
  "liverpool",
  "glasgow",
  "edinburgh",
  "bristol",
  "leeds",
  "sheffield",
];

async function fetchWithRetry(
  url: string,
  maxRetries = 2,
  initialDelay = 500,
  timeoutMs = 4000,
): Promise<Response> {
  const userAgent =
    "Mozilla/5.0 (compatible; ProtectMyMobile-Bot/1.0; +https://protectmymobile.xyz)";

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": userAgent,
          Accept: "application/rss+xml, application/xml, text/xml",
        },
      });
      clearTimeout(timeoutId);

      if (response.ok) return response;

      if (attempt === maxRetries) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Max retries exceeded");
}

/**
 * Calculate relevance score (0-100) for an article
 * Returns score and whether article should be imported (score >= 60)
 */
function calculateRelevanceScore(
  title: string,
  snippet: string,
): { score: number; shouldImport: boolean; reason: string } {
  const text = (title + " " + snippet).toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  // Immediate disqualification for irrelevant keywords
  const hasIrrelevantKeyword = IRRELEVANT_KEYWORDS.some((k) =>
    text.includes(k),
  );
  if (hasIrrelevantKeyword) {
    return {
      score: 0,
      shouldImport: false,
      reason: "Contains irrelevant vehicle keywords",
    };
  }

  // High relevance keywords (30 points each, max 60)
  let highRelevanceMatches = 0;
  for (const keyword of HIGHLY_RELEVANT_KEYWORDS) {
    if (text.includes(keyword)) {
      highRelevanceMatches++;
      reasons.push(`High match: "${keyword}"`);
    }
  }
  const highRelevanceScore = Math.min(highRelevanceMatches * 30, 60);
  score += highRelevanceScore;

  // Regular relevance keywords (10 points each, max 40)
  let relevanceMatches = 0;
  for (const keyword of RELEVANT_KEYWORDS) {
    if (text.includes(keyword)) {
      relevanceMatches++;
    }
  }
  const relevanceScore = Math.min(relevanceMatches * 10, 40);
  score += relevanceScore;

  // Location bonus (15 points, max 15)
  let locationMatches = 0;
  for (const location of LOCATION_KEYWORDS) {
    if (text.includes(location)) {
      locationMatches++;
      reasons.push(`Location: "${location}"`);
    }
  }
  const locationScore = locationMatches > 0 ? 15 : 0;
  score += locationScore;

  // Bonus for phone-specific crime terms in title (15 points)
  const titleLower = title.toLowerCase();
  if (
    (titleLower.includes("phone") || titleLower.includes("mobile")) &&
    (titleLower.includes("theft") ||
      titleLower.includes("stolen") ||
      titleLower.includes("snatch") ||
      titleLower.includes("rob") ||
      titleLower.includes("seized") ||
      titleLower.includes("recovered") ||
      titleLower.includes("raid") ||
      titleLower.includes("arrested"))
  ) {
    score += 15;
    reasons.push("Phone crime in title");
  }

  // Cap score at 100
  score = Math.min(score, 100);

  const shouldImport = score >= 45;
  const reason = reasons.length > 0 ? reasons.join(", ") : "Low relevance";

  return { score, shouldImport, reason };
}

/**
 * Remove HTML tags and decode entities from text
 */
function stripHtml(html: string): string {
  if (!html) return "";

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, " ");

  // Decode common HTML entities
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&mdash;": "—",
    "&ndash;": "–",
    "&hellip;": "...",
  };

  for (const [entity, char] of Object.entries(entities)) {
    text = text.replace(new RegExp(entity, "g"), char);
  }

  // Decode numeric entities
  text = text.replace(/&#(\d+);/g, (_match, dec) =>
    String.fromCharCode(Number(dec)),
  );
  text = text.replace(/&#x([0-9a-f]+);/gi, (_match, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );

  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Extract clean excerpt from content
 */
function extractExcerpt(
  content: string | undefined,
  maxLength: number = 150,
): string {
  if (!content) return "No excerpt available.";

  const cleanText = stripHtml(content);
  if (cleanText.length <= maxLength) return cleanText;

  // Find the last complete sentence or word within maxLength
  const truncated = cleanText.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastPeriod > maxLength * 0.7) {
    return truncated.substring(0, lastPeriod + 1);
  } else if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Extract featured image URL from HTML meta tags
 */
function extractFeaturedImage(html: string, baseUrl: string): string | null {
  const ogImageMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  );
  const twitterImageMatch = html.match(
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  );

  const imageUrl = ogImageMatch?.[1] || twitterImageMatch?.[1];
  if (!imageUrl) return null;

  // Make relative URLs absolute
  if (imageUrl.startsWith("http")) return imageUrl;
  try {
    return new URL(imageUrl, baseUrl).href;
  } catch {
    return null;
  }
}

/**
 * Scrape article content from a URL without AI.
 * Tries multiple strategies: direct HTML scrape, r.jina.ai extraction.
 */
async function scrapeArticleContent(
  url: string,
): Promise<{ content: string; featuredImageUrl: string | null }> {
  let featuredImageUrl: string | null = null;

  // Strategy 1: Direct HTML scrape for image + content (short timeout to avoid function timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ProtectMyMobile-Bot/1.0; +https://protectmymobile.xyz)",
        Accept: "text/html",
      },
    });
    clearTimeout(timeoutId);
    const html = await response.text();
    featuredImageUrl = extractFeaturedImage(html, url);

    // Only use direct HTML if it looks like real content (not a bot block page)
    if (!html.includes("Access Denied") && !html.includes("403 Forbidden") && html.length > 5000) {
      const root = parse(html);

      // Remove non-content elements entirely
      const tagsToRemove = ["script", "style", "nav", "header", "footer", "aside", "noscript"];
      tagsToRemove.forEach((tag) => {
        root.querySelectorAll(tag).forEach((el) => el.remove());
      });

      // Remove HTML comments
      root.childNodes.forEach((node) => {
        if (node.nodeType === 8) {
          node.remove();
        }
      });

      // Try to extract the main article body via common selectors
      let contentNode = root.querySelector("article");
      if (!contentNode) {
        const selectors = [
          "[class*='article-body']",
          "[class*='article__body']",
          "[class*='content-body']",
          "[class*='story-body']",
          "[class*='main-content']",
          "[class*='post-content']",
          "main",
        ];
        for (const selector of selectors) {
          contentNode = root.querySelector(selector);
          if (contentNode) break;
        }
      }

      // Fallback to body
      if (!contentNode) {
        contentNode = root.querySelector("body") || root;
      }

      // Extract text from paragraphs, preferring longer ones
      const paragraphs = contentNode
        .querySelectorAll("p")
        .map((p) => p.text.trim())
        .filter((text) => text.length > 30);

      let content = paragraphs.length > 0
        ? paragraphs.join("\n\n").trim()
        : contentNode.text.trim();

      if (content.length > 3000) {
        content = content.substring(0, 3000).trim() + "...";
      }

      if (content.length > 200) {
        return { content, featuredImageUrl };
      }
    }
  } catch (err: any) {
    logMessage("warning", `Direct scrape failed for ${url}`, err.message);
  }

  // Strategy 2: r.jina.ai extraction (free, no-auth fallback)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const jinaResponse = await fetch(`https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`, {
      signal: controller.signal,
      headers: { "User-Agent": "ProtectMyMobile-Bot/1.0" },
    });
    clearTimeout(timeoutId);
    if (jinaResponse.ok) {
      const jinaText = await jinaResponse.text();
      if (jinaText && !jinaText.includes("Access Denied") && !jinaText.includes("403 Forbidden") && jinaText.length > 200) {
        let content = jinaText.trim();
        if (content.length > 3000) {
          content = content.substring(0, 3000).trim() + "...";
        }
        return { content, featuredImageUrl };
      }
    }
  } catch (err: any) {
    logMessage("warning", `r.jina.ai failed for ${url}`, err.message);
  }

  return { content: "Content to be curated.", featuredImageUrl };
}

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Enhanced categorization with more accurate logic
 */
function categorizeArticle(
  title: string,
  snippet: string,
):
  | "arrest"
  | "seizure"
  | "law_change"
  | "statistics"
  | "prevention_tip"
  | "other" {
  const text = (title + " " + snippet).toLowerCase();
  const titleLower = title.toLowerCase();

  // Arrest/Prosecution (check title first for higher confidence)
  if (
    titleLower.includes("arrest") ||
    titleLower.includes("jailed") ||
    titleLower.includes("sentenced") ||
    titleLower.includes("convicted") ||
    titleLower.includes("charged") ||
    titleLower.includes("court")
  ) {
    return "arrest";
  }
  if (
    text.includes("arrest") ||
    text.includes("jail") ||
    text.includes("prison") ||
    text.includes("sentenc") ||
    text.includes("charg") ||
    text.includes("convict") ||
    text.includes("prosecut") ||
    text.includes("appear in court") ||
    text.includes("guilty") ||
    text.includes("plead")
  ) {
    return "arrest";
  }

  // Seizure/Recovery
  if (
    titleLower.includes("seized") ||
    titleLower.includes("recovered") ||
    titleLower.includes("found")
  ) {
    return "seizure";
  }
  if (
    text.includes("seiz") ||
    text.includes("recover") ||
    (text.includes("found") && text.includes("phone")) ||
    text.includes("return") ||
    text.includes("retriev")
  ) {
    return "seizure";
  }

  // Statistics (strong indicators in title)
  if (
    titleLower.includes("statistics") ||
    titleLower.includes("data shows") ||
    titleLower.includes("figures") ||
    titleLower.includes("rise in") ||
    titleLower.includes("increase in") ||
    titleLower.includes("surge in") ||
    titleLower.includes("spike in") ||
    /\d+%/.test(titleLower) ||
    /\d+,\d+/.test(titleLower)
  ) {
    return "statistics";
  }
  if (
    text.includes("statistic") ||
    text.includes("data") ||
    text.includes("figures reveal") ||
    text.includes("report shows") ||
    text.includes("study finds") ||
    text.includes("research") ||
    (text.includes("number") &&
      (text.includes("rise") ||
        text.includes("increase") ||
        text.includes("surge") ||
        text.includes("double"))) ||
    text.includes("rate") ||
    /\d+% (increase|rise|surge|higher)/.test(text)
  ) {
    return "statistics";
  }

  // Prevention tips
  if (
    titleLower.includes("how to protect") ||
    titleLower.includes("tips") ||
    titleLower.includes("advice") ||
    titleLower.includes("prevent") ||
    titleLower.includes("warning")
  ) {
    return "prevention_tip";
  }
  if (
    text.includes("protect yourself") ||
    text.includes("stay safe") ||
    text.includes("safety tips") ||
    text.includes("prevent") ||
    text.includes("avoid") ||
    text.includes("advice") ||
    text.includes("warning") ||
    text.includes("be aware") ||
    text.includes("security tips") ||
    text.includes("how to keep your phone safe")
  ) {
    return "prevention_tip";
  }

  // Law change/Policy (must be specific to avoid false positives)
  if (
    titleLower.includes("new law") ||
    titleLower.includes("legislation") ||
    titleLower.includes("bill") ||
    titleLower.includes("government announce") ||
    titleLower.includes("policy")
  ) {
    return "law_change";
  }
  if (
    (text.includes("law") && text.includes("new")) ||
    text.includes("legislat") ||
    text.includes("parliament") ||
    (text.includes("government") &&
      (text.includes("announce") || text.includes("plan"))) ||
    (text.includes("police") &&
      (text.includes("new") || text.includes("strategy"))) ||
    text.includes("policy change") ||
    text.includes("regulation")
  ) {
    return "law_change";
  }

  return "other";
}

function logMessage(
  level: "info" | "warning" | "error",
  message: string,
  details?: string,
) {
  console.log(`[NewsFetch][${level.toUpperCase()}]`, message, details || "");
}

export const GET: APIRoute = async ({ request }) => {
  const startTime = Date.now();
  const unauthorized = requireApiKey(request);
  if (unauthorized) return unauthorized;

  const url = new URL(request.url);
  const dryRun = url.searchParams.has("dryRun");

  if (!convex) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing PUBLIC_CONVEX_URL. Cannot perform database operations.",
      }),
      { status: 500 },
    );
  }

  if (dryRun) {
    return new Response(
      JSON.stringify({
        success: true,
        dryRun: true,
        message: "News fetch endpoint is reachable and authenticated.",
        convexUrl: convexUrl ? "configured" : "missing",
      }),
      { status: 200 },
    );
  }

  try {
    const existingPosts = await convex.query(api.newsPosts.list, {
      publishedOnly: false,
    });

    const existingUrls = new Set(
      existingPosts?.map((p: any) => p.sourceUrl) || [],
    );
    const existingSlugs = new Set(existingPosts?.map((p: any) => p.slug) || []);

    const allItems: any[] = [];
    const sourcesFetched: string[] = [];
    const sourcesFailed: Array<{ name: string; error: string }> = [];

    // Fetch RSS feeds in parallel with individual timeouts to avoid hanging
    const feedResults = await Promise.all(
      NEWS_SOURCES.map(async (source) => {
        try {
          logMessage("info", `Fetching from ${source.name}`);
          const response = await fetchWithRetry(source.url, 2, 500, 3500);
          const xml = await response.text();
          const feed = await parser.parseString(xml);
          logMessage(
            "info",
            `Successfully fetched ${feed.items?.length || 0} items from ${source.name}`,
          );
          return { source, items: feed.items || [] };
        } catch (err: any) {
          logMessage("error", `Failed to fetch from ${source.name}`, err.message);
          return { source, items: [], error: err.message };
        }
      }),
    );

    for (const result of feedResults) {
      if (result.items.length > 0) {
        allItems.push(...result.items);
        sourcesFetched.push(result.source.name);
      } else if (result.error) {
        sourcesFailed.push({ name: result.source.name, error: result.error });
      }
    }

    if (allItems.length === 0) {
      logMessage("warning", "No articles found from any source");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No articles found",
          sourcesFetched,
          sourcesFailed,
          duration: Date.now() - startTime,
        }),
        { status: 200 },
      );
    }

    const newArticles: Array<{
      item: any;
      relevanceScore: number;
      relevanceReason: string;
    }> = [];
    const createdPosts = [];
    const seenGuids = new Set();
    const rejectedArticles: Array<{
      title: string;
      score: number;
      reason: string;
    }> = [];

    // Filter and score articles
    for (const item of allItems) {
      if (!item.link || !item.title) continue;
      if (item.guid && seenGuids.has(item.guid)) continue;
      if (existingUrls.has(item.link)) continue;

      const snippet = stripHtml(item.contentSnippet || item.content || "");
      const { score, shouldImport, reason } = calculateRelevanceScore(
        item.title,
        snippet,
      );

      if (shouldImport) {
        if (item.guid) seenGuids.add(item.guid);
        newArticles.push({
          item,
          relevanceScore: score,
          relevanceReason: reason,
        });
        logMessage(
          "info",
          `Article passed relevance check (score: ${score})`,
          `"${item.title.substring(0, 60)}..." - ${reason}`,
        );
      } else {
        rejectedArticles.push({
          title: item.title.substring(0, 60) + "...",
          score,
          reason,
        });
      }
    }

    // Sort by relevance score (highest first)
    newArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);

    logMessage(
      "info",
      `Filtered ${allItems.length} items to ${newArticles.length} relevant articles (score >= 45)`,
    );

    // Create posts for top articles (limit to 5 to stay safely within Netlify 10s timeout)
    for (const { item: article, relevanceScore } of newArticles.slice(0, 5)) {
      try {
        const slug = generateSlug(article.title!);
        if (existingSlugs.has(slug)) continue;

        const cleanSnippet = stripHtml(
          article.contentSnippet || article.content || "",
        );
        const excerpt = extractExcerpt(cleanSnippet, 150);
        const category = categorizeArticle(article.title!, cleanSnippet);

        // Try to get full content from RSS content:encoded first
        const rssFullContent = (article as any)["content:encoded"];
        let finalContent = "";
        let featuredImageUrl: string | null = null;

        if (rssFullContent && stripHtml(rssFullContent).trim().length > 200) {
          finalContent = stripHtml(rssFullContent).trim();
          if (finalContent.length > 3000) {
            finalContent = finalContent.substring(0, 3000).trim() + "...";
          }
          logMessage("info", `Using RSS full content for ${article.title!.substring(0, 40)}`);
        } else {
          // Scrape full article content and featured image from source
          const scraped = await scrapeArticleContent(article.link!);
          finalContent =
            scraped.content !== "Content to be curated."
              ? scraped.content
              : article.content || article.contentSnippet || "Content to be curated.";
          featuredImageUrl = scraped.featuredImageUrl;
        }

        const newPostId = await convex.mutation(api.newsPosts.create, {
          adminToken: import.meta.env.CRON_SECRET || process.env.CRON_SECRET,
          title: article.title!,
          slug: slug,
          excerpt: excerpt,
          content: finalContent,
          authorName: "Automated News Bot",
          category: category,
          sourceUrl: article.link,
          sourceName: article.source?.trim() || "News Feed",
          featuredImageUrl: featuredImageUrl || undefined,
          published: true,
        });

        if (newPostId) {
          createdPosts.push({
            _id: newPostId,
            title: article.title!,
            sourceUrl: article.link,
            sourceName: article.source?.trim() || "News Feed",
            category: category,
            relevanceScore: relevanceScore,
          });
        }
      } catch (err: any) {
        logMessage(
          "error",
          `Failed to create post: ${article.title}`,
          err.message,
        );
      }
    }

    if (createdPosts.length > 0) {
      const resendApiKey =
        import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);

          await resend.emails.send({
            from: "ProtectMyMobile <onboarding@resend.dev>",
            to: ["protectmymobile.xyz.overlabor129@passmail.com"],
            subject: `${createdPosts.length} New News Articles Created`,
            html: `
              <h2>New Articles Detected</h2>
              <p>The automated scraper found ${createdPosts.length} new articles from ${sourcesFetched.length} source(s):</p>
              <p><strong>Sources:</strong> ${sourcesFetched.join(", ")}</p>
              <ul>
                ${createdPosts
                  .map(
                    (p: any) => `
                  <li>
                    <strong>${p.title}</strong><br>
                    <span style="font-size: 0.8em; color: #666;">
                      ${p.sourceName} • ${p.category} • Relevance: ${p.relevanceScore}/100
                    </span><br>
                    <a href="${p.sourceUrl}">Original Link</a>
                  </li>
                `,
                  )
                  .join("")}
              </ul>
              ${
                sourcesFailed.length > 0
                  ? `
                <p style="color: #dc2626;"><strong>Failed sources:</strong> ${sourcesFailed.map((f) => `${f.name} (${f.error})`).join(", ")}</p>
              `
                  : ""
              }
              ${
                rejectedArticles.length > 0
                  ? `
                <details>
                  <summary><strong>Rejected Articles (${rejectedArticles.length})</strong></summary>
                  <ul style="font-size: 0.85em;">
                    ${rejectedArticles
                      .slice(0, 10)
                      .map(
                        (r) =>
                          `<li>${r.title} (Score: ${r.score}) - ${r.reason}</li>`,
                      )
                      .join("")}
                  </ul>
                </details>
              `
                  : ""
              }
            `,
          });
        } catch (emailErr: any) {
          logMessage(
            "error",
            "Failed to send email notification",
            emailErr instanceof Error ? emailErr.message : String(emailErr),
          );
        }
      }

      // Trigger a Netlify rebuild so new articles are included in sitemap/static generation
      const buildHookUrl =
        import.meta.env.NETLIFY_BUILD_HOOK_URL || process.env.NETLIFY_BUILD_HOOK_URL;
      if (buildHookUrl) {
        try {
          fetch(buildHookUrl, { method: "POST" })
            .then((res) => {
              logMessage(
                "info",
                `Build hook triggered`,
                `Status: ${res.status}`,
              );
            })
            .catch((err) => {
              logMessage(
                "warning",
                `Build hook request failed`,
                err.message,
              );
            });
        } catch (err: any) {
          logMessage("warning", `Build hook trigger failed`, err.message);
        }
      }
    }

    logMessage(
      "info",
      `News fetch completed successfully`,
      `Total: ${allItems.length}, New: ${newArticles.length}, Created: ${createdPosts.length}, Rejected: ${rejectedArticles.length}, Sources: ${sourcesFetched.join(", ")}`,
    );

    const result = {
      success: true,
      message: `Processed ${newArticles.length} articles, created ${createdPosts.length} posts.`,
      totalFound: allItems.length,
      newArticles: newArticles.length,
      rejectedArticles: rejectedArticles.length,
      createdPosts: createdPosts.length,
      sourcesFetched,
      sourcesFailed,
      posts: createdPosts.map((p: any) => ({
        title: p.title,
        category: p.category,
        relevanceScore: p.relevanceScore,
      })),
      topRejections: rejectedArticles.slice(0, 5),
      duration: Date.now() - startTime,
    };

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error: any) {
    logMessage("error", "News fetch failed", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 },
    );
  }
};
