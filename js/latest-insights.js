import {
  fetchPosts,
  decodeHtmlEntities,
  stripHtml,
  formatDateShort,
  getFeaturedImage,
  getFeaturedImageAlt,
  getCategories,
} from "./wp-utils.js";
import { initInsights } from "../assets/js/components/insights.js";

const HOME_INSIGHTS_COUNT = 3;

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
                 alt="${getFeaturedImageAlt(post)}"
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

async function init() {
  const grid = document.getElementById("homeInsightsGrid");
  if (!grid) return;

  try {
    const { posts } = await fetchPosts(1, HOME_INSIGHTS_COUNT);
    if (!posts.length) return;

    const fragment = document.createDocumentFragment();
    posts.forEach((post) => fragment.appendChild(createCardElement(post)));
    grid.appendChild(fragment);

    initInsights(".insights");
  } catch (err) {
    console.error("Error loading latest articles:", err);
  }
}

document.addEventListener("DOMContentLoaded", init);
