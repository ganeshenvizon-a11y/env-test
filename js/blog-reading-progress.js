// Tracks scroll through #articleContent and fills the fixed top progress
// bar accordingly. Waits for 'blog:article-loaded' (dispatched by
// blog-single.js once the article HTML is in the DOM) before measuring
// layout, since the article's height isn't known until then. Stays at 0%
// and never wires up scroll tracking if the article failed to load
// ('blog:article-error'), which naturally "resets" it on every navigation
// since this is a full page load per article.

function initReadingProgress(article, bar) {
    function update() {
        const rect = article.getBoundingClientRect();
        const articleTop = rect.top + window.scrollY;
        const scrollable = article.offsetHeight - window.innerHeight;

        const progress = scrollable <= 0
            ? 1
            : Math.min(1, Math.max(0, (window.scrollY - articleTop) / scrollable));

        bar.style.width = `${progress * 100}%`;
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
}

function init() {
    const bar = document.getElementById('readingProgressBar');
    const article = document.getElementById('articleContent');
    if (!bar || !article) return;

    window.addEventListener('blog:article-loaded', () => {
        initReadingProgress(article, bar);
    }, { once: true });
}

document.addEventListener('DOMContentLoaded', init);
