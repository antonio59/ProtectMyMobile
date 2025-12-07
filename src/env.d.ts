/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONVEX_URL?: string;
  readonly CONVEX_URL?: string;
  readonly CRON_SECRET?: string;
  readonly ADMIN_PASSWORD?: string;
  readonly RESEND_API_KEY?: string;
  readonly REDDIT_CLIENT_ID?: string;
  readonly REDDIT_CLIENT_SECRET?: string;
  readonly REDDIT_USERNAME?: string;
  readonly REDDIT_PASSWORD?: string;
  readonly REDDIT_SUBREDDIT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
