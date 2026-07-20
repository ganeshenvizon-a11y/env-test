/**
 * Envizon Studio - About Page: Process showcase (Discovery / Design / Development)
 *
 * Desktop (>860px): clicking an inactive item promotes it into the fixed
 * 528x183 active card; the previously active item drops back into the
 * inactive list. The two media wrappers (left/center) never move or resize —
 * only their image src and a opacity/translateX crossfade change.
 *
 * Mobile/tablet (<=860px): a separate accordion renders all items in a fixed
 * order. Each item stays in its own position — tapping one expands its
 * description + image directly beneath itself, in place, instead of
 * promoting content up into a shared slot elsewhere on the page.
 */

const SWITCH_MS = 175;

const ICONS = {
    discovery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    design: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
    development: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9l-5 3 5 3M16 9l5 3-5 3M13 5l-2 14"/></svg>'
};

const FEATURES = [
    {
        key: 'discovery',
        title: 'Discovery',
        desc: "We understand before we strategize. Stakeholder conversations, user context, competitive reality — all mapped before a single direction is proposed.",
        cta: 'Book A Discovery Call',
        left: 'assets/images/port11.png',
        center: 'assets/images/port11.png'
    },
    {
        key: 'design',
        title: 'Design',
        desc: 'We pitch real options grounded in your strategy, refine relentlessly, and hand off work built to perform — not just to look good in a deck.',
        cta: 'Book A Design Call',
        left: 'assets/images/port11.png',
        center: 'assets/images/port12.png'
    },
    {
        key: 'development',
        title: 'Development',
        desc: 'We build fast, resilient front ends that hold up under real traffic, with clean architecture and rigorous QA at every sprint.',
        cta: 'Book A Development Call',
        left: 'assets/images/port11.png',
        center: 'assets/images/port11.png'
    }
];

export function initAboutProcessShowcase(root = '.about-discovery') {
    const section = document.querySelector(root);
    if (!section) return;

    const card = section.querySelector('.discovery-card');
    const list = section.querySelector('.discovery-list');
    const leftWrap = section.querySelector('.discovery-media__wrap--left');
    const centerWrap = section.querySelector('.discovery-media__wrap--center');
    const accordion = section.querySelector('.discovery-accordion');
    if (!card || !list || !leftWrap || !centerWrap || !accordion) return;

    const leftImg = leftWrap.querySelector('img');
    const centerImg = centerWrap.querySelector('img');

    let activeKey = card.dataset.active || FEATURES[0].key;
    let isAnimating = false;

    function renderCard(feature) {
        card.innerHTML = `
            <span class="discovery-card__icon" aria-hidden="true">${ICONS[feature.key] || ''}</span>
            <div class="discovery-card__body">
                <h3 class="discovery-card__title">${feature.title}</h3>
                <p class="discovery-card__desc">${feature.desc}</p>
                <a href="#" class="discovery-card__cta">${feature.cta} <span aria-hidden="true">↗</span></a>
            </div>
        `;
        card.dataset.active = feature.key;
    }

    function renderList() {
        const inactive = FEATURES.filter(f => f.key !== activeKey);

        list.innerHTML = inactive.map(f => `
            <li>
                <button type="button"
                        class="discovery-item"
                        role="tab"
                        data-key="${f.key}"
                        aria-selected="false"
                        aria-controls="discovery-active-panel"
                        tabindex="0">
                    <span class="discovery-item__title">${f.title}</span>
                    <span class="discovery-item__desc">${f.desc}</span>
                </button>
            </li>
        `).join('');

        const buttons = Array.from(list.querySelectorAll('.discovery-item'));
        buttons.forEach(btn => {
            btn.addEventListener('click', () => switchTo(btn.dataset.key));
            requestAnimationFrame(() => btn.classList.add('is-visible'));
        });
    }

    function renderAccordion() {
        accordion.innerHTML = FEATURES.map(f => {
            const isOpen = f.key === activeKey;
            return `
                <div class="discovery-accordion__item${isOpen ? ' is-open' : ''}" data-key="${f.key}">
                    <button type="button"
                            class="discovery-accordion__header"
                            aria-expanded="${isOpen}"
                            aria-controls="discovery-panel-${f.key}"
                            id="discovery-header-${f.key}">
                        <span class="discovery-accordion__icon" aria-hidden="true">${ICONS[f.key] || ''}</span>
                        <span class="discovery-accordion__title">${f.title}</span>
                        <span class="discovery-accordion__chevron" aria-hidden="true">⌄</span>
                    </button>
                    <div class="discovery-accordion__panel"
                         id="discovery-panel-${f.key}"
                         role="region"
                         aria-labelledby="discovery-header-${f.key}">
                        <div class="discovery-accordion__panel-inner">
                            <p class="discovery-accordion__desc">${f.desc}</p>
                            <div class="discovery-accordion__media">
                                <div class="discovery-media__wrap discovery-media__wrap--left">
                                    <img src="${f.left}" alt="${f.title} process visual" loading="lazy">
                                </div>
                                <div class="discovery-media__wrap discovery-media__wrap--center">
                                    <img src="${f.center}" alt="${f.title} process visual" loading="lazy">
                                </div>
                            </div>
                            <a href="#" class="discovery-accordion__cta">${f.cta} <span aria-hidden="true">↗</span></a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        Array.from(accordion.querySelectorAll('.discovery-accordion__header')).forEach(btn => {
            btn.addEventListener('click', () => switchTo(btn.closest('.discovery-accordion__item').dataset.key));
        });
    }

    function switchTo(key) {
        if (isAnimating || key === activeKey) return;
        const feature = FEATURES.find(f => f.key === key);
        if (!feature) return;

        isAnimating = true;

        card.classList.add('is-switching');
        leftWrap.classList.add('is-switching');
        centerWrap.classList.add('is-switching');

        setTimeout(() => {
            activeKey = key;
            renderCard(feature);
            renderList();
            renderAccordion();
            leftImg.src = feature.left;
            leftImg.alt = `${feature.title} process visual`;
            centerImg.src = feature.center;
            centerImg.alt = `${feature.title} process visual`;

            card.classList.remove('is-switching');
            leftWrap.classList.remove('is-switching');
            centerWrap.classList.remove('is-switching');
            isAnimating = false;
        }, SWITCH_MS);
    }

    card.id = 'discovery-active-panel';
    card.setAttribute('role', 'tabpanel');

    const initial = FEATURES.find(f => f.key === activeKey) || FEATURES[0];
    renderCard(initial);
    leftImg.src = initial.left;
    leftImg.alt = `${initial.title} process visual`;
    centerImg.src = initial.center;
    centerImg.alt = `${initial.title} process visual`;
    renderList();
    renderAccordion();
}
