import type { APIRoute } from "astro";
import Parser from "rss-parser";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Resend } from "resend";
import { requireApiKey } from "../../../lib/security";

const parser = new Parser({
  customFields: {
    item: ["media:content", "media:thumbnail"],
  },
  timeout: 30000,
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
    name: "BBC News UK",
    url: "https://feeds.bbci.co.uk/news/uk/england/rss.xml",
    priority: 3,
  },
  {
    name: "Guardian UK Crime",
    url: "https://www.theguardian.com/uk/crime/rss",
    priority: 4,
  },
];

const IRRELEVANT_KEYWORDS = [
  "car",
  "vehicle",
  "motorbike",
  "motorcycle",
  "bicycle",
  "bike",
  "van",
  "truck",
  "lorry",
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
];

async function fetchWithRetry(
  url: string,
  maxRetries = 3,
  initialDelay = 1000,
): Promise<Response> {
  const userAgent =
    "Mozilla/5.0 (compatible; ProtectMyMobile-Bot/1.0; +https://protectmymobile.xyz)";

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": userAgent,
          Accept: "application/rss+xml, application/xml, text/xml",
        },
      });

      if (response.ok) return response;

      if (attempt === maxRetries) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error: any) {
      if (attempt === maxRetries) throw error;
      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Max retries exceeded");
}

function isArticleRelevant(title: string, snippet: string): boolean {
  const text = (title + " " + snippet).toLowerCase();

  const hasIrrelevantKeyword = IRRELEVANT_KEYWORDS.some((k) =>
    text.includes(k),
  );
  if (hasIrrelevantKeyword) return false;

  const hasRelevantKeyword = RELEVANT_KEYWORDS.some((k) => text.includes(k));
  return hasRelevantKeyword;
}

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

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

  if (
    text.includes("arrest") ||
    text.includes("jail") ||
    text.includes("sentenc") ||
    text.includes("charg")
  )
    return "arrest";
  if (
    text.includes("seiz") ||
    text.includes("recover") ||
    text.includes("found")
  )
    return "seizure";
  if (
    text.includes("law") ||
    text.includes("legislat") ||
    text.includes("gov") ||
    text.includes("polic")
  )
    return "law_change";
  if (
    text.includes("stat") ||
    text.includes("data") ||
    text.includes("number") ||
    text.includes("rise") ||
    text.includes("increase")
  )
    return "statistics";
  if (
    text.includes("protect") ||
    text.includes("prevent") ||
    text.includes("tip") ||
    text.includes("safe")
  )
    return "prevention_tip";

  return "other";
}

async function logMessage(
  level: "info" | "warning" | "error",
  message: string,
  details?: string,
) {
  console.error(`[NewsFetch][${level.toUpperCase()}]`, message, details);
  if (convex) {
    try {
      await convex.mutation(api.systemLogs.create, {
        level,
        source: "news_scraper",
        message,
        details,
      });
    } catch (e) {
      console.error("Failed to log to Convex:", e);
    }
  }
}

export const GET: APIRoute = async ({ request }) => {
  const startTime = Date.now();
  const unauthorized = requireApiKey(request);
  if (unauthorized) return unauthorized;

  if (!convex) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing PUBLIC_CONVEX_URL. Cannot perform database operations.",
      }),
      { status: 500 },
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

    for (const source of NEWS_SOURCES) {
      try {
        await logMessage("info", `Fetching from ${source.name}`);

        const response = await fetchWithRetry(source.url);
        const xml = await response.text();
        const feed = await parser.parseString(xml);

        if (feed.items) {
          allItems.push(...feed.items);
          sourcesFetched.push(source.name);
          await logMessage(
            "info",
            `Successfully fetched ${feed.items.length} items from ${source.name}`,
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (err: any) {
        sourcesFailed.push({ name: source.name, error: err.message });
        await logMessage(
          "error",
          `Failed to fetch from ${source.name}`,
          err.message,
        );
      }
    }

    if (allItems.length === 0) {
      await logMessage("warning", "No articles found from any source");
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

    const newArticles = [];
    const createdPosts = [];
    const seenGuids = new Set();

    for (const item of allItems) {
      if (!item.link || !item.title) continue;
      if (item.guid && seenGuids.has(item.guid)) continue;
      if (existingUrls.has(item.link)) continue;

      const text = (
        item.title +
        " " +
        (item.contentSnippet || "")
      ).toLowerCase();

      if (!isArticleRelevant(item.title, item.contentSnippet || "")) continue;

      if (item.guid) seenGuids.add(item.guid);
      newArticles.push(item);
    }

    await logMessage(
      "info",
      `Filtered ${allItems.length} items to ${newArticles.length} relevant articles`,
    );

    for (const article of newArticles.slice(0, 15)) {
      try {
        const slug = generateSlug(article.title!);
        if (existingSlugs.has(slug)) continue;

        const category = categorizeArticle(
          article.title!,
          article.contentSnippet || "",
        );

        const newPostId = await convex.mutation(api.newsPosts.create, {
          adminToken: import.meta.env.CRON_SECRET || process.env.CRON_SECRET,
          title: article.title!,
          slug: slug,
          excerpt:
            article.contentSnippet?.substring(0, 150) + "..." ||
            "No excerpt available.",
          content:
            article.content ||
            article.contentSnippet ||
            "Content to be curated.",
          authorName: "Automated News Bot",
          category: category,
          sourceUrl: article.link,
          sourceName: article.source?.trim() || "News Feed",
          published: true,
        });

        if (newPostId) {
          createdPosts.push({
            _id: newPostId,
            title: article.title!,
            sourceUrl: article.link,
            sourceName: article.source?.trim() || "News Feed",
            category: category,
          });
        }
      } catch (err: any) {
        await logMessage(
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
            subject: `📢 ${createdPosts.length} New News Articles Created`,
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
                    <span style="font-size: 0.8em; color: #666;">${p.sourceName} • ${p.category}</span><br>
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
            `,
          });
        } catch (emailErr: any) {
          await logMessage(
            "error",
            "Failed to send email notification",
            emailErr instanceof Error ? emailErr.message : String(emailErr),
          );
        }
      }
    }

    await logMessage(
      "info",
      `News fetch completed successfully`,
      `Total: ${allItems.length}, New: ${newArticles.length}, Created: ${createdPosts.length}, Sources: ${sourcesFetched.join(", ")}`,
    );

    const result = {
      success: true,
      message: `Processed ${newArticles.length} articles, created ${createdPosts.length} posts.`,
      totalFound: allItems.length,
      newArticles: newArticles.length,
      createdPosts: createdPosts.length,
      sourcesFetched,
      sourcesFailed,
      posts: createdPosts.map((p: any) => p.title),
      duration: Date.now() - startTime,
    };

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error: any) {
    await logMessage("error", "News fetch failed", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 },
    );
  }
};
