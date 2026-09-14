/** Canonical public origin. Override with PUBLIC_SITE_URL if needed. */
export const SITE_URL = (
  import.meta.env.PUBLIC_SITE_URL || "https://protectmymobile.org"
).replace(/\/$/, "");

export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");
