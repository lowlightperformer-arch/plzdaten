import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.plz-daten.de',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      serialize(item) {
        // Enforce priorities and change frequencies based on URL patterns
        if (item.url === 'https://www.plz-daten.de/') {
          item.changefreq = 'daily';
          item.priority = 1.0;
        } else if (item.url.includes('/plz/')) {
          item.changefreq = 'daily';
          item.priority = 0.9;
        } else if (item.url.includes('/bundesland/') || item.url.includes('/landkreis/')) {
          item.changefreq = 'weekly';
          item.priority = 0.7;
        }
        return item;
      },
    }),
  ],
});
