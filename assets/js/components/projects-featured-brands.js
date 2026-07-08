/**
 * Envizon Studio - Projects page: Featured brands grid
 * Renders project cards from data, then reveals them on scroll
 * (fade-up, staggered via nth-child transition-delay in the CSS).
 * Tag list + accent border are revealed via CSS on hover/focus —
 * no JS is needed for that part of the interaction.
 */

const brands = [
    {
        title: 'Popl',
        image: 'assets/images/work/logos/popl.png',
        bgColor: 'linear-gradient(180deg, #2b1214 0%, #6b1f2b 100%)',
        accentColor: '#F4A825',
        tags: ['Strategy', 'Visual Identity', 'Web Design'],
        url: '#'
    },
    {
        title: 'Zuddle',
        image: 'assets/images/work/logos/zuddle-mark.png',
        bgColor: '#0d3025',
        accentColor: '#2DD4BF',
        tags: ['Brand Identity', 'Product Design', 'Web App'],
        url: '#'
    },
    {
        title: 'Poly AI',
        image: 'assets/images/work/logos/polyai-wordmark.png',
        bgColor: '#141414',
        accentColor: '#D6F84C',
        tags: ['AI Platform', 'Design System', 'Product Design'],
        url: '#'
    },
    {
        title: 'Marketo',
        image: 'assets/images/work/logos/marketo.png',
        bgColor: '#583fb2',
        accentColor: '#C4B5FD',
        tags: ['Marketing Automation', 'Rebranding', 'Web Design'],
        url: '#'
    },
    {
        title: 'Zuddle',
        image: 'assets/images/work/logos/zuddle-arrow.png',
        bgColor: '#f4f2ee',
        accentColor: '#1a1a1a',
        tags: ['Interaction Design', 'Iconography', 'Brand System'],
        url: '#'
    },
    {
        title: 'Poly AI',
        image: 'assets/images/work/logos/polyai-leaf.png',
        bgColor: '#deeceb',
        accentColor: '#0B4F4A',
        tags: ['Data Visualization', 'Platform UX', 'Product Design'],
        url: '#'
    }
];

function renderCard(brand){
    const card = document.createElement('a');
    card.className = 'brand-card';
    card.href = brand.url;
    card.setAttribute('aria-label', `View ${brand.title} case study`);
    card.style.setProperty('--card-bg', brand.bgColor);
    card.style.setProperty('--card-accent', brand.accentColor);

    const tagsMarkup = brand.tags.map(tag => `<li class="brand-card__tag">${tag}</li>`).join('');

    card.innerHTML = `
        <span class="brand-card__media">
            <img src="${brand.image}" alt="" loading="lazy" decoding="async">
        </span>
        <span class="brand-card__frame" aria-hidden="true"></span>
        <span class="brand-card__panel">
            <h3 class="brand-card__name">${brand.title}</h3>
            <ul class="brand-card__tags">${tagsMarkup}</ul>
        </span>
    `;

    return card;
}

function revealOnScroll(cards){
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    cards.forEach(card => observer.observe(card));
}

export function initProjectsFeaturedBrands(root = '#projectsFeaturedBrandsGrid'){
    const grid = document.querySelector(root);
    if (!grid) return;

    const fragment = document.createDocumentFragment();
    brands.forEach(brand => fragment.appendChild(renderCard(brand)));
    grid.appendChild(fragment);

    revealOnScroll(Array.from(grid.querySelectorAll('.brand-card')));
}
