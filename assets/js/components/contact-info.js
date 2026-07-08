/**
 * Envizon Studio - Contact Page: Info cards
 * Viewport-reveal only: each card fades/slides up once it enters view,
 * staggered via the nth-child transition-delay in contact-info.css.
 */

export function initContactInfo(root = '.contact-info') {
    const section = document.querySelector(root);
    if (!section) return;

    const cards = Array.from(section.querySelectorAll('.contact-info-card'));
    if (!cards.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        cards.forEach(card => card.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    cards.forEach(card => observer.observe(card));
}
