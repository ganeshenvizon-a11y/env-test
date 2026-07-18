// Shared rendering-safety guards for headless-CMS data. Content-agnostic on
// purpose (no WordPress-specific knowledge) — the same guards apply to any
// page rendering possibly-incomplete API data, not just Projects, so a
// second page (e.g. Blog) can adopt these without duplicating the logic.

// Only ever points a link at an http(s) URL — free-text CMS fields (e.g. a
// website URL) can be empty or malformed, so this both filters out empty
// values and guards against something like a "javascript:" URL in href.
const SAFE_URL = /^https?:\/\//i;

/**
 * Sets `el`'s text and reveals it, or hides it entirely when `text` is
 * empty/whitespace-only. Uses inline style.display (not the `hidden`
 * attribute) because callers' elements often have an explicit `display`
 * value set by their own CSS class, which an author stylesheet rule of
 * equal specificity always wins over the UA [hidden] rule.
 */
export function setOptionalText(el, text) {
  if (!el) return;
  const value = (text || "").trim();
  el.style.display = value ? "" : "none";
  if (value) el.textContent = value;
}

/**
 * Points `el` at `url` if it's a safe http(s) URL, or hides `el` otherwise.
 */
export function setSafeLink(el, url) {
  if (!el) return;
  const isSafe = SAFE_URL.test(url);
  el.hidden = !isSafe;
  if (isSafe) el.href = url;
}

/**
 * Sets `imgEl`'s src/alt, swapping to `fallbackSrc` if `src` is empty or
 * fails to load (e.g. a stale/broken CMS media URL). The error listener is
 * attached before `src` is assigned so a fast/cached failure is never missed.
 * If `fallbackSrc` *also* fails to load, hides the element instead of
 * leaving a permanently broken image icon on the page.
 */
export function setImageWithFallback(imgEl, src, fallbackSrc, alt) {
  if (!imgEl) return;
  imgEl.alt = alt || "";

  function hideOnFinalFailure() {
    console.error("Image failed to load, including its fallback:", fallbackSrc);
    imgEl.hidden = true;
  }

  const resolvedSrc = src || fallbackSrc;
  if (resolvedSrc === fallbackSrc) {
    imgEl.addEventListener("error", hideOnFinalFailure, { once: true });
  } else {
    imgEl.addEventListener(
      "error",
      () => {
        imgEl.addEventListener("error", hideOnFinalFailure, { once: true });
        imgEl.src = fallbackSrc;
      },
      { once: true },
    );
  }
  imgEl.src = resolvedSrc;
}

/**
 * Whether an HTML string has any meaningful (non-whitespace) content — used
 * to decide whether a container built from raw CMS HTML should be shown at
 * all, so a missing/empty field never leaves a visible empty section.
 */
export function hasContent(html) {
  return Boolean((html || "").trim());
}
