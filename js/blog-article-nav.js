import {
    fetchAllPosts,
    decodeHtmlEntities,
    getFeaturedImage,
    getFeaturedImageAlt,
    getCategories,
    getPostIdFromQuery
} from './wp-utils.js';

function createNavItem(post, direction) {
    const isPrev = direction === 'prev';
    const href = `blog-single.html?id=${post.id}`;
    const title = decodeHtmlEntities(post.title?.rendered || '');
    const category = getCategories(post)[0];
    const directionLabel = isPrev ? '← Previous Article' : 'Next Article →';

    const item = document.createElement('div');
    item.className = `article-nav-item article-nav-item--${direction}`;
    item.innerHTML = `
        <span class="article-nav-card__direction">${directionLabel}</span>
        <a class="article-nav-card article-nav-card--${direction}" href="${href}"
           aria-label="${isPrev ? 'Previous' : 'Next'} article: ${title}">
            <div class="article-nav-card__image-wrap">
                <img class="article-nav-card__image" src="${getFeaturedImage(post)}" alt="${getFeaturedImageAlt(post)}" loading="lazy">
            </div>
            <div class="article-nav-card__content">
                <span class="article-nav-card__category">${category}</span>
                <h3 class="article-nav-card__title">${title}</h3>
            </div>
        </a>
    `;
    return item;
}

// Prev/Next are derived from the post list's own order (the same order
// posts appear in on the blog listing): prev is the item immediately before
// the current post in that list (lower index), next is the item immediately
// after (higher index). Hides itself entirely when there's nothing to show.
function selectAdjacentArticles(posts, currentId) {
    const currentIndex = posts.findIndex((post) => String(post.id) === String(currentId));
    if (currentIndex === -1) return { prevArticle: null, nextArticle: null };

    const prevArticle = currentIndex > 0 ? posts[currentIndex - 1] : null;
    const nextArticle = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
    return { prevArticle, nextArticle };
}

function renderNav(nav, { prevArticle, nextArticle }) {
    if (!prevArticle && !nextArticle) return;

    nav.innerHTML = '';
    if (prevArticle) nav.appendChild(createNavItem(prevArticle, 'prev'));
    if (nextArticle) nav.appendChild(createNavItem(nextArticle, 'next'));
    nav.hidden = false;
}

async function init() {
    const nav = document.getElementById('articleNav');
    if (!nav) return;

    const currentId = getPostIdFromQuery();
    if (!currentId) return;

    try {
        const posts = await fetchAllPosts();
        if (posts.length <= 1) return;

        renderNav(nav, selectAdjacentArticles(posts, currentId));
    } catch (err) {
        console.error('Error loading article navigation:', err);
    }
}

document.addEventListener('DOMContentLoaded', init);
