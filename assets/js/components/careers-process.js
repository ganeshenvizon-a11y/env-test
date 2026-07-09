/**
 * Envizon Studio - Careers Page: Selection process steps
 * Viewport-reveal only: each step fades/slides up once it enters view,
 * staggered via the nth-child transition-delay in careers-process.css.
 */

export function initCareersProcess(root = '.careers-process') {
    const section = document.querySelector(root);
    if (!section) return;

    const steps = Array.from(section.querySelectorAll('.process-step'));
    if (!steps.length) return;

    // Skip IntersectionObserver if GSAP is available to prevent transition conflicts
    if (window.gsap && window.ScrollTrigger) {
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        steps.forEach(step => step.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    steps.forEach(step => observer.observe(step));
}
