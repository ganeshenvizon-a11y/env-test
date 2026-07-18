/**
 * Envizon Studio — Project Card
 * Single reusable card component for every project/brand grid on the site
 * (Featured Projects, Brand Grid, and any future section — Case Studies,
 * Related Projects, a Carousel, etc.). Sections own their own data and grid
 * chrome; they all render cards through renderProjectCard() from here so
 * there is exactly one card markup and one stylesheet (project-card.css).
 *
 * The card's frame is the Figma-exported "GP-SVG" shape (viewBox 0 0 400
 * 178), always shown fully expanded with its accent color and tags visible
 * — there is no hover-triggered reveal, so the card looks identical whether
 * or not it's being interacted with. It is defined once as an SVG <symbol>
 * injected into the page on first render and referenced per card via
 * <use>, so the path data is never duplicated in the DOM no matter how
 * many cards or sections render it. The yellow path uses
 * fill="currentColor" so each card can tint it with its own accent color
 * via CSS alone; the white panel and all geometry are fixed and are never
 * touched by JS or CSS.
 */

import { setImageWithFallback } from '../../../js/shared/cms-validation.js';

const FRAME_SYMBOL_ID = 'project-card-frame';
const BRANDING_FRAME_SYMBOL_ID = 'branding-card-frame';

// Whether this page is the projects/brand-showcase page never changes during
// the page's lifetime, so the DOM check runs once and is reused for every
// card instead of re-querying on each renderProjectCard() call.
let isProjectsPageCache = null;
function isProjectsPage(){
    if (isProjectsPageCache === null) {
        isProjectsPageCache = !!(document.querySelector('.projects-hero') || document.getElementById('projectsFeaturedBrandsGrid'));
    }
    return isProjectsPageCache;
}

function ensureFrameSprite(){
    if (document.getElementById(FRAME_SYMBOL_ID)) return;

    const sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sprite.setAttribute('aria-hidden', 'true');
    sprite.setAttribute('class', 'project-card-frame-sprite');
    sprite.setAttribute('style', 'position: absolute; width: 0; height: 0; overflow: hidden;');
    sprite.innerHTML = `<symbol id="${FRAME_SYMBOL_ID}" viewBox="0 0 400 178">
        <path class="project-card__frame-yellow" d="M122.354 71.956C129.957 72.0754 137.074 68.2261 141.135 61.7974L172.495 12.1589C176.452 5.89579 183.317 2.06944 190.725 1.99862L364.46 0.337771C383.919 0.151747 399.793 15.8744 399.794 35.3345L399.8 149.683C399.801 165.148 387.264 177.684 371.8 177.684H35.0058C15.6769 177.684 0.00737562 162.016 0.0058257 142.687L0.00285116 105.592C0.00128383 86.0459 16.0087 70.2867 35.5522 70.5934L122.354 71.956Z"></path>
        <path class="project-card__frame-white" d="M134.26 93.145C141.888 93.145 148.962 89.1597 152.914 82.6353L182.064 34.5166C186.016 27.9922 193.09 24.0069 200.719 24.0069L358.117 24.0074C375.79 24.0074 390.117 38.3343 390.117 56.0074V155.874C390.117 167.92 380.352 177.685 368.307 177.685H33.4901C21.4445 177.685 11.6797 167.92 11.6797 155.874V114.955C11.6797 102.91 21.4445 93.145 33.4901 93.145H134.26Z"></path>
    </symbol>
    <symbol id="${BRANDING_FRAME_SYMBOL_ID}" viewBox="0 0 400 178">
        <path class="branding-card__frame-yellow" d="M122.354 71.956C129.957 72.0754 137.074 68.2261 141.135 61.7974L172.495 12.1589C176.452 5.89579 183.317 2.06944 190.725 1.99862L364.46 0.337771C383.919 0.151747 399.793 15.8744 399.794 35.3345L399.8 149.683C399.801 165.148 387.264 177.684 371.8 177.684H35.0058C15.6769 177.684 0.00737562 162.016 0.0058257 142.687L0.00285116 105.592C0.00128383 86.0459 16.0087 70.2867 35.5522 70.5934L122.354 71.956Z"></path>
        <path class="branding-card__frame-white" d="M134.26 93.145C141.888 93.145 148.962 89.1597 152.914 82.6353L182.064 34.5166C186.016 27.9922 193.09 24.0069 200.719 24.0069L358.117 24.0074C375.79 24.0074 390.117 38.3343 390.117 56.0074V155.874C390.117 167.92 380.352 177.685 368.307 177.685H33.4901C21.4445 177.685 11.6797 167.92 11.6797 155.874V114.955C11.6797 102.91 21.4445 93.145 33.4901 93.145H134.26Z"></path>
    </symbol>`;
    document.body.insertBefore(sprite, document.body.firstChild);
}

/**
 * @param {Object} data
 * @param {string} data.title
 * @param {string} data.logo - image src for the project/brand logo
 * @param {string} [data.fallbackLogo] - swapped in if data.logo fails to load
 * @param {string} data.bgColor - CSS background (color or gradient)
 * @param {string} data.accentColor - fill for the SVG frame
 * @param {string[]} data.tags
 * @param {string} data.url - case study link
 * @returns {HTMLAnchorElement}
 */
export function renderProjectCard(data){
    ensureFrameSprite();

    const frameClass = isProjectsPage() ? 'branding-card__frame' : 'project-card__frame';
    const frameSymbolId = isProjectsPage() ? BRANDING_FRAME_SYMBOL_ID : FRAME_SYMBOL_ID;

    const card = document.createElement('a');
    card.className = 'project-card';
    card.href = data.url;
    card.setAttribute('aria-label', `View ${data.title} case study`);
    card.style.setProperty('--card-bg', data.bgColor);
    card.style.setProperty('--card-accent', data.accentColor);

    // Title/tags come straight from CMS text fields, so they're written via
    // textContent (never interpolated into the innerHTML template below) —
    // a title or tag containing literal HTML must render as inert text, not
    // be parsed as markup.
    card.innerHTML = `
        <span class="project-card__background">
            <img class="project-card__logo" alt="" loading="lazy" decoding="async">
        </span>
        <svg class="${frameClass}" viewBox="0 0 400 178" aria-hidden="true" focusable="false">
            <use href="#${frameSymbolId}"></use>
        </svg>
        <span class="project-card__content">
            <h3 class="project-card__name"></h3>
            <ul class="project-card__tags"></ul>
        </span>
    `;

    card.querySelector('.project-card__name').textContent = data.title;

    const tagsList = card.querySelector('.project-card__tags');
    (data.tags || []).forEach(tag => {
        const li = document.createElement('li');
        li.className = 'project-card__tag';
        li.textContent = tag;
        tagsList.appendChild(li);
    });

    // Set src after insertion (not in the template string above) so the
    // error listener is guaranteed to be attached before loading starts —
    // otherwise a fast/cached 404 could fire before we're listening.
    setImageWithFallback(
        card.querySelector('.project-card__logo'),
        data.logo,
        data.fallbackLogo || data.logo,
        '',
    );

    return card;
}

// Grids that re-render on every interaction (search/filter changes on
// projects.html) call revealProjectCardsOnScroll again each time with a
// fresh batch of cards. Without tracking the previous observer per grid, the
// old one is never disconnected — it keeps holding a strong reference to
// cards already wiped from the DOM, a growing leak across a single session
// of searching/filtering. Keyed by container, so unrelated grids (e.g.
// Related Projects on project.html) each keep their own observer.
const gridObservers = new WeakMap();

/**
 * Fades/slides cards in as they scroll into view. Pass the cards you just
 * rendered and the grid container they live in, so a re-render for the same
 * container disconnects its previous observer first.
 */
export function revealProjectCardsOnScroll(cards, container){
    if (container) {
        gridObservers.get(container)?.disconnect();
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    if (container) gridObservers.set(container, observer);

    cards.forEach(card => observer.observe(card));
}
