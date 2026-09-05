/**
 * Normalize PUBLIC_GOOGLE_SITE_VERIFICATION to a bare token.
 *
 * Operators sometimes paste Google's entire <meta> HTML snippet (or an
 * already-nested snippet) instead of the token alone. Peel nested
 * content="..." / content=&quot;...&quot; values and reject leftover markup.
 */
const CONTENT_ATTR =
  /content\s*=\s*(?:"([^"]*)"|'([^']*)'|&quot;((?:(?!&quot;).)*)&quot;)/i;

export function normalizeGoogleSiteVerification(
  raw: string | undefined | null,
): string {
  if (typeof raw !== "string") return "";

  let value = raw.trim();
  if (!value) return "";

  for (let i = 0; i < 5 && value; i++) {
    const match = CONTENT_ATTR.exec(value);
    if (!match) break;
    value = (match[1] ?? match[2] ?? match[3] ?? "").trim();
  }

  value = value.replace(/<\/?meta\b[^>]*>/gi, "").trim();

  if (!value || /[<>]/.test(value)) return "";
  return value;
}
