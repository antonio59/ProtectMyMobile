import type { APIRoute } from "astro";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { requireApiKey, getEnv, getSecret } from "../../../lib/security";
import { NEWS_SOURCES } from "../../../lib/news/sources";
import { fetchFeed } from "../../../lib/news/fetcher";
import { calculateRelevanceScore } from "../../../lib/news/scorer";
import { categorizeArticle } from "../../../lib/news/categorizer";
import { stripHtml, extractExcerpt, scrapeArticleContent } from "../../../lib/news/scraper";
import { generateSlug, isDuplicateTitle, titleSimilarity } from "../../../lib/news/dedup";
import { sendNewArticlesEmail, triggerBuildHook } from "../../../lib/news/notifier";
import { createJudge, type NewsJudge } from "../../../lib/news/judge";
import type { ArticleCategory } from "../../../lib/news/categorizer";
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

interface ScoredArticle {
  item: any;
  relevanceScore: number;
  relevanceReason: string;
  /** Judged category overrides the keyword categorizer when present. */
  category?: ArticleCategory;
  holdForReview?: boolean;
}

// Cap TypeSafe calls per run so a feed flood can't blow the budget; anything
// past the cap falls back to the keyword scorer.
const MAX_JUDGED_ARTICLES = 40;
const MAX_SAME_STORY_CHECKS = 10;
// Title-similarity band where a semantic same-story check is worthwhile.
const BORDERLINE_SIMILARITY = 0.3;

function mostSimilarTitle(title: string, titles: string[]): { title: string; similarity: number } | null {
  let best: { title: string; similarity: number } | null = null;
  for (const t of titles) {
    const s = titleSimilarity(title, t);
    if (!best || s > best.similarity) best = { title: t, similarity: s };
  }
  return best;
}

async function filterAndScoreArticles(
  items: any[],
  existingUrls: Set<string>,
  existingTitles: string[],
  judge: NewsJudge | null,
) {
  const newArticles: ScoredArticle[] = [];
  const rejectedArticles: Array<{ title: string; score: number; reason: string }> = [];
  const seenGuids = new Set<string>();
  // Seed with the existing DB titles, then grow as we accept articles so that
  // same-story rewrites arriving from different feeds in this run dedup against
  // each other — not just against what's already stored.
  const seenTitles = [...existingTitles];
  let judged = 0;
  let sameStoryChecks = 0;

  for (const item of items) {
    if (!item.link || !item.title) continue;
    if (item.guid && seenGuids.has(item.guid)) continue;
    if (existingUrls.has(item.link)) continue;
    if (isDuplicateTitle(item.title, seenTitles)) continue;

    const snippet = stripHtml(item.contentSnippet || item.content || "");
    let score: number;
    let shouldImport: boolean;
    let reason: string;
    let category: ArticleCategory | undefined;
    let holdForReview = false;

    if (judge && judged < MAX_JUDGED_ARTICLES) {
      // Borderline dedup: token-similar but below the auto-dup threshold —
      // ask whether it's the same story before spending a full judgment.
      const near = mostSimilarTitle(item.title, seenTitles);
      if (near && near.similarity >= BORDERLINE_SIMILARITY && sameStoryChecks < MAX_SAME_STORY_CHECKS) {
        sameStoryChecks++;
        try {
          const p = await judge.sameStory(item.title, near.title);
          if (p >= judge.SAME_STORY_THRESHOLD) {
            rejectedArticles.push({
              title: item.title.substring(0, 60) + "...",
              score: 0,
              reason: `Same story as "${near.title.substring(0, 50)}" (p=${p.toFixed(2)})`,
            });
            continue;
          }
        } catch (err: any) {
          logMessage("warning", "sameStory check failed; continuing", err.message);
        }
      }

      judged++;
      try {
        const verdict = await judge.judgeArticle({
          title: item.title,
          excerpt: snippet,
          sourceUrl: item.link,
          sourceName: feedSourceName(item),
        });
        shouldImport = verdict.shouldImport;
        score = verdict.relevanceScore;
        reason = verdict.reason;
        category = verdict.category;
        holdForReview = verdict.holdForReview;
      } catch (err: any) {
        logMessage("warning", "TypeSafe judgment failed; using keyword fallback", err.message);
        const kw = calculateRelevanceScore(item.title, snippet, item.link, feedSourceName(item));
        shouldImport = kw.shouldImport;
        score = kw.score;
        reason = `keywords (fallback): ${kw.reason}`;
      }
    } else {
      const kw = calculateRelevanceScore(item.title, snippet, item.link, feedSourceName(item));
      shouldImport = kw.shouldImport;
      score = kw.score;
      reason = kw.reason;
    }

    if (shouldImport) {
      if (item.guid) seenGuids.add(item.guid);
      seenTitles.push(item.title);
      newArticles.push({ item, relevanceScore: score, relevanceReason: reason, category, holdForReview });
      logMessage("info", `Article passed relevance check (score: ${score}${holdForReview ? ", held for review" : ""})`, `"${item.title.substring(0, 60)}..." - ${reason}`);
    } else {
      rejectedArticles.push({ title: item.title.substring(0, 60) + "...", score, reason });
    }
  }

  newArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return { newArticles, rejectedArticles, judged };
}

/**
 * Store a summary of someone else's reporting, never the whole article.
 *
 * The /news colophon tells readers we do not republish other outlets' work in
 * full. This is where that promise is kept: whatever the feed or the scraper
 * hands us, only the opening of it is stored, and the article page links back
 * to the original. The article template applies the same cap at render time so
 * rows written before this existed are covered too.
 */
const SYNDICATION_WORD_LIMIT = 90;

function toSyndicationSummary(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= SYNDICATION_WORD_LIMIT) return text.trim();
  return words.slice(0, SYNDICATION_WORD_LIMIT).join(" ").replace(/[.,;:\u2013\u2014-]+$/, "") + "\u2026";
}

function feedSourceName(article: any): string | undefined {
  const s = article.source;
  const name = typeof s === "string" ? s : s?._;
  return name?.trim() || undefined;
}

async function createPost(
  article: any,
  relevanceScore: number,
  existingSlugs: Set<string>,
  convex: ConvexHttpClient,
  locals: unknown,
  verdict?: { category?: ArticleCategory; holdForReview?: boolean },
) {
  const slug = generateSlug(article.title!);
  if (existingSlugs.has(slug)) return null;

  const cleanSnippet = stripHtml(article.contentSnippet || article.content || "");
  const category = verdict?.category ?? categorizeArticle(article.title!, cleanSnippet);

  let finalContent = "";
  let featuredImageUrl: string | null = null;

  const rssFullContent = (article as any)["content:encoded"];
  if (rssFullContent && stripHtml(rssFullContent).trim().length > 200) {
    finalContent = toSyndicationSummary(stripHtml(rssFullContent).trim());
    logMessage("info", `Stored summary of RSS content for ${article.title!.substring(0, 40)}`);
  } else {
    const scraped = await scrapeArticleContent(article.link!);
    const fallbackContent = stripHtml(article.content || article.contentSnippet || "").trim();
    if (scraped.content !== "Content to be curated.") {
      finalContent = toSyndicationSummary(scraped.content);
    } else if (fallbackContent.length > 100) {
      finalContent = toSyndicationSummary(fallbackContent);
    } else {
      finalContent = cleanSnippet.length > 50
        ? `${article.title!}\n\n${cleanSnippet}`
        : `${article.title!}\n\n(Source: ${feedSourceName(article) || "News Feed"})`;
    }
    featuredImageUrl = scraped.featuredImageUrl;
  }

  let excerpt = extractExcerpt(finalContent, 150);
  if (excerpt === "No excerpt available." || excerpt.length < 30) {
    excerpt = cleanSnippet.length > 30
      ? extractExcerpt(cleanSnippet, 150)
      : `${article.title!} - read the full article for more details.`;
  }

  const newPostId = await convex.mutation(api.newsPosts.create, {
    adminToken: getSecret(locals, 'CRON_SECRET'),
    title: article.title!,
    slug,
    excerpt,
    content: finalContent,
    authorName: "Automated News Bot",
    category,
    sourceUrl: article.link,
    sourceName: feedSourceName(article) || "News Feed",
    featuredImageUrl: featuredImageUrl || undefined,
    published: !verdict?.holdForReview,
  });

  return newPostId
    ? {
        _id: newPostId,
        title: article.title!,
        sourceUrl: article.link,
        sourceName: feedSourceName(article) || "News Feed",
        category,
        relevanceScore,
        heldForReview: !!verdict?.holdForReview,
      }
    : null;
}

export const GET: APIRoute = async ({ request, locals }) => {
  const startTime = Date.now();
  const unauthorized = await requireApiKey(request, locals);
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
      adminToken: getSecret(locals, 'CRON_SECRET'),
    });
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

    const judge = createJudge(getSecret(locals, "TYPESAFE_API_KEY"));
    logMessage("info", judge ? "Using TypeSafe judgments for relevance/categories" : "TYPESAFE_API_KEY not set; using keyword heuristics");

    const { newArticles, rejectedArticles, judged } = await filterAndScoreArticles(allItems, existingUrls, existingTitles, judge);
    logMessage("info", `Filtered ${allItems.length} items to ${newArticles.length} relevant articles (${judged} TypeSafe-judged)`);

    const createdPosts = [];
    for (const { item, relevanceScore, category, holdForReview } of newArticles.slice(0, 5)) {
      try {
        const slug = generateSlug(item.title!);
        const post = await createPost(item, relevanceScore, existingSlugs, convex, locals, { category, holdForReview });
        if (post) {
          existingSlugs.add(slug);
          createdPosts.push(post);
        }
      } catch (err: any) {
        logMessage("error", `Failed to create post: ${item.title}`, err.message);
      }
    }

    if (createdPosts.length > 0) {
      await sendNewArticlesEmail(getEnv(locals), createdPosts, sourcesFetched, sourcesFailed, rejectedArticles);
      // Drafts held for review don't change the public site — no rebuild needed.
      if (createdPosts.some((p) => !p.heldForReview)) {
        triggerBuildHook(getEnv(locals));
      }
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
        judgedByTypeSafe: judged,
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
