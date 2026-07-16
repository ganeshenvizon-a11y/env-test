import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { config } from './config.js';
import { parseBlogHtml } from './parser.js';

function decodeEntities(str) {
  return str
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
}

function listHtmlFiles() {
  return fs
    .readdirSync(config.paths.htmlBlogsDir)
    .filter((f) => f.toLowerCase().endsWith('.html'))
    .sort();
}

const posts = JSON.parse(fs.readFileSync('wp-posts.json', 'utf-8'));

function findWpPost(title) {
  const normalized = decodeEntities(title).trim().toLowerCase();
  return posts.find((p) => decodeEntities(p.title).trim().toLowerCase() === normalized) || null;
}

const files = listHtmlFiles();
const out = [];

for (const filename of files) {
  const html = fs.readFileSync(path.join(config.paths.htmlBlogsDir, filename), 'utf-8');
  let extracted;
  try {
    extracted = parseBlogHtml(html, filename);
  } catch (err) {
    out.push({ filename, error: String(err) });
    continue;
  }
  const $ = cheerio.load(extracted.content);
  const bodyText = $.root().text().replace(/\s+/g, ' ').trim();
  const wpPost = findWpPost(extracted.title);

  out.push({
    filename,
    title: extracted.title,
    metaDescription: extracted.metaDescription,
    heroSubtitle: extracted.heroSubtitle,
    excerpt: extracted.excerpt,
    bodyPreview: bodyText.slice(0, 900),
    wpId: wpPost ? wpPost.id : null,
    wpTitle: wpPost ? wpPost.title : null,
    currentCategories: wpPost ? wpPost.categories : null,
    currentTags: wpPost ? wpPost.tags : null,
  });
}

fs.writeFileSync('categorization-input.json', JSON.stringify(out, null, 2));
console.log(`Extracted ${out.length} files.`);
console.log(`Matched to WP posts: ${out.filter(o => o.wpId).length}`);
console.log(`Unmatched: ${out.filter(o => !o.wpId).map(o => o.filename).join(', ')}`);
