import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { requireApiKey } from "../../../lib/security";
import { NEWS_SOURCES } from "../../../lib/news/sources";
import { fetchFeed } from "../../../lib/news/fetcher";
import { calculateRelevanceScore } from "../../../lib/news/scorer";
import { categorizeArticle } from "../../../lib/news/categorizer";
import { stripHtml, extractExcerpt, scrapeArticleContent } from "../../../lib/news/scraper";
import { generateSlug, isDuplicateTitle } from "../../../lib/news/dedup";
import { sendNewArticlesEmail, triggerBuildHook } from "../../../lib/news/notifier";
import type { FeedResult } from "../../../lib/news/types";

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

function logMessage(
  level: "info" | "warning" | "error",
  message: string,
  details?: string,
) {
  console.log(`[NewsFetch][${level.toUpperCase()}]`, message, details || "");
}

function processFeeds(feedResults: FeedResult[]) {
  const allItems: any[] = [];
  const sourcesFetched: string[] = [];
  const sourcesFailed: Array<{ name: string; error: string }> = [];

  for (const result of feedResults) {
    if (result.items.length > 0) {
      allItems.push(...result.items);
      sourcesFetched.push(result.source.name);
    } else if (result.error) {
      sourcesFailed.push({ name: result.source.name, error: result.error });
    }
  }

  return { allItems, sourcesFetched, sourcesFailed };
}

function filterAndScoreArticles(
  items: any[],
  existingUrls: Set<string>,
  existingTitles: string[],
) {
  const newArticles: Array<{ item: any; relevanceScore: number; relevanceReason: string }> = [];
  const rejectedArticles: Array<{ title: string; score: number; reason: string }> = [];
  const seenGuids = new Set<string>();

  for (const item of items) {
    if (!item.link || !item.title) continue;
    if (item.guid && seenGuids.has(item.guid)) continue;
    if (existingUrls.has(item.link)) continue;
    if (isDuplicateTitle(item.title, existingTitles)) continue;

    const snippet = stripHtml(item.contentSnippet || item.content || "");
    const { score, shouldImport, reason } = calculateRelevanceScore(item.title, snippet);

    if (shouldImport) {
      if (item.guid) seenGuids.add(item.guid);
      newArticles.push({ item, relevanceScore: score, relevanceReason: reason });
      logMessage("info", `Article passed relevance check (score: ${score})`, `"${item.title.substring(0, 60)}..." - ${reason}`);
    } else {
      rejectedArticles.push({ title: item.title.substring(0, 60) + "...", score, reason });
    }
  }

  newArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return { newArticles, rejectedArticles };
}

async function createPost(
  article: any,
  relevanceScore: number,
  existingSlugs: Set<string>,
  convex: ConvexHttpClient,
) {
  const slug = generateSlug(article.title!);
  if (existingSlugs.has(slug)) return null;

  const cleanSnippet = stripHtml(article.contentSnippet || article.content || "");
  const category = categorizeArticle(article.title!, cleanSnippet);

  let finalContent = "";
  let featuredImageUrl: string | null = null;

  const rssFullContent = (article as any)["content:encoded"];
  if (rssFullContent && stripHtml(rssFullContent).trim().length > 200) {
    finalContent = stripHtml(rssFullContent).trim();
    if (finalContent.length > 3000) {
      finalContent = finalContent.substring(0, 3000).trim() + "...";
    }
    logMessage("info", `Using RSS full content for ${article.title!.substring(0, 40)}`);
  } else {
    const scraped = await scrapeArticleContent(article.link!);
    const fallbackContent = stripHtml(article.content || article.contentSnippet || "").trim();
    if (scraped.content !== "Content to be curated.") {
      finalContent = scraped.content;
    } else if (fallbackContent.length > 100) {
      finalContent = fallbackContent;
    } else {
      finalContent = cleanSnippet.length > 50
        ? `${article.title!}\n\n${cleanSnippet}`
        : `${article.title!}\n\n(Source: ${article.source?.trim() || "News Feed"})`;
    }
    featuredImageUrl = scraped.featuredImageUrl;
  }

  let excerpt = extractExcerpt(finalContent, 150);
  if (excerpt === "No excerpt available." || excerpt.length < 30) {
    excerpt = cleanSnippet.length > 30
      ? extractExcerpt(cleanSnippet, 150)
      : `${article.title!} — read the full article for more details.`;
  }

  const newPostId = await convex.mutation(api.newsPosts.create, {
    adminToken: import.meta.env.CRON_SECRET || process.env.CRON_SECRET,
    title: article.title!,
    slug,
    excerpt,
    content: finalContent,
    authorName: "Automated News Bot",
    category,
    sourceUrl: article.link,
    sourceName: article.source?.trim() || "News Feed",
    featuredImageUrl: featuredImageUrl || undefined,
    published: true,
  });

  return newPostId
    ? {
        _id: newPostId,
        title: article.title!,
        sourceUrl: article.link,
        sourceName: article.source?.trim() || "News Feed",
        category,
        relevanceScore,
      }
    : null;
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
    const existingPosts = await convex.query(api.newsPosts.list, { publishedOnly: false });
    const existingUrls = new Set(existingPosts?.map((p: any) => p.sourceUrl) || []);
    const existingSlugs = new Set(existingPosts?.map((p: any) => p.slug) || []);
    const existingTitles = existingPosts?.map((p: any) => p.title) || [];

    const feedResults = await Promise.all(NEWS_SOURCES.map(fetchFeed));
    const { allItems, sourcesFetched, sourcesFailed } = processFeeds(feedResults);

    if (allItems.length === 0) {
      logMessage("warning", "No articles found from any source");
      return new Response(
        JSON.stringify({ success: true, message: "No articles found", sourcesFetched, sourcesFailed, duration: Date.now() - startTime }),
        { status: 200 },
      );
    }

    const { newArticles, rejectedArticles } = filterAndScoreArticles(allItems, existingUrls, existingTitles);
    logMessage("info", `Filtered ${allItems.length} items to ${newArticles.length} relevant articles (score >= 45)`);

    const createdPosts = [];
    for (const { item, relevanceScore } of newArticles.slice(0, 5)) {
      try {
        const post = await createPost(item, relevanceScore, existingSlugs, convex);
        if (post) createdPosts.push(post);
      } catch (err: any) {
        logMessage("error", `Failed to create post: ${item.title}`, err.message);
      }
    }

    if (createdPosts.length > 0) {
      await sendNewArticlesEmail(createdPosts, sourcesFetched, sourcesFailed, rejectedArticles);
      triggerBuildHook();
    }

    logMessage(
      "info",
      `News fetch completed successfully`,
      `Total: ${allItems.length}, New: ${newArticles.length}, Created: ${createdPosts.length}, Rejected: ${rejectedArticles.length}, Sources: ${sourcesFetched.join(", ")}`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${newArticles.length} articles, created ${createdPosts.length} posts.`,
        totalFound: allItems.length,
        newArticles: newArticles.length,
        rejectedArticles: rejectedArticles.length,
        createdPosts: createdPosts.length,
        sourcesFetched,
        sourcesFailed,
        posts: createdPosts.map((p) => ({ title: p.title, category: p.category, relevanceScore: p.relevanceScore })),
        topRejections: rejectedArticles.slice(0, 5),
        duration: Date.now() - startTime,
      }),
      { status: 200 },
    );
  } catch (error: any) {
    logMessage("error", "News fetch failed", error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};
