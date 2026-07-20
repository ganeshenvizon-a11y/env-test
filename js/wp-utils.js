import { CONFIG } from "./config.js";

export const FALLBACK_IMAGE = "assets/images/port1.png";
export const FALLBACK_CATEGORY = "Journal";

const postsListRequests = new Map();
const postRequests = new Map();
const taxonomyRequests = new Map();
let allPostsRequest = null;

function handleResponse(res) {
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

/**
 * Fetches one page of posts (with embedded media/terms) plus pagination
 * metadata from WordPress's X-WP-TotalPages header. Shares the in-flight
 * promise per page/perPage combination so repeat calls don't trigger
 * duplicate requests.
 */
export function fetchPosts(page = 1, perPage = 10) {
  const cacheKey = `${page}:${perPage}`;
  if (!postsListRequests.has(cacheKey)) {
    postsListRequests.set(
      cacheKey,
      fetch(`${CONFIG.API_BASE}/posts?_embed&page=${page}&per_page=${perPage}`)
        .then(async (res) => {
          const posts = await handleResponse(res);
          const totalPages = Number(res.headers.get("X-WP-TotalPages")) || 1;
          const total = Number(res.headers.get("X-WP-Total")) || posts.length;
          return { posts, totalPages, total };
        })
        .catch((err) => {
          postsListRequests.delete(cacheKey);
          throw err;
        }),
    );
  }
  return postsListRequests.get(cacheKey);
}

/**
 * Fetches every post by walking fetchPosts() page by page (reusing its
 * per-page cache), so callers can filter/paginate client-side after a
 * single aggregate fetch instead of round-tripping to WordPress per filter
 * change. Cached as one shared promise for the lifetime of the page.
 */
export function fetchAllPosts() {
  if (!allPostsRequest) {
    allPostsRequest = (async () => {
      const first = await fetchPosts(1, 100);
      let posts = first.posts;
      for (let page = 2; page <= first.totalPages; page += 1) {
        const next = await fetchPosts(page, 100);
        posts = posts.concat(next.posts);
      }
      return posts;
    })().catch((err) => {
      allPostsRequest = null;
      throw err;
    });
  }
  return allPostsRequest;
}

/**
 * Fetches all terms for a taxonomy (categories or tags), caching the
 * in-flight promise per taxonomy so repeat calls don't trigger duplicate
 * requests.
 */
function fetchTaxonomyTerms(taxonomy) {
  if (!taxonomyRequests.has(taxonomy)) {
    taxonomyRequests.set(
      taxonomy,
      fetch(`${CONFIG.API_BASE}/${taxonomy}?per_page=100`)
        .then(handleResponse)
        .catch((err) => {
          taxonomyRequests.delete(taxonomy);
          throw err;
        }),
    );
  }
  return taxonomyRequests.get(taxonomy);
}

export function fetchCategories() {
  return fetchTaxonomyTerms("categories");
}

export function fetchTags() {
  return fetchTaxonomyTerms("tags");
}

/**
 * Fetches a single post by id (with embedded media/terms), caching the
 * in-flight promise per id so repeat calls don't trigger duplicate requests.
 */
export function fetchPost(id) {
  if (!postRequests.has(id)) {
    postRequests.set(
      id,
      fetch(`${CONFIG.API_BASE}/posts/${id}?_embed`)
        .then(handleResponse)
        .catch((err) => {
          postRequests.delete(id);
          throw err;
        }),
    );
  }
  return postRequests.get(id);
}

export function getPostIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return id && /^\d+$/.test(id) ? id : null;
}

// Reused across every call instead of allocating a fresh element each time —
// neither is ever attached to the document, so a single shared instance per
// helper is safe and behaves identically to a fresh one.
const decodeScratchEl = document.createElement("textarea");
const stripScratchEl = document.createElement("div");

export function decodeHtmlEntities(text) {
  decodeScratchEl.innerHTML = text;
  return decodeScratchEl.value;
}

export function stripHtml(html) {
  stripScratchEl.innerHTML = html;
  return stripScratchEl.textContent || "";
}

export function formatDateShort(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDateLong(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getFeaturedImage(post) {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  return media?.source_url || FALLBACK_IMAGE;
}

/**
 * Descriptive alt text for a post's featured image: the media library's own
 * "Alternative Text" field when an editor set one, otherwise the post title
 * (never empty/generic, unlike the raw WordPress default of "").
 */
export function getFeaturedImageAlt(post) {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const altText = media?.alt_text?.trim();
  return altText || decodeHtmlEntities(post.title?.rendered || "");
}

/**
 * The real WordPress featured-media URL, or null if the post has none (as
 * opposed to getFeaturedImage's FALLBACK_IMAGE, which is a display default
 * and not something migrated content could legitimately duplicate).
 */
export function getFeaturedImageSourceUrl(post) {
  return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;
}

/**
 * Reduces an image URL to a comparable filename: strips query/hash, decodes
 * percent-encoding, lowercases, and drops the "-{width}x{height}" suffix
 * WordPress appends to resized copies (e.g. "photo-1024x683.jpg" ->
 * "photo.jpg") so the same image at a different size still matches.
 */
function normalizeImageFilename(url) {
  if (!url) return "";
  try {
    const { pathname } = new URL(url, window.location.href);
    const filename = decodeURIComponent(pathname.split("/").pop() || "");
    return filename.replace(/-\d+x\d+(?=\.\w+$)/, "").toLowerCase();
  } catch {
    return "";
  }
}

function isSameImage(urlA, urlB) {
  if (!urlA || !urlB) return false;
  if (urlA === urlB) return true;
  const nameA = normalizeImageFilename(urlA);
  const nameB = normalizeImageFilename(urlB);
  return Boolean(nameA) && nameA === nameB;
}

/**
 * Migrated WordPress content often repeats the featured image as the first
 * <img> in the body. If the first image in `html` matches `featuredImageUrl`
 * (exact URL or same normalized filename), removes just that <img> element
 * so it isn't shown twice; every other image is left untouched. If the first
 * image doesn't match (or there is no image), the HTML is returned as-is.
 */
export function removeDuplicateFeaturedImage(html, featuredImageUrl) {
  if (!html || !featuredImageUrl) return html;

  const container = document.createElement("div");
  container.innerHTML = html;

  const firstImg = container.querySelector("img");
  if (!firstImg) return html;

  const imgSrc =
    firstImg.getAttribute("src") || firstImg.getAttribute("data-src") || "";
  if (isSameImage(imgSrc, featuredImageUrl)) {
    firstImg.remove();
  }

  return container.innerHTML;
}

function getCategoryTerms(post) {
  const terms = post._embedded?.["wp:term"] || [];
  return terms.flat().filter((term) => term.taxonomy === "category");
}

/**
 * Returns the post's category term names (taxonomy "category" only,
 * tags are excluded), decoded and falling back to a single generic label.
 */
export function getCategories(post) {
  const categories = getCategoryTerms(post).map((term) =>
    decodeHtmlEntities(term.name),
  );
  return categories.length ? categories : [FALLBACK_CATEGORY];
}

/**
 * Returns the post's tag term names (taxonomy "post_tag" only).
 */
export function getTags(post) {
  const terms = post._embedded?.["wp:term"] || [];
  return terms
    .flat()
    .filter((term) => term.taxonomy === "post_tag")
    .map((term) => decodeHtmlEntities(term.name));
}

/**
 * Returns the post's primary (first) category as { id, name, slug }, or null
 * if the post has no real category assigned (only the FALLBACK_CATEGORY
 * label applies at that point, which has no matching WordPress term to link
 * to).
 */
export function getPrimaryCategory(post) {
  const [first] = getCategoryTerms(post);
  if (!first) return null;
  return {
    id: first.id,
    name: decodeHtmlEntities(first.name),
    slug: first.slug,
  };
}

export function estimateReadingTime(html, wordsPerMinute = 200) {
  const words = stripHtml(html || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return Math.max(1, Math.ceil(words.length / wordsPerMinute));
}

/**
 * Same estimate as estimateReadingTime, but counts words from an already
 * rendered DOM element via innerText instead of a raw HTML string — so it
 * reflects the article as displayed (CSS-hidden elements excluded, unlike a
 * plain HTML-tag strip) rather than the raw API payload.
 */
export function estimateReadingTimeFromElement(element, wordsPerMinute = 200) {
  const words = (element?.innerText || "").trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length / wordsPerMinute));
}
