import { initInsights } from "../assets/js/components/insights.js";
import {
  fetchAllPosts,
  fetchCategories,
  fetchTags,
  decodeHtmlEntities,
  stripHtml,
  formatDateShort,
  getFeaturedImage,
  getCategories,
  getTags,
} from "./wp-utils.js";

const POSTS_PER_PAGE = 9;

function getExcerpt(post) {
  const rawExcerpt = post.excerpt?.rendered
    ? stripHtml(post.excerpt.rendered).trim()
    : "";
  if (rawExcerpt) return rawExcerpt;
  const rawContent = post.content?.rendered
    ? stripHtml(post.content.rendered).trim()
    : "";
  return rawContent ? `${rawContent.slice(0, 160)}…` : "";
}

/**
 * Builds a card matching the existing .insight-card markup used on the
 * homepage, so insights.css / insights.js apply with no changes.
 */
function createCardElement(post) {
  const article = document.createElement("article");
  article.className = "insight-card";

  const title = decodeHtmlEntities(post.title?.rendered || "");
  const category = getCategories(post)[0];
  const href = `blog-single.html?id=${post.id}`;

  article.innerHTML = `
        <div class="insight-card__image-wrap">
            <img class="insight-card__image"
                 src="${getFeaturedImage(post)}"
                 alt=""
                 loading="lazy"
                 width="384"
                 height="220">
            <span class="insight-card__badge">${category}</span>
        </div>
        <div class="insight-card__content">
            <div class="insight-card__meta">
                <span class="insight-card__category">${category}</span>
                <span class="insight-card__date">${formatDateShort(post.date)}</span>
            </div>
            <h3 class="insight-card__title">
                <a href="${href}" class="insight-card__title-link">${title}</a>
            </h3>
            <p class="insight-card__desc">${getExcerpt(post)}</p>
        </div>
    `;

  return article;
}

function showState(grid, message, { retry } = {}) {
  grid.innerHTML = "";
  const state = document.createElement("div");
  state.className = "loading-state";
  state.textContent = message;

  if (retry) {
    const retryBtn = document.createElement("button");
    retryBtn.type = "button";
    retryBtn.className = "btn btn-secondary";
    retryBtn.textContent = "Try Again";
    retryBtn.addEventListener("click", retry);
    state.appendChild(document.createElement("br"));
    state.appendChild(retryBtn);
  }

  grid.appendChild(state);
}

function renderPosts(grid, posts, emptyMessage) {
  grid.innerHTML = "";

  if (!posts.length) {
    showState(grid, emptyMessage);
    return;
  }

  const fragment = document.createDocumentFragment();
  posts.forEach((post) => fragment.appendChild(createCardElement(post)));
  grid.appendChild(fragment);

  initInsights(".insights");
}

function renderPagination(nav, page, totalPages, onNavigate) {
  nav.innerHTML = "";

  if (totalPages <= 1) {
    nav.hidden = true;
    return;
  }
  nav.hidden = false;

  const makeButton = (
    label,
    targetPage,
    { disabled = false, active = false, isNav = false } = {},
  ) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `insights__page-btn${isNav ? " insights__page-btn--nav" : ""}${active ? " is-active" : ""}`;
    btn.textContent = label;
    btn.disabled = disabled;
    if (active) btn.setAttribute("aria-current", "page");
    if (!disabled) btn.addEventListener("click", () => onNavigate(targetPage));
    return btn;
  };

  const fragment = document.createDocumentFragment();
  fragment.appendChild(
    makeButton("Prev", page - 1, { disabled: page === 1, isNav: true }),
  );
  for (let p = 1; p <= totalPages; p += 1) {
    fragment.appendChild(makeButton(String(p), p, { active: p === page }));
  }
  fragment.appendChild(
    makeButton("Next", page + 1, {
      disabled: page === totalPages,
      isNav: true,
    }),
  );

  nav.appendChild(fragment);
}

function renderResultsText(el, page, perPage, total) {
  if (!total) {
    el.textContent = "Showing 0 of 0 results";
    return;
  }
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  el.textContent = `Showing ${start}–${end} of ${total} results`;
}

function populateSelect(select, terms) {
  const sorted = [...terms].sort((a, b) => a.name.localeCompare(b.name));
  const fragment = document.createDocumentFragment();
  sorted.forEach((term) => {
    const option = document.createElement("option");
    option.value = term.slug;
    option.textContent = decodeHtmlEntities(term.name);
    fragment.appendChild(option);
  });
  select.appendChild(fragment);
}

// Precomputed once per post (title + excerpt + content + its own category/tag
// names, stripped of markup) so every keystroke is a cheap substring check
// instead of re-parsing HTML. Category/tag names are included so typing a
// category like "Branding" finds posts assigned to it even when that word
// never appears in the post's own text.
function buildSearchIndex(posts) {
  const index = new Map();
  posts.forEach((post) => {
    const title = stripHtml(post.title?.rendered || "");
    const excerpt = stripHtml(post.excerpt?.rendered || "");
    const content = stripHtml(post.content?.rendered || "");
    const terms = [...getCategories(post), ...getTags(post)].join(" ");
    index.set(post.id, `${title} ${excerpt} ${content} ${terms}`.toLowerCase());
  });
  return index;
}

function filterPosts(posts, { categoryId, tagId, search }, searchIndex) {
  const query = search?.trim().toLowerCase();
  return posts.filter((post) => {
    const matchesCategory =
      !categoryId || post.categories?.includes(categoryId);
    const matchesTag = !tagId || post.tags?.includes(tagId);
    const matchesSearch =
      !query || (searchIndex.get(post.id) || "").includes(query);
    return matchesCategory && matchesTag && matchesSearch;
  });
}

// A post whose own category/tag exactly names the search term (e.g. a post
// actually filed under "Branding") is the most relevant match for that
// search and should surface first — otherwise it can get buried on a later
// page behind many posts that just happen to mention the word in passing.
// Array.prototype.sort is stable, so ties keep their existing order.
function sortByRelevance(posts, search) {
  const query = search?.trim().toLowerCase();
  if (!query) return posts;

  const isExactTermMatch = (post) =>
    [...getCategories(post), ...getTags(post)].some(
      (name) => name.toLowerCase() === query,
    );

  return [...posts].sort(
    (a, b) => Number(isExactTermMatch(b)) - Number(isExactTermMatch(a)),
  );
}

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const page = Number(params.get("page"));
  return {
    categorySlug: params.get("category") || null,
    tagSlug: params.get("tag") || null,
    search: params.get("search") || "",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

function writeStateToUrl(state) {
  const params = new URLSearchParams();
  if (state.categorySlug) params.set("category", state.categorySlug);
  if (state.tagSlug) params.set("tag", state.tagSlug);
  if (state.search) params.set("search", state.search);
  if (state.page > 1) params.set("page", String(state.page));

  const query = params.toString();
  const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState(null, "", newUrl);
}

/**
 * Owns filter/page state and re-renders the grid, pagination, and results
 * text from it. Posts are fetched once; every filter/page change after that
 * is a client-side slice of the same array (Single Responsibility: this is
 * the only place state changes turn into a render). categoryBySlug/tagBySlug
 * resolve the human-readable URL slugs to the numeric ids posts are tagged
 * with internally.
 */
function createController(
  refs,
  { allPosts, categoryBySlug, tagBySlug, searchIndex },
) {
  const state = {
    allPosts,
    categorySlug: null,
    tagSlug: null,
    search: "",
    page: 1,
  };

  function render() {
    const categoryId = state.categorySlug
      ? categoryBySlug.get(state.categorySlug)?.id
      : null;
    const tagId = state.tagSlug ? tagBySlug.get(state.tagSlug)?.id : null;
    const filtered = sortByRelevance(
      filterPosts(
        state.allPosts,
        { categoryId, tagId, search: state.search },
        searchIndex,
      ),
      state.search,
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
    state.page = Math.min(state.page, totalPages);

    const start = (state.page - 1) * POSTS_PER_PAGE;
    const pagePosts = filtered.slice(start, start + POSTS_PER_PAGE);

    const hasActiveFilter = Boolean(
      state.categorySlug || state.tagSlug || state.search,
    );
    const emptyMessage = !state.allPosts.length
      ? "No articles published yet — check back soon."
      : hasActiveFilter
        ? "No articles found. Try another keyword or clear the filters."
        : "No articles published yet — check back soon.";
    renderPosts(refs.grid, pagePosts, emptyMessage);
    renderResultsText(
      refs.results,
      state.page,
      POSTS_PER_PAGE,
      filtered.length,
    );

    if (pagePosts.length) {
      renderPagination(
        refs.pagination,
        state.page,
        totalPages,
        (targetPage) => {
          state.page = targetPage;
          writeStateToUrl(state);
          render();
          refs.grid.scrollIntoView({ behavior: "smooth", block: "start" });
        },
      );
    } else {
      refs.pagination.hidden = true;
    }

    refs.clearBtn.hidden = !hasActiveFilter;
  }

  function onFilterChange() {
    state.categorySlug = refs.categorySelect.value || null;
    state.tagSlug = refs.tagSelect.value || null;
    state.search = refs.searchInput.value;
    state.page = 1;
    writeStateToUrl(state);
    render();
  }

  function clearFilters() {
    refs.categorySelect.value = "";
    refs.tagSelect.value = "";
    refs.searchInput.value = "";
    state.categorySlug = null;
    state.tagSlug = null;
    state.search = "";
    state.page = 1;
    writeStateToUrl(state);
    render();
  }

  return { state, render, onFilterChange, clearFilters };
}

async function init() {
  const refs = {
    grid: document.getElementById("insightsGrid"),
    pagination: document.getElementById("insightsPagination"),
    results: document.getElementById("blogResultsText"),
    searchInput: document.getElementById("blogSearchInput"),
    categorySelect: document.getElementById("blogCategoryFilter"),
    tagSelect: document.getElementById("blogTagFilter"),
    clearBtn: document.getElementById("blogClearFilters"),
  };
  if (!refs.grid || !refs.pagination) return;

  showState(refs.grid, "Loading articles…");
  refs.pagination.hidden = true;

  const initialState = readStateFromUrl();
  if (refs.searchInput) refs.searchInput.value = initialState.search;

  try {
    const [posts, categories, tags] = await Promise.all([
      fetchAllPosts(),
      fetchCategories().catch(() => []),
      fetchTags().catch(() => []),
    ]);

    const categoryBySlug = new Map(categories.map((term) => [term.slug, term]));
    const tagBySlug = new Map(tags.map((term) => [term.slug, term]));
    const searchIndex = buildSearchIndex(posts);

    populateSelect(refs.categorySelect, categories);
    populateSelect(refs.tagSelect, tags);
    if (initialState.categorySlug)
      refs.categorySelect.value = initialState.categorySlug;
    if (initialState.tagSlug) refs.tagSelect.value = initialState.tagSlug;

    const controller = createController(refs, {
      allPosts: posts,
      categoryBySlug,
      tagBySlug,
      searchIndex,
    });
    controller.state.categorySlug = initialState.categorySlug;
    controller.state.tagSlug = initialState.tagSlug;
    controller.state.search = initialState.search;
    controller.state.page = initialState.page;

    refs.categorySelect.addEventListener("change", controller.onFilterChange);
    refs.tagSelect.addEventListener("change", controller.onFilterChange);
    refs.searchInput.addEventListener("input", controller.onFilterChange);
    refs.clearBtn.addEventListener("click", controller.clearFilters);

    controller.render();
  } catch (err) {
    console.error("Error loading blog posts:", err);
    showState(refs.grid, "We couldn’t load articles right now.", {
      retry: () => window.location.reload(),
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
