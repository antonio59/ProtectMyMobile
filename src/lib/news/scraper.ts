import { parse } from "node-html-parser";

const HTML_ENTITIES: Record<string, string> = {
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

export function stripHtml(html: string): string {
  if (!html) return "";
  let text = html.replace(/<[^>]*>/g, " ");
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    text = text.replace(new RegExp(entity, "g"), char);
  }
  text = text.replace(/&#(\d+);/g, (_match, dec) => String.fromCharCode(Number(dec)));
  text = text.replace(/&#x([0-9a-f]+);/gi, (_match, hex) => String.fromCharCode(parseInt(hex, 16)));
  return text.replace(/\s+/g, " ").trim();
}

export function extractExcerpt(content: string | undefined, maxLength = 150): string {
  if (!content) return "No excerpt available.";
  const cleanText = stripHtml(content);
  if (cleanText.length <= maxLength) return cleanText;
  const truncated = cleanText.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastPeriod > maxLength * 0.7) return truncated.substring(0, lastPeriod + 1);
  if (lastSpace > maxLength * 0.8) return truncated.substring(0, lastSpace) + "...";
  return truncated + "...";
}

function extractFeaturedImage(html: string, baseUrl: string): string | null {
  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  const twitterImage = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  const imageUrl = ogImage?.[1] || twitterImage?.[1];
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  try { return new URL(imageUrl, baseUrl).href; } catch { return null; }
}

function looksLikeBotBlock(html: string): boolean {
  return html.includes("Access Denied") || html.includes("403 Forbidden");
}

async function tryDirectScrape(url: string): Promise<{ content: string; html: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ProtectMyMobile-Bot/1.0; +https://protectmymobile.xyz)",
        Accept: "text/html",
      },
    });
    clearTimeout(timeoutId);
    const html = await response.text();
    if (looksLikeBotBlock(html) || html.length <= 5000) return null;

    const root = parse(html);
    ["script", "style", "nav", "header", "footer", "aside", "noscript"].forEach((tag) => {
      root.querySelectorAll(tag).forEach((el) => el.remove());
    });
    root.childNodes.forEach((node) => { if (node.nodeType === 8) node.remove(); });

    let contentNode = root.querySelector("article");
    if (!contentNode) {
      const selectors = [
        "[class*='article-body']", "[class*='article__body']",
        "[class*='content-body']", "[class*='story-body']",
        "[class*='main-content']", "[class*='post-content']", "main",
      ];
      for (const selector of selectors) {
        contentNode = root.querySelector(selector);
        if (contentNode) break;
      }
    }
    if (!contentNode) contentNode = root.querySelector("body") || root;

    const paragraphs = contentNode
      .querySelectorAll("p")
      .map((p) => p.text.trim())
      .filter((text) => text.length > 30);

    let content = paragraphs.length > 0
      ? paragraphs.join("\n\n").trim()
      : contentNode.text.trim();

    if (content.length > 3000) content = content.substring(0, 3000).trim() + "...";
    if (content.length > 200) return { content, html };
    return null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

async function tryJinaAiScrape(url: string): Promise<string | null> {
  const cleanUrl = url.replace(/^https?:\/\//, "");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(`https://r.jina.ai/http://${cleanUrl}`, {
      signal: controller.signal,
      headers: { "User-Agent": "ProtectMyMobile-Bot/1.0" },
    });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const text = await response.text();
    if (looksLikeBotBlock(text) || text.length <= 200) return null;
    let content = text.trim();
    if (content.length > 3000) content = content.substring(0, 3000).trim() + "...";
    return content;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

export async function scrapeArticleContent(
  url: string,
): Promise<{ content: string; featuredImageUrl: string | null }> {
  let featuredImageUrl: string | null = null;

  const direct = await tryDirectScrape(url);
  if (direct) {
    featuredImageUrl = extractFeaturedImage(direct.html, url);
    return { content: direct.content, featuredImageUrl };
  }

  const jinaContent = await tryJinaAiScrape(url);
  if (jinaContent) {
    return { content: jinaContent, featuredImageUrl };
  }

  return { content: "Content to be curated.", featuredImageUrl };
}
