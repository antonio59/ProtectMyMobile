import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import sentry from '@sentry/astro';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://protectmymobile.xyz',
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      configPath: 'wrangler.toml',
    },
  }),
  integrations: [
    sentry({
      dsn: process.env.SENTRY_DSN,
      sourceMapsUploadOptions: {
        enabled: false,
      },
    }),
    react(),
    sitemap({
      filter: (page) => !page.includes('/admin/'),
      customPages: [
        'https://protectmymobile.xyz/',
        'https://protectmymobile.xyz/emergency',
        'https://protectmymobile.xyz/prevention',
        'https://protectmymobile.xyz/banks',
        'https://protectmymobile.xyz/statistics',
      ]
    })
  ],

  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
});
