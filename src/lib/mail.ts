/**
 * Mail identities.
 *
 * Outbound mail uses .org addresses — protectmymobile.org is a verified
 * domain in Resend (DKIM/SPF records live in Cloudflare DNS on the .org zone).
 */
export const FOI_FROM_EMAIL = "foi@protectmymobile.org";
export const FOI_FROM_HEADER = `ProtectMyMobile FOI <${FOI_FROM_EMAIL}>`;
export const FOI_PUBLIC_EMAIL = "foi@protectmymobile.org";
export const PRESS_EMAIL = "press@protectmymobile.org";
export const FOI_BOT_UA = `ProtectMyMobile Research Bot (${FOI_FROM_EMAIL}; ${FOI_PUBLIC_EMAIL})`;

// Internal admin notifications.
export const NOTIFY_FROM = "ProtectMyMobile <notifications@protectmymobile.org>";

// Scraped/remote-sourced values (feed fields, WDTK titles, directory data)
// are attacker-influenceable — escape before interpolating into HTML email.
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function safeUrl(value: unknown): string {
  try {
    const url = new URL(String(value ?? ""));
    if (url.protocol !== "http:" && url.protocol !== "https:") return "#";
    return escapeHtml(url.toString());
  } catch {
    return "#";
  }
}
