import fs from 'node:fs';
import { config } from './config.js';
import { MAPPING } from './category-tag-mapping.js';

function authHeader() {
  const token = Buffer.from(`${config.wordpress.username()}:${config.wordpress.appPassword()}`).toString('base64');
  return `Basic ${token}`;
}

async function wpRequest(pathSegment, options = {}) {
  const url = `${config.wordpress.baseUrl}${pathSegment}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: authHeader(), ...options.headers },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`WP API ${res.status}: ${(body && body.message) || res.statusText} (${url})`);
  return body;
}

async function fetchAllPages(basePath) {
  let page = 1;
  let all = [];
  while (true) {
    const sep = basePath.includes('?') ? '&' : '?';
    const batch = await wpRequest(`${basePath}${sep}per_page=100&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    all = all.concat(batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return all;
}

function norm(name) {
  return name.trim().toLowerCase();
}

// Resolves a taxonomy term name to an id, creating it (via POST) only if no
// case-insensitive match exists. Mutates the passed-in cache map in place.
// In dry-run mode, no POST is ever made: unknown terms are reported as
// "would create" with a placeholder id so post updates can still be dry-run.
async function resolveTerm(taxonomyPath, name, cache, created, reused, dryRun) {
  const key = norm(name);
  if (cache.has(key)) {
    reused.add(name);
    return cache.get(key);
  }
  if (dryRun) {
    created.add(name);
    return null;
  }
  const term = await wpRequest(taxonomyPath, { method: 'POST', body: JSON.stringify({ name }) });
  cache.set(key, term.id);
  created.add(name);
  return term.id;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('Fetching current categories, tags, and posts...');
  const [categories, tags, posts] = await Promise.all([
    fetchAllPages('/categories?context=edit'),
    fetchAllPages('/tags?context=edit'),
    fetchAllPages('/posts?status=publish,future,draft,pending,private&context=edit'),
  ]);

  const catCache = new Map(categories.map((c) => [norm(c.name), c.id]));
  const tagCache = new Map(tags.map((t) => [norm(t.name), t.id]));
  const postsById = new Map(posts.map((p) => [p.id, p]));

  const categoriesCreated = new Set();
  const categoriesReused = new Set();
  const tagsCreated = new Set();
  const tagsReused = new Set();
  const results = [];

  for (const [wpIdStr, entry] of Object.entries(MAPPING)) {
    const wpId = Number(wpIdStr);
    const post = postsById.get(wpId);
    if (!post) {
      results.push({ wpId, status: 'error', details: 'Post not found in WordPress' });
      console.error(`ERROR post ${wpId} not found`);
      continue;
    }

    const categoryId = await resolveTerm('/categories', entry.category, catCache, categoriesCreated, categoriesReused, dryRun);
    const tagIds = [];
    for (const tagName of entry.tags) {
      tagIds.push(await resolveTerm('/tags', tagName, tagCache, tagsCreated, tagsReused, dryRun));
    }

    if (dryRun) {
      console.log(`DRY   #${wpId} "${post.title.rendered}" -> category="${entry.category}" tags=[${entry.tags.join(', ')}]`);
      results.push({ wpId, title: post.title.rendered, status: 'dry-run', category: entry.category, tags: entry.tags });
      continue;
    }

    await wpRequest(`/posts/${wpId}`, {
      method: 'POST',
      body: JSON.stringify({ categories: [categoryId], tags: tagIds }),
    });
    console.log(`OK    #${wpId} "${post.title.rendered}" -> category="${entry.category}" tags=[${entry.tags.join(', ')}]`);
    results.push({ wpId, title: post.title.rendered, status: 'updated', category: entry.category, tags: entry.tags });
  }

  const uncategorized = results.filter((r) => r.status === 'error');

  console.log('\n=== Taxonomy Update Report =============================');
  console.log(`Total posts processed:      ${results.length}`);
  console.log(`Successful updates:         ${results.filter((r) => r.status === 'updated').length}`);
  console.log(`Dry-run (no write):         ${results.filter((r) => r.status === 'dry-run').length}`);
  console.log(`Categories created:         ${categoriesCreated.size} ${[...categoriesCreated].join(', ')}`);
  console.log(`Categories reused:          ${categoriesReused.size}`);
  console.log(`Tags created:                ${tagsCreated.size}`);
  console.log(`Tags reused:                 ${tagsReused.size}`);
  console.log(`Posts requiring manual review: ${uncategorized.length}${uncategorized.length ? ' -> ' + uncategorized.map(r=>r.wpId).join(', ') : ''}`);
  console.log('===========================================================\n');

  fs.writeFileSync('taxonomy-update-report.json', JSON.stringify({ results, categoriesCreated: [...categoriesCreated], categoriesReused: [...categoriesReused], tagsCreated: [...tagsCreated], tagsReused: [...tagsReused] }, null, 2));
}

main().catch((err) => {
  console.error('Fatal error:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
