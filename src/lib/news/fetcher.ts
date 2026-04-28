import Parser from "rss-parser";
import type { NewsSource, FeedResult } from "./types";

const parser = new Parser({
  customFields: {
    item: ["media:content", "media:thumbnail", "content:encoded"],
  },
  timeout: 5000,
});

const USER_AGENT =
  "Mozilla/5.0 (compatible; ProtectMyMobile-Bot/1.0; +https://protectmymobile.xyz)";

async function fetchWithRetry(
  url: string,
  maxRetries = 2,
  initialDelay = 500,
  timeoutMs = 4000,
): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
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

export async function fetchFeed(source: NewsSource): Promise<FeedResult> {
  try {
    const response = await fetchWithRetry(source.url, 2, 500, 3500);
    const xml = await response.text();
    const feed = await parser.parseString(xml);
    return { source, items: feed.items || [] };
  } catch (err: any) {
    return { source, items: [], error: err.message };
  }
}
