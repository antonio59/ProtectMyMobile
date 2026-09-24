/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONVEX_URL?: string;
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
  readonly PUBLIC_PLAUSIBLE_DOMAIN?: string;
  readonly CONVEX_URL?: string;
  // Secrets (CRON_SECRET, ADMIN_PASSWORD, ADMIN_JWT_SECRET, RESEND_API_KEY,
  // BUILD_HOOK_URL) are deliberately NOT declared: import.meta.env values are
  // inlined at build time. Read them via getSecret(locals, name) instead.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// worker-configuration.d.ts is excluded from tsconfig (its globals change
// Body.json() to `unknown` codebase-wide), so declare the one binding module
// we use here. Runtime value comes from workerd/miniflare.
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}
