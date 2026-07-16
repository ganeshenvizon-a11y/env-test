import * as cheerio from 'cheerio';
import path from 'node:path';
import { config } from './config.js';

const CONTENT_SELECTOR = '.st-post-details.st-style1';
const HERO_SUBTITLE_SELECTOR = '.page-title-large span.opacity6';
const SHARE_BUTTONS_SELECTOR = '.st-post-meta';
const SPACER_SELECTOR = '[class*="st-height-"]';

function rewriteImagePaths($, root) {
  root.find('img').each((_, el) => {
    const $img = $(el);
    const src = $img.attr('src');
    if (!src) return;
    const filename = path.basename(src.split('?')[0]);
    $img.attr('src', `${config.images.newWebPath}/${filename}`);
  });
}

function stripNonContentNoise($, root) {
  root.find(SHARE_BUTTONS_SELECTOR).remove();
  root.find(SPACER_SELECTOR).remove();
  root.find('h1,h2,h3,h4,h5,h6').each((_, el) => {
    const $heading = $(el);
    if (!$heading.text().trim()) $heading.remove();
  });
}

const WORDS_PER_MINUTE = 200;

function estimateReadingTimeMinutes($, root) {
  const wordCount = root
    .text()
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

function extractExcerpt($, root, maxLength = 160) {
  let excerptText = '';
  root.find('p').each((_, el) => {
    if (excerptText) return;
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text.length > 20) excerptText = text;
  });
  if (!excerptText) return '';
  if (excerptText.length <= maxLength) return excerptText;
  const truncated = excerptText.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

export function parseBlogHtml(html, filename) {
  const $ = cheerio.load(html);

  const rawTitle = $('title').text().trim();
  const title = rawTitle.split('|')[0].trim() || $(CONTENT_SELECTOR).find('h1').first().text().trim();

  if (!title) {
    throw new Error('Could not extract a title from <title> or the first <h1>');
  }

  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';
  const heroSubtitle = $(HERO_SUBTITLE_SELECTOR).first().text().trim();

  const articleRoot = $(CONTENT_SELECTOR).first();
  if (articleRoot.length === 0) {
    throw new Error(`Could not locate content block "${CONTENT_SELECTOR}"`);
  }

  const contentRoot = articleRoot.clone();
  stripNonContentNoise($, contentRoot);
  rewriteImagePaths($, contentRoot);

  const firstH1 = contentRoot.find('h1').first();
  if (firstH1.length && firstH1.text().trim().toLowerCase() === title.toLowerCase()) {
    firstH1.remove();
  }

  const content = contentRoot.html()?.trim() || '';
  if (!content) {
    throw new Error('Extracted content is empty after cleanup');
  }

  const excerpt = extractExcerpt($, contentRoot);
  const readingTime = estimateReadingTimeMinutes($, contentRoot);

  return {
    filename,
    title,
    metaDescription,
    heroSubtitle,
    excerpt,
    content,
    readingTime,
  };
}
