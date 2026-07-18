import fs from 'node:fs';
import { config } from './config.js';

function authHeader() {
  const token = Buffer.from(`${config.wordpress.username()}:${config.wordpress.appPassword()}`).toString('base64');
  return `Basic ${token}`;
}

async function wpGet(pathSegment) {
  const url = `${config.wordpress.baseUrl}${pathSegment}`;
  const res = await fetch(url, { headers: { Authorization: authHeader() } });
  if (!res.ok) throw new Error(`WP API ${res.status}: ${res.statusText} (${url})`);
  return res.json();
}

async function fetchAllPages(basePath) {
  let page = 1;
  let all = [];
  while (true) {
    const sep = basePath.includes('?') ? '&' : '?';
    const batch = await wpGet(`${basePath}${sep}per_page=100&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    all = all.concat(batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return all;
}

async function main() {
  const posts = await fetchAllPages('/posts?status=publish,future,draft,pending,private&context=edit');
  const categories = await fetchAllPages('/categories?context=edit');
  const tags = await fetchAllPages('/tags?context=edit');

  const slim = posts.map((p) => ({
    id: p.id,
    title: p.title?.raw || p.title?.rendered,
    slug: p.slug,
    status: p.status,
    categories: p.categories,
    tags: p.tags,
  }));

  fs.writeFileSync('wp-posts.json', JSON.stringify(slim, null, 2));
  fs.writeFileSync('wp-categories.json', JSON.stringify(categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })), null, 2));
  fs.writeFileSync('wp-tags.json', JSON.stringify(tags.map(t => ({ id: t.id, name: t.name, slug: t.slug })), null, 2));

  console.log(`Posts: ${slim.length}`);
  console.log(`Categories: ${categories.length}`);
  console.log(`Tags: ${tags.length}`);
}

main().catch((err) => {
  console.error('Fatal error:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
