import { Resend } from "resend";

function logMessage(
  level: "info" | "warning" | "error",
  message: string,
  details?: string,
) {
  console.log(`[NewsFetch][${level.toUpperCase()}]`, message, details || "");
}

export async function sendNewArticlesEmail(
  createdPosts: any[],
  sourcesFetched: string[],
  sourcesFailed: Array<{ name: string; error: string }>,
  rejectedArticles: Array<{ title: string; score: number; reason: string }>,
): Promise<void> {
  const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!resendApiKey || createdPosts.length === 0) return;

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
            ? `<p style="color: #dc2626;"><strong>Failed sources:</strong> ${sourcesFailed.map((f) => `${f.name} (${f.error})`).join(", ")}</p>`
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
                .map((r) => `<li>${r.title} (Score: ${r.score}) - ${r.reason}</li>`)
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
    import.meta.env.NETLIFY_BUILD_HOOK_URL || process.env.NETLIFY_BUILD_HOOK_URL;
  if (!buildHookUrl) return;
  try {
    fetch(buildHookUrl, { method: "POST" })
      .then((res) => logMessage("info", `Build hook triggered`, `Status: ${res.status}`))
      .catch((err) => logMessage("warning", `Build hook request failed`, err.message));
  } catch (err: any) {
    logMessage("warning", `Build hook trigger failed`, err.message);
  }
}
