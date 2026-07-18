// Shared per-page SEO metadata writer. Content-agnostic on purpose: it only
// knows how to write a title/description into the DOM, not where those
// values come from — Projects (js/project.js) is the first caller, Blogs
// (js/blog-single.js) can adopt it the same way in a later phase without any
// change here.

const SITE_NAME = "Envizon Studio";
const DEFAULT_DESCRIPTION =
  "Envizon Studio is a branding, design, and digital marketing agency helping brands stand out.";

// Single source of truth for the "empty description" fallback, shared by
// setPageMeta (search-engine snippet) and setOpenGraphTags (social preview)
// so the two never disagree.
function resolveDescription(description) {
  return (description || "").trim() || DEFAULT_DESCRIPTION;
}

/**
 * Sets document.title (suffixed with the site name) and the page's
 * <meta name="description"> content. Falls back to a generic site
 * description when `description` is empty, so the tag is never blank.
 */
export function setPageMeta({ title, description } = {}) {
  if (title) document.title = `${title} - ${SITE_NAME}`;

  const tag = document.querySelector('meta[name="description"]');
  if (!tag) return;
  tag.setAttribute("content", resolveDescription(description));
}

/**
 * Points <link rel="canonical"> at `url`, updating the existing tag if one
 * is already in <head> or creating it if this is the page's first call —
 * so repeated calls (e.g. re-rendering after a client-side navigation)
 * never leave more than one canonical tag behind.
 */
export function setCanonicalUrl(url) {
  if (!url) return;

  let tag = document.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", url);
}

// Finds a meta tag by an attribute/key pair — Open Graph tags are keyed on
// `property` (e.g. property="og:title"), Twitter Card tags on `name` (e.g.
// name="twitter:title") — and updates its content, or creates + appends one
// if this is the page's first call. The one place either tag family's
// find-or-create logic lives.
function setMetaTag(attr, key, content) {
  if (!content) return;

  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setMetaProperty(property, content) {
  setMetaTag("property", property, content);
}

function setMetaName(name, content) {
  setMetaTag("name", name, content);
}

// Both Open Graph and Twitter Card images must be absolute URLs — a
// relative path (e.g. the FALLBACK_IMAGE default) won't resolve in an
// external scraper's preview. A malformed CMS-supplied URL is caught rather
// than thrown, so one bad field only drops that meta tag instead of taking
// down the whole page render.
function resolveAbsoluteUrl(url) {
  if (!url) return "";
  try {
    return new URL(url, window.location.href).href;
  } catch (err) {
    console.error("Invalid URL for meta tag resolution:", url, err);
    return "";
  }
}

/**
 * Sets the standard Open Graph tags used for social share previews
 * (Facebook, LinkedIn, Slack, iMessage, ...). Reuses the same description
 * fallback as setPageMeta.
 */
export function setOpenGraphTags({
  title,
  description,
  image,
  url,
  type = "article",
  siteName = SITE_NAME,
} = {}) {
  setMetaProperty("og:title", title);
  setMetaProperty("og:description", resolveDescription(description));
  setMetaProperty("og:image", resolveAbsoluteUrl(image));
  setMetaProperty("og:url", url);
  setMetaProperty("og:type", type);
  setMetaProperty("og:site_name", siteName);
}

/**
 * Sets the Twitter Card tags used for X/Twitter link previews. Mirrors
 * setOpenGraphTags's create-or-update behavior via the same setMetaTag
 * helper (keyed on `name` instead of `property`), and reuses the same
 * description/image resolution so the Twitter preview never disagrees with
 * the Open Graph one.
 */
export function setTwitterCardTags({ title, description, image, url } = {}) {
  setMetaName("twitter:card", "summary_large_image");
  setMetaName("twitter:title", title);
  setMetaName("twitter:description", resolveDescription(description));
  setMetaName("twitter:image", resolveAbsoluteUrl(image));
  setMetaName("twitter:url", url);
}

// Finds the page's JSON-LD script tag and replaces its content, or creates
// + appends one if this is the page's first call — the same find-or-update
// pattern as setCanonicalUrl/setMetaTag, just targeting a <script> instead
// of a <link>/<meta>, so re-rendering never leaves more than one behind.
function setJsonLdScript(data) {
  let tag = document.querySelector('script[type="application/ld+json"]');
  if (!tag) {
    tag = document.createElement("script");
    tag.setAttribute("type", "application/ld+json");
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(data);
}

/**
 * Sets the page's JSON-LD structured data as a schema.org object. Reuses the
 * same description/image resolution as Open Graph and Twitter Cards so all
 * three never disagree. `type` defaults to CreativeWork (the right fit for
 * a portfolio project); a future Blog caller can pass e.g. "BlogPosting"
 * instead. Fields with no value (missing image, missing url) are left out
 * of the object entirely rather than written as empty strings.
 */
export function setStructuredData({
  title,
  description,
  image,
  url,
  type = "CreativeWork",
  siteName = SITE_NAME,
} = {}) {
  const data = {
    "@context": "https://schema.org",
    "@type": type,
    ...(title && { name: title }),
    description: resolveDescription(description),
    ...(image && { image: resolveAbsoluteUrl(image) }),
    ...(url && { url }),
    publisher: {
      "@type": "Organization",
      name: siteName,
    },
    ...(url && {
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
    }),
  };

  setJsonLdScript(data);
}
