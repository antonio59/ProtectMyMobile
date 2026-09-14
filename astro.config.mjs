import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://protectmymobile.org',
  output: 'server',
  // No Astro.session usage — avoids requiring a KV namespace binding.
  session: false,
  adapter: cloudflare({
    // No astro:assets usage — avoids the paid Cloudflare Images binding.
    imageService: 'passthrough',
  }),
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/admin/'),
      customPages: [
        'https://protectmymobile.org/',
        'https://protectmymobile.org/emergency',
        'https://protectmymobile.org/prevention',
        'https://protectmymobile.org/banks',
        'https://protectmymobile.org/statistics',
        'https://protectmymobile.org/london-visitor-safety',
        'https://protectmymobile.org/the-problem',
        'https://protectmymobile.org/press',
      ]
    })
  ],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
});
