import { decodeHtmlEntities, stripHtml, getFeaturedImage } from './wp-utils.js';
import { initSocialShare } from './shared/social-share.js';

function renderShare(post) {
    initSocialShare({
        title: decodeHtmlEntities(post.title?.rendered || ''),
        description: stripHtml(post.excerpt?.rendered || ''),
        url: window.location.href,
        image: getFeaturedImage(post),
    });
}

function init() {
    if (!document.getElementById('articleShare')) return;

    window.addEventListener('blog:article-loaded', (event) => {
        renderShare(event.detail.post);
    }, { once: true });
}

document.addEventListener('DOMContentLoaded', init);
