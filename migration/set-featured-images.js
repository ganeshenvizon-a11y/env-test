import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { parseBlogHtml } from './parser.js';
import { getPost, findExistingMedia, uploadMedia, setFeaturedMedia } from './wordpress.js';

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

// Scope this run to exactly the posts our migration tooling created — parsed
// from success.log rather than "every post in WordPress" — so it can never
// touch an unrelated pre-existing post.
function parseSuccessLogCreated() {
  const text = fs.readFileSync(config.paths.successLog, 'utf-8');
  const lines = text.split('\n');
  const created = new Map(); // filename -> postId
  let pendingStatus = null;
  let pendingFilename = null;

  // Anchored on the literal ".html title=" boundary (not the closing quote)
  // because some titles contain an embedded newline from the source HTML,
  // which splits a single log entry across multiple physical lines. Pending
  // state is only cleared by a new header line or a successful id match, so
  // those in-between continuation lines can't silently drop it.
  for (const line of lines) {
    const headerMatch = line.match(/^\[.*?\] status=(\w+) file=(.+?\.html) title=/);
    if (headerMatch) {
      pendingStatus = headerMatch[1];
      pendingFilename = headerMatch[2];
      continue;
    }

    const idMatch = line.match(/^\s*Created draft post id=(\d+)/);
    if (idMatch && pendingStatus === 'created' && pendingFilename) {
      created.set(pendingFilename, Number(idMatch[1]));
      pendingStatus = null;
      pendingFilename = null;
    }
  }
  return created;
}

// Re-parses the same source HTML through the same parser that generated the
// content now stored in WordPress, so "first image" here is guaranteed to
// match the first image actually in the post body.
function findFirstImageFilename(filename) {
  const html = fs.readFileSync(path.join(config.paths.htmlBlogsDir, filename), 'utf-8');
  const { content } = parseBlogHtml(html, filename);
  const match = content.match(/<img[^>]*src="([^"]+)"/);
  return match ? path.basename(match[1]) : null;
}

const mediaCache = new Map(); // filename -> mediaId, scoped to this run

async function resolveMediaId(imageFilename) {
  if (mediaCache.has(imageFilename)) return { id: mediaCache.get(imageFilename), reused: true };

  const existing = await findExistingMedia(imageFilename);
  if (existing) {
    mediaCache.set(imageFilename, existing.id);
    return { id: existing.id, reused: true };
  }

  const filePath = path.join(config.paths.blogImagesDir, imageFilename);
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(imageFilename).toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
  const uploaded = await uploadMedia(buffer, imageFilename, mimeType);
  mediaCache.set(imageFilename, uploaded.id);
  return { id: uploaded.id, reused: false };
}

async function processFile(filename, postId, summary) {
  const post = await getPost(postId);
  if (post.featured_media && post.featured_media !== 0) {
    console.log(`SKIP  ${filename} (post ${postId}) — already has a featured image`);
    summary.alreadyHasImage += 1;
    return;
  }

  const imageFilename = findFirstImageFilename(filename);
  if (!imageFilename) {
    console.log(`WARN  ${filename} (post ${postId}) — no <img> found in article content`);
    summary.noImageFound.push({ filename, postId, reason: 'no <img> tag in migrated content' });
    return;
  }

  const filePath = path.join(config.paths.blogImagesDir, imageFilename);
  if (!fs.existsSync(filePath)) {
    console.log(`WARN  ${filename} (post ${postId}) — local image file missing: ${imageFilename}`);
    summary.noImageFound.push({ filename, postId, reason: `local file missing: ${imageFilename}` });
    return;
  }

  const media = await resolveMediaId(imageFilename);
  await setFeaturedMedia(postId, media.id);
  console.log(
    `OK    ${filename} (post ${postId}) — featured image set (media id=${media.id}, file=${imageFilename}${
      media.reused ? ', reused existing media' : ', uploaded new media'
    })`
  );
  summary.updated += 1;
}

async function main() {
  const createdMap = parseSuccessLogCreated();
  const summary = { total: createdMap.size, updated: 0, alreadyHasImage: 0, noImageFound: [], failed: [] };

  for (const [filename, postId] of createdMap) {
    try {
      await processFile(filename, postId, summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`FAIL  ${filename} (post ${postId}) — ${message}`);
      summary.failed.push({ filename, postId, error: message });
    }
  }

  console.log('\n=== Featured Image Report ==============================');
  console.log(`Migrated posts checked:       ${summary.total}`);
  console.log(`Featured image set:           ${summary.updated}`);
  console.log(`Already had a featured image: ${summary.alreadyHasImage}`);
  console.log(`No suitable image found:      ${summary.noImageFound.length}`);
  summary.noImageFound.forEach((f) => console.log(`  - ${f.filename} (post ${f.postId}): ${f.reason}`));
  console.log(`Failed:                        ${summary.failed.length}`);
  summary.failed.forEach((f) => console.log(`  - ${f.filename} (post ${f.postId}): ${f.error}`));
  console.log('==========================================================\n');
}

main().catch((err) => {
  console.error('Fatal error:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
