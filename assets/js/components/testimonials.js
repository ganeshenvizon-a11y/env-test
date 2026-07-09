/**
 * Envizon Studio - Testimonials mobile nav
 * Prev/next buttons scroll the single-card testimonial carousel by one card.
 */

export function initTestimonials(selector = '.testimonials') {
    const section = document.querySelector(selector);
    if (!section) return;

    const grid = section.querySelector('.testimonials__grid');
    const prevBtn = section.querySelector('.testimonials__nav-btn--prev');
    const nextBtn = section.querySelector('.testimonials__nav-btn--next');
    if (!grid || !prevBtn || !nextBtn) return;

    const scrollByCard = (direction) => {
        const card = grid.querySelector('.testimonial-card');
        const amount = card ? card.getBoundingClientRect().width : grid.clientWidth;
        grid.scrollBy({ left: amount * direction, behavior: 'smooth' });
    };

    prevBtn.addEventListener('click', () => scrollByCard(-1));
    nextBtn.addEventListener('click', () => scrollByCard(1));
}
