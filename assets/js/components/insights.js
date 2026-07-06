/**
 * Envizon Studio - Insights / blog cards
 * Reveals each card on scroll via IntersectionObserver, staggering the
 * animation delay per card so they cascade in rather than pop together.
 */

export function initInsights(selector = '.insights') {
    const section = document.querySelector(selector);
    if (!section) return;

    const cards = Array.from(section.querySelectorAll('.insight-card'));
    if (!cards.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        cards.forEach(card => card.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const card = entry.target;
            const index = cards.indexOf(card);
            card.style.animationDelay = `${index * 100}ms`;
            card.classList.add('is-visible');
            obs.unobserve(card);
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    });

    cards.forEach(card => observer.observe(card));
}
