import { config } from './config.js';

function authHeader() {
  const username = config.wordpress.username();
  const appPassword = config.wordpress.appPassword();
  const token = Buffer.from(`${username}:${appPassword}`).toString('base64');
  return `Basic ${token}`;
}

async function wpRequest(pathSegment, options = {}) {
  const url = `${config.wordpress.baseUrl}${pathSegment}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(),
      ...options.headers,
    },
  });

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const message = (body && body.message) || response.statusText;
    throw new Error(`WordPress API ${response.status}: ${message} (${url})`);
  }

  return body;
}

function decodeEntities(str) {
  return str
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&');
}

export function buildDraftPayload({ title, content, excerpt, metaDescription, heroSubtitle, readingTime }) {
  return {
    title,
    content,
    excerpt,
    status: 'draft',
    acf: {
      hero_subtitle: heroSubtitle || '',
      meta_description: metaDescription || '',
      reading_time: readingTime ?? '',
    },
  };
}

// Duplicate protection: fuzzy-search WordPress by title (across all statuses),
// then require an exact case-insensitive match before treating it as a duplicate.
const SEARCHABLE_STATUSES = 'publish,future,draft,pending,private';

export async function findPostByTitle(title) {
  const query = new URLSearchParams({ search: title, status: SEARCHABLE_STATUSES, per_page: '100' });
  const results = await wpRequest(`/posts?${query.toString()}`, { method: 'GET' });
  if (!Array.isArray(results)) return null;

  const normalizedTarget = title.trim().toLowerCase();
  return (
    results.find(
      (post) => decodeEntities(post.title?.rendered || '').trim().toLowerCase() === normalizedTarget
    ) || null
  );
}

export async function createDraftPost(extractedFields) {
  const payload = buildDraftPayload(extractedFields);
  return wpRequest('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPost(postId) {
  return wpRequest(`/posts/${postId}?context=edit`, { method: 'GET' });
}

// Dedup check: exact filename match against existing Media Library items
// (fuzzy `search` narrows the candidates, then we require the attachment's
// source_url basename to match exactly before treating it as the same file).
export async function findExistingMedia(filename) {
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  const query = new URLSearchParams({ search: nameWithoutExt, per_page: '20' });
  const results = await wpRequest(`/media?${query.toString()}`, { method: 'GET' });
  if (!Array.isArray(results)) return null;

  return (
    results.find((item) => {
      const sourceFilename = item.source_url ? item.source_url.split('/').pop() : '';
      return sourceFilename.toLowerCase() === filename.toLowerCase();
    }) || null
  );
}

export async function uploadMedia(fileBuffer, filename, mimeType) {
  return wpRequest('/media', {
    method: 'POST',
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
    body: fileBuffer,
  });
}

// Title-only-style targeted update: sends only featured_media, leaving
// every other field (title, content, excerpt, acf, slug) untouched.
export async function setFeaturedMedia(postId, mediaId) {
  return wpRequest(`/posts/${postId}`, {
    method: 'POST',
    body: JSON.stringify({ featured_media: mediaId }),
  });
}
