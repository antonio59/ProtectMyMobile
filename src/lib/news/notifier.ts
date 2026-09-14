import { Resend } from "resend";
import { NOTIFY_FROM } from "../mail";

function logMessage(
  level: "info" | "warning" | "error",
  message: string,
  details?: string,
) {
  console.log(`[NewsFetch][${level.toUpperCase()}]`, message, details || "");
}

// Scraped article fields are attacker-influenceable; escape before HTML email.
function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(value: unknown): string {
  try {
    const url = new URL(String(value ?? ""));
    if (url.protocol !== "http:" && url.protocol !== "https:") return "#";
    return escapeHtml(url.toString());
  } catch {
    return "#";
  }
}

export async function sendNewArticlesEmail(
  createdPosts: any[],
  sourcesFetched: string[],
  sourcesFailed: Array<{ name: string; error: string }>,
  rejectedArticles: Array<{ title: string; score: number; reason: string }>,
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
  if (!resendApiKey || createdPosts.length === 0) return;

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: NOTIFY_FROM,
      to: ["protectmymobile.xyz.overlabor129@passmail.com"],
      subject: `${createdPosts.length} New News Articles Created`,
      html: `
        <h2>New Articles Detected</h2>
        <p>The automated scraper found ${createdPosts.length} new articles from ${sourcesFetched.length} source(s):</p>
        <p><strong>Sources:</strong> ${escapeHtml(sourcesFetched.join(", "))}</p>
        <ul>
          ${createdPosts
            .map(
              (p: any) => `
            <li>
              <strong>${escapeHtml(p.title)}</strong><br>
              <span style="font-size: 0.8em; color: #666;">
                ${escapeHtml(p.sourceName)} • ${escapeHtml(p.category)} • Relevance: ${escapeHtml(p.relevanceScore)}/100
              </span><br>
              <a href="${safeUrl(p.sourceUrl)}">Original Link</a>
            </li>
          `,
            )
            .join("")}
        </ul>
        ${
          sourcesFailed.length > 0
            ? `<p style="color: #dc2626;"><strong>Failed sources:</strong> ${sourcesFailed.map((f) => `${escapeHtml(f.name)} (${escapeHtml(f.error)})`).join(", ")}</p>`
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
                .map((r) => `<li>${escapeHtml(r.title)} (Score: ${escapeHtml(r.score)}) - ${escapeHtml(r.reason)}</li>`)
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

export function triggerBuildHook(): void {
  const buildHookUrl =
    process.env.BUILD_HOOK_URL || import.meta.env.BUILD_HOOK_URL;
  if (!buildHookUrl) return;
  try {
    fetch(buildHookUrl, { method: "POST" })
      .then((res) => logMessage("info", `Build hook triggered`, `Status: ${res.status}`))
      .catch((err) => logMessage("warning", `Build hook request failed`, err.message));
  } catch (err: any) {
    logMessage("warning", `Build hook trigger failed`, err.message);
  }
}
