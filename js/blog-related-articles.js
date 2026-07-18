import {
    fetchAllPosts,
    decodeHtmlEntities,
    getFeaturedImage,
    getCategories,
    getPrimaryCategory,
    estimateReadingTime,
    formatDateShort
} from './wp-utils.js';
import { initInsights } from '../assets/js/components/insights.js';

const RELATED_POSTS_COUNT = 3;

// posts is already newest-first (WordPress's default order, reused as-is
// from fetchAllPosts' cache), so both the same-category matches and the
// other-category filler keep that order without re-sorting.
function selectRelatedPosts(posts, currentPost, count) {
    const currentId = String(currentPost.id);
    const primaryCategory = getPrimaryCategory(currentPost);
    const others = posts.filter((post) => String(post.id) !== currentId);

    const sameCategory = primaryCategory
        ? others.filter((post) => (post.categories || []).includes(primaryCategory.id))
        : [];

    const related = sameCategory.slice(0, count);

    if (related.length < count) {
        const usedIds = new Set([currentId, ...related.map((post) => String(post.id))]);
        const fillers = others
            .filter((post) => !usedIds.has(String(post.id)))
            .slice(0, count - related.length);
        related.push(...fillers);
    }

    return related;
}

// Reuses .insight-card exactly as-is (insights.css) — only the meta row
// gains a reading-time segment via the same .insight-card__date class,
// and the excerpt paragraph is dropped since it isn't part of the spec'd
// field list (image/category/title/date/reading time).
function createCard(post) {
    const title = decodeHtmlEntities(post.title?.rendered || '');
    const category = getCategories(post)[0];
    const href = `blog-single.html?id=${post.id}`;
    const readingTime = estimateReadingTime(post.content?.rendered);

    const card = document.createElement('article');
    card.className = 'insight-card';
    card.innerHTML = `
        <div class="insight-card__image-wrap">
            <img class="insight-card__image" src="${getFeaturedImage(post)}" alt="" loading="lazy">
            <span class="insight-card__badge">${category}</span>
        </div>
        <div class="insight-card__content">
            <div class="insight-card__meta">
                <span class="insight-card__category">${category}</span>
                <span class="insight-card__date">${formatDateShort(post.date)} · ${readingTime} min read</span>
            </div>
            <h3 class="insight-card__title">
                <a href="${href}" class="insight-card__title-link">${title}</a>
            </h3>
        </div>
    `;
    return card;
}

async function renderRelated(refs, currentPost) {
    const posts = await fetchAllPosts();
    const related = selectRelatedPosts(posts, currentPost, RELATED_POSTS_COUNT);
    if (!related.length) return;

    const fragment = document.createDocumentFragment();
    related.forEach((post) => fragment.appendChild(createCard(post)));
    refs.grid.appendChild(fragment);
    refs.wrapper.hidden = false;

    initInsights('.related-articles');
}

function init() {
    const refs = {
        wrapper: document.getElementById('relatedArticles'),
        grid: document.getElementById('relatedArticlesGrid')
    };
    if (!refs.wrapper || !refs.grid) return;

    window.addEventListener('blog:article-loaded', (event) => {
        renderRelated(refs, event.detail.post).catch((err) => {
            console.error('Error loading related articles:', err);
        });
    }, { once: true });
}

document.addEventListener('DOMContentLoaded', init);
