/**
 * Envizon Studio - Projects page: Brand logo grid (paginated)
 * Renders project cards (same .brand-card markup/CSS as the featured-brands
 * grid) from data, 8 at a time, with Prev/Next pagination controls.
 */

const PAGE_SIZE = 8;

const logos = [
    { title: 'Zuddle', image: 'assets/images/work/logos/zuddle-cursor.png', bgColor: '#080337', accentColor: '#FF6B6B', tags: ['Product Design', 'Web App'], url: 'project.html' },
    { title: 'Zuddle', image: 'assets/images/work/logos/zuddle-m.png', bgColor: '#1e1618', accentColor: '#E85C48', tags: ['Brand Identity', 'Iconography'], url: 'project.html' },
    { title: 'Poly AI', image: 'assets/images/work/logos/polyai-arrow.png', bgColor: '#ffd019', accentColor: '#1a1a1a', tags: ['AI Platform', 'Design System'], url: 'project.html' },
    { title: 'Poly AI', image: 'assets/images/work/logos/polyai-bowl.png', bgColor: '#9f4aed', accentColor: '#F3E8FF', tags: ['Product Design', 'Motion'], url: 'project.html' },
    { title: 'Zuddle', image: 'assets/images/work/logos/zuddle-cursor.png', bgColor: '#080337', accentColor: '#FF6B6B', tags: ['Interaction Design', 'Prototyping'], url: 'project.html' },
    { title: 'Zuddle', image: 'assets/images/work/logos/zuddle-m.png', bgColor: '#1e1618', accentColor: '#E85C48', tags: ['Rebranding', 'Web Design'], url: 'project.html' },
    { title: 'Poly AI', image: 'assets/images/work/logos/polyai-arrow.png', bgColor: '#ffd019', accentColor: '#1a1a1a', tags: ['Data Visualization', 'Platform UX'], url: 'project.html' },
    { title: 'Poly AI', image: 'assets/images/work/logos/polyai-bowl.png', bgColor: '#9f4aed', accentColor: '#F3E8FF', tags: ['Brand Identity', 'Packaging'], url: 'project.html' },
    { title: 'Zuddle', image: 'assets/images/work/logos/zuddle-cursor.png', bgColor: '#080337', accentColor: '#FF6B6B', tags: ['Strategy', 'Web App'], url: 'project.html' },
    { title: 'Zuddle', image: 'assets/images/work/logos/zuddle-m.png', bgColor: '#1e1618', accentColor: '#E85C48', tags: ['Visual Identity', 'Iconography'], url: 'project.html' },
    { title: 'Poly AI', image: 'assets/images/work/logos/polyai-arrow.png', bgColor: '#ffd019', accentColor: '#1a1a1a', tags: ['AI Platform', 'Product Design'], url: 'project.html' },
    { title: 'Poly AI', image: 'assets/images/work/logos/polyai-bowl.png', bgColor: '#9f4aed', accentColor: '#F3E8FF', tags: ['Design System', 'Motion'], url: 'project.html' },
    { title: 'Zuddle', image: 'assets/images/work/logos/zuddle-cursor.png', bgColor: '#080337', accentColor: '#FF6B6B', tags: ['Product Design', 'Onboarding'], url: 'project.html' },
    { title: 'Zuddle', image: 'assets/images/work/logos/zuddle-m.png', bgColor: '#1e1618', accentColor: '#E85C48', tags: ['Brand Identity', 'Web Design'], url: 'project.html' },
    { title: 'Poly AI', image: 'assets/images/work/logos/polyai-arrow.png', bgColor: '#ffd019', accentColor: '#1a1a1a', tags: ['Platform UX', 'Design System'], url: 'project.html' },
    { title: 'Poly AI', image: 'assets/images/work/logos/polyai-bowl.png', bgColor: '#9f4aed', accentColor: '#F3E8FF', tags: ['Motion', 'Product Design'], url: 'project.html' }
];

function renderCard(item){
    const card = document.createElement('a');
    card.className = 'brand-card';
    card.href = item.url;
    card.setAttribute('aria-label', `View ${item.title} case study`);
    card.style.setProperty('--card-bg', item.bgColor);
    card.style.setProperty('--card-accent', item.accentColor);

    const tagsMarkup = item.tags.map(tag => `<li class="brand-card__tag">${tag}</li>`).join('');

    card.innerHTML = `
        <span class="brand-card__media">
            <img src="${item.image}" alt="" loading="lazy" decoding="async">
        </span>
        <span class="brand-card__frame" aria-hidden="true"></span>
        <span class="brand-card__panel">
            <h3 class="brand-card__name">${item.title}</h3>
            <ul class="brand-card__tags">${tagsMarkup}</ul>
        </span>
    `;

    return card;
}

export function initProjectsLogoGrid(root = '#projectsLogoGrid'){
    const grid = document.querySelector(root);
    if (!grid) return;

    const section = grid.closest('.projects-logo-grid');
    const prevBtn = section.querySelector('[data-dir="prev"]');
    const nextBtn = section.querySelector('[data-dir="next"]');
    const currentEl = section.querySelector('.projects-logo-grid__page-current');
    const totalEl = section.querySelector('.projects-logo-grid__page-total');

    const totalPages = Math.max(1, Math.ceil(logos.length / PAGE_SIZE));
    let page = 0;

    if (totalEl) totalEl.textContent = totalPages;

    function renderPage(){
        grid.innerHTML = '';
        const start = page * PAGE_SIZE;
        const pageItems = logos.slice(start, start + PAGE_SIZE);

        const fragment = document.createDocumentFragment();
        pageItems.forEach(item => fragment.appendChild(renderCard(item)));
        grid.appendChild(fragment);

        requestAnimationFrame(() => {
            grid.querySelectorAll('.brand-card').forEach((card, i) => {
                card.style.transitionDelay = `${(i % PAGE_SIZE) * 40}ms`;
                requestAnimationFrame(() => card.classList.add('is-visible'));
            });
        });

        if (currentEl) currentEl.textContent = page + 1;
        if (prevBtn) prevBtn.disabled = page === 0;
        if (nextBtn) nextBtn.disabled = page >= totalPages - 1;
    }

    if (prevBtn){
        prevBtn.addEventListener('click', () => {
            if (page === 0) return;
            page -= 1;
            renderPage();
            grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    if (nextBtn){
        nextBtn.addEventListener('click', () => {
            if (page >= totalPages - 1) return;
            page += 1;
            renderPage();
            grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    renderPage();
}
