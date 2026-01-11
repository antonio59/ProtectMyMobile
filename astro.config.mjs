import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://protectmymobile.xyz',
  output: 'server',
  adapter: netlify(),
  integrations: [
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
