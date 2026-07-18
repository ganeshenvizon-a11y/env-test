import {
    fetchPost,
    decodeHtmlEntities,
    formatDateLong,
    getFeaturedImage,
    getFeaturedImageSourceUrl,
    getCategories,
    getPrimaryCategory,
    estimateReadingTimeFromElement,
    getPostIdFromQuery,
    removeDuplicateFeaturedImage
} from './wp-utils.js';

function getRefs() {
    return {
        hero: document.querySelector('.main-content'),
        title: document.getElementById('postTitle'),
        readingTime: document.getElementById('postReadingTime'),
        meta: document.getElementById('postMeta'),
        categoryList: document.getElementById('postCategoryList'),
        heroImage: document.getElementById('postFeaturedImage'),
        content: document.getElementById('articleContent'),
        breadcrumb: document.getElementById('blogSingleBreadcrumb'),
        breadcrumbCategorySep: document.getElementById('blogSingleBreadcrumbCategorySep'),
        breadcrumbCategory: document.getElementById('blogSingleBreadcrumbCategory')
    };
}

// The hero already renders the post title, so drop a leading <h1> from the
// WP content to avoid a duplicate heading — render-time only, nothing is
// written back to WordPress or the source HTML. Only the very first
// meaningful element is checked; any later <h1> in the article is untouched.
function stripLeadingH1(html) {
    const container = document.createElement('div');
    container.innerHTML = html;

    if (container.firstElementChild?.tagName === 'H1') {
        container.firstElementChild.remove();
    }

    return container.innerHTML;
}

function renderCategories(container, categories) {
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    categories.forEach((name) => {
        const pill = document.createElement('div');
        pill.className = 'backgroundborder';

        const label = document.createElement('div');
        label.className = 'strategy';
        label.textContent = name;

        pill.appendChild(label);
        fragment.appendChild(pill);
    });

    container.appendChild(fragment);
}

// Home > Blogs are static; the category segment (and its leading separator)
// only appears once the post's primary category is known, and stays hidden
// entirely if the post has no real category assigned.
function renderBreadcrumb(refs, post) {
    const primaryCategory = getPrimaryCategory(post);

    if (primaryCategory) {
        refs.breadcrumbCategory.textContent = primaryCategory.name;
        refs.breadcrumbCategory.href = `blog.html?category=${encodeURIComponent(primaryCategory.slug)}`;
        refs.breadcrumbCategory.hidden = false;
        refs.breadcrumbCategorySep.hidden = false;
    }

    refs.breadcrumb.hidden = false;
}

function renderPost(refs, post) {
    const title = decodeHtmlEntities(post.title?.rendered || 'Untitled');

    refs.title.textContent = title;
    document.title = `${title} - Envizon Studio`;

    refs.meta.textContent = formatDateLong(post.date);
    renderCategories(refs.categoryList, getCategories(post));
    renderBreadcrumb(refs, post);

    refs.heroImage.src = getFeaturedImage(post);
    refs.heroImage.alt = title;

    const content = stripLeadingH1(post.content?.rendered || '');
    refs.content.innerHTML = removeDuplicateFeaturedImage(content, getFeaturedImageSourceUrl(post));

    // Read after the content is in the DOM so it reflects what's actually
    // rendered (and excludes anything CSS-hidden), not the raw API payload.
    refs.readingTime.textContent = `${estimateReadingTimeFromElement(refs.content)} min read`;

    window.dispatchEvent(new CustomEvent('blog:article-loaded', { detail: { post } }));
}

function renderError(refs) {
    document.documentElement.classList.add('is-article-missing');
    refs.hero.style.display = 'none';
    refs.content.innerHTML = '';

    const state = document.createElement('div');
    state.className = 'article-not-found';

    const title = document.createElement('h2');
    title.className = 'article-not-found__title';
    title.textContent = 'Article Not Found';

    const desc = document.createElement('p');
    desc.className = 'article-not-found__desc';
    desc.textContent = "The article you're looking for doesn't exist or may have been removed.";

    const backLink = document.createElement('a');
    backLink.href = 'blog.html';
    backLink.className = 'btn btn-secondary';
    backLink.textContent = 'Browse All Blogs';

    state.append(title, desc, backLink);
    refs.content.appendChild(state);

    window.dispatchEvent(new CustomEvent('blog:article-error'));
}

async function init() {
    const refs = getRefs();
    if (!refs.content) return;

    const id = getPostIdFromQuery();
    if (!id) {
        renderError(refs);
        return;
    }

    try {
        const post = await fetchPost(id);
        renderPost(refs, post);
    } catch (err) {
        console.error('Error loading blog post:', err);
        renderError(refs);
    }
}

document.addEventListener('DOMContentLoaded', init);
