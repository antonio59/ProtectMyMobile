/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONVEX_URL?: string;
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
  readonly CONVEX_URL?: string;
  // Secrets (CRON_SECRET, ADMIN_PASSWORD, ADMIN_JWT_SECRET, RESEND_API_KEY,
  // BUILD_HOOK_URL) are deliberately NOT declared: import.meta.env values are
  // inlined at build time. Read them via getSecret(locals, name) instead.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
