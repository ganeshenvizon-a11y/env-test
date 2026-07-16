import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { config } from './config.js';

// Read-only check: does each file's <head><title> match its own article <h1>?
// Catches copy-pasted <title> tags left over from cloning a template page.

function normalize(text) {
  return text.replace(/\s+/g, ' ').replace(/\s+\?/g, '?').trim().toLowerCase();
}

function listHtmlFiles() {
  return fs
    .readdirSync(config.paths.htmlBlogsDir)
    .filter((f) => f.toLowerCase().endsWith('.html'))
    .sort();
}

function checkFile(filename) {
  const html = fs.readFileSync(path.join(config.paths.htmlBlogsDir, filename), 'utf-8');
  const $ = cheerio.load(html);

  const rawTitle = $('title').text().trim();
  const title = rawTitle.split('|')[0].trim();
  const h1 = $('.st-post-details.st-style1').find('h1').first().text().trim();

  return { filename, title, h1, matches: normalize(title) === normalize(h1) };
}

const results = listHtmlFiles().map(checkFile);
const mismatches = results.filter((r) => !r.matches);

console.log(`Checked ${results.length} files. ${mismatches.length} title/H1 mismatch(es) found.\n`);

mismatches.forEach((r) => {
  console.log(`FILE:  ${r.filename}`);
  console.log(`  <title>: ${r.title || '(empty)'}`);
  console.log(`  <h1>:    ${r.h1 || '(empty)'}`);
  console.log('');
});
