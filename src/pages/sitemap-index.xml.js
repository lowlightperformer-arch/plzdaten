import { getAllBundeslandPages } from '../utils/geoData.js';

export async function GET(context) {
  const allStates = getAllBundeslandPages();
  const domain = 'https://plz-daten.de';

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allStates.map(state => `
    <sitemap>
      <loc>${domain}/sitemap-${state.stateCode.toLowerCase().trim()}.xml</loc>
    </sitemap>
  `).join('')}
</sitemapindex>`.trim();

  return new Response(sitemapIndex, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
