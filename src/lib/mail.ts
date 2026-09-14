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
