/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONVEX_URL?: string;
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
  readonly CONVEX_URL?: string;
  readonly CRON_SECRET?: string;
  readonly ADMIN_PASSWORD?: string;
  readonly RESEND_API_KEY?: string;

}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
