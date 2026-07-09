/**
 * Envizon Studio - About Page: Process cards
 * Viewport-reveal only: each card fades/slides up once it enters view,
 * staggered via the nth-child transition-delay in about-process.css.
 */

export function initAboutProcess(root = '.about-process') {
    const section = document.querySelector(root);
    if (!section) return;

    const cards = Array.from(section.querySelectorAll('.process-card'));
    if (!cards.length) return;

    // Skip IntersectionObserver if GSAP is available to prevent transition conflicts
    if (window.gsap && window.ScrollTrigger) {
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
