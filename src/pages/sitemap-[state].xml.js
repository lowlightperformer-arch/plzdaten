import { getAllPlzPages, getAllBundeslandPages, slugify } from '../utils/geoData.js';

export async function getStaticPaths() {
  const allStates = getAllBundeslandPages();
  return allStates.map(state => ({
    params: { state: state.stateCode.toLowerCase().trim() },
    props: { stateName: state.bundesland }
  }));
}

export async function GET(context) {
  const { params, props } = context;
  const { state } = params;
  const { stateName } = props;
  const allPlz = getAllPlzPages();
  const domain = context.site ? context.site.toString().replace(/\/$/, '') : 'http://localhost:4322';

  // 1. Filter all records for this specific Bundesland
  const stateRecords = allPlz.filter(
    p => p.stateCode.toLowerCase().trim() === state
  );

  // 2. Extract unique Landkreise to build unique district URLs
  const uniqueDistricts = new Set();
  stateRecords.forEach(p => {
    if (p.landkreis) uniqueDistricts.add(slugify(p.landkreis));
  });

  // 3. Build the XML structure
  const urls = [];

  // Add the main Bundesland page URL
  urls.push(`${domain}/bundesland/${state}`);

  // Add all unique Landkreis URLs for this state
  uniqueDistricts.forEach(districtSlug => {
    urls.push(`${domain}/landkreis/${districtSlug}`);
  });

  // Add all individual PLZ page URLs for this state
  stateRecords.forEach(p => {
    urls.push(`${domain}/plz/${p.slug}`);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
    <url>
      <loc>${url}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('')}
</urlset>`.trim();

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
