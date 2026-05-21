const fs = require('fs');
const code = \`import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function loadCsvData() {
  const csvPath = path.join(process.cwd(), 'src', 'data', 'dataset.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const cleanContent = fileContent.replace(/^\\uFEFF/, '');
  
  return parse(cleanContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ',',
    trim: true
  });
}

export function getAllPlzPages() {
  const records = loadCsvData();
  return records
    .map(row => {
      const rawPlz = row["Postal Code (PLZ)"] || "";
      const postalCode = rawPlz.toString().padStart(5, '0');
      const placeName = row["Place Name"] || "";
      const landkreis = row["Landkreis (District)"] || "";
      const bundesland = row["Bundesland (State)"] || "";
      const latitude = row["Latitude"] || "0";
      const longitude = row["Longitude"] || "0";
      const stateCode = (row["State Code"] || "").toLowerCase().trim();
      
      const slug = slugify(postalCode + "-" + placeName);

      return {
        postalCode,
        placeName,
        landkreis,
        bundesland,
        latitude,
        longitude,
        stateCode,
        slug
      };
    })
    .filter(p => p.slug && p.slug !== "" && p.postalCode !== "00000");
}

export function getAllLandkreisPages() {
  const pages = getAllPlzPages();
  const uniqueDistricts = {};
  
  pages.forEach(page => {
    const districtSlug = slugify(page.landkreis);
    if (page.landkreis && page.landkreis.trim() !== "" && districtSlug) {
      if (!uniqueDistricts[districtSlug]) {
        uniqueDistricts[districtSlug] = {
          landkreis: page.landkreis.trim(),
          bundesland: page.bundesland,
          stateCode: page.stateCode,
          slug: districtSlug
        };
      }
    }
  });
  
  return Object.values(uniqueDistricts);
}

export function getAllBundeslandPages() {
  const pages = getAllPlzPages();
  const uniqueStates = {};
  
  pages.forEach(page => {
    const stateSlug = (page.stateCode || '').toLowerCase().trim();
    if (page.bundesland && page.bundesland.trim() !== "" && stateSlug) {
      if (!uniqueStates[stateSlug]) {
        uniqueStates[stateSlug] = {
          bundesland: page.bundesland.trim(),
          stateCode: stateSlug
        };
      }
    }
  });
  
  return Object.values(uniqueStates);
\`;
fs.writeFileSync('src/utils/geoData.js', code);
