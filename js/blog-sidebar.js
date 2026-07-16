import {
    fetchAllPosts,
    decodeHtmlEntities,
    formatDateShort,
    getFeaturedImage,
    getCategories,
    getPostIdFromQuery
} from './wp-utils.js';

const RECENT_POSTS_COUNT = 4;

function getRefs() {
    return {
        sidebar: document.getElementById('blogSidebar'),
        featured: document.getElementById('sidebarFeatured'),
        recentSection: document.getElementById('sidebarRecent'),
        recentList: document.getElementById('sidebarRecentList')
    };
}

// Featured Article is editor-controlled entirely from WordPress via the
// native Sticky Post feature — no frontend code change needed to feature a
// different post. Most-recently-published sticky post wins; if that's the
// article currently being viewed, the next sticky post takes its place; if
// there's no other sticky post to fall back on, or no sticky posts exist at
// all, the latest non-current post is used (previous default behaviour).
function selectFeaturedPost(posts, excludeId) {
    const stickyPosts = posts
        .filter((post) => post.sticky)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const featuredSticky = stickyPosts.find((post) => String(post.id) !== String(excludeId));
    if (featuredSticky) return featuredSticky;

    return posts.find((post) => String(post.id) !== String(excludeId)) || posts[0] || null;
}

function selectRecentPosts(posts, excludeIds, count) {
    return posts.filter((post) => !excludeIds.includes(String(post.id))).slice(0, count);
}

function createFeaturedCard(post) {
    const href = `blog-single.html?id=${post.id}`;
    const title = decodeHtmlEntities(post.title?.rendered || '');
    const category = getCategories(post)[0];

    const card = document.createElement('article');
    card.className = 'sidebar-featured';
    card.innerHTML = `
        <div class="sidebar-featured__image-wrap">
            <img class="sidebar-featured__image" src="${getFeaturedImage(post)}" alt="" loading="lazy">
            <span class="sidebar-featured__badge">${category}</span>
        </div>
        <div class="sidebar-featured__body">
            <span class="sidebar-featured__eyebrow">Featured Article</span>
            <h3 class="sidebar-featured__title">
                <a href="${href}" class="sidebar-featured__title-link">${title}</a>
            </h3>
            <span class="sidebar-featured__date">${formatDateShort(post.date)}</span>
            <a href="${href}" class="sidebar-featured__cta">Read Article <span aria-hidden="true">↗</span></a>
        </div>
    `;
    return card;
}

function createRecentItem(post) {
    const title = decodeHtmlEntities(post.title?.rendered || '');

    const item = document.createElement('a');
    item.className = 'sidebar-recent__item';
    item.href = `blog-single.html?id=${post.id}`;
    item.innerHTML = `
        <img class="sidebar-recent__thumb" src="${getFeaturedImage(post)}" alt="" loading="lazy" width="64" height="64">
        <div class="sidebar-recent__info">
            <h4 class="sidebar-recent__title">${title}</h4>
            <span class="sidebar-recent__date">${formatDateShort(post.date)}</span>
        </div>
    `;
    return item;
}

function renderFeatured(container, post) {
    container.innerHTML = '';
    if (!post) return;
    container.appendChild(createFeaturedCard(post));
}

function renderRecent(refs, posts) {
    refs.recentList.innerHTML = '';
    refs.recentSection.hidden = posts.length === 0;
    if (!posts.length) return;

    const fragment = document.createDocumentFragment();
    posts.forEach((post) => fragment.appendChild(createRecentItem(post)));
    refs.recentList.appendChild(fragment);
}

// Sidebar search never searches in-page — it only redirects to the listing
// page's search. Wired independently of post data so it works even if the
// featured/recent fetch below is still in flight or fails.
function initSidebarSearch() {
    const form = document.getElementById('sidebarSearchForm');
    const input = document.getElementById('sidebarSearchInput');
    if (!form || !input) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = input.value.trim();
        if (!query) return;
        window.location.href = `blog.html?search=${encodeURIComponent(query)}`;
    });
}

async function init() {
    initSidebarSearch();

    const refs = getRefs();
    if (!refs.sidebar) return;

    try {
        const posts = await fetchAllPosts();
        if (!posts.length) {
            refs.sidebar.hidden = true;
            return;
        }

        const currentPostId = getPostIdFromQuery();
        const featured = selectFeaturedPost(posts, currentPostId);
        const excludeIds = [currentPostId, featured ? String(featured.id) : null].filter(Boolean);

        renderFeatured(refs.featured, featured);
        renderRecent(refs, selectRecentPosts(posts, excludeIds, RECENT_POSTS_COUNT));
    } catch (err) {
        console.error('Error loading blog sidebar:', err);
        refs.sidebar.hidden = true;
    }
}

document.addEventListener('DOMContentLoaded', init);
