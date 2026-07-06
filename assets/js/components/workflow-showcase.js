/**
 * Envizon Studio - Workflow showcase (Better Tools / Smooth Workflow / AI Tools)
 * Reveals the heading + floating cards together on scroll via IntersectionObserver.
 * The cards' idle bob is a pure CSS loop (see workflow-showcase.css) and runs
 * independently of this observer once the section is visible.
 */
export function initWorkflowShowcase(selector = '.workflow-showcase') {
    const section = document.querySelector(selector);
    if (!section) return;

    const container = section.querySelector('.workflow-showcase__container');
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        container.classList.add('is-visible');
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            container.classList.add('is-visible');
            obs.unobserve(entry.target);
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -80px 0px'
    });

    observer.observe(container);
}
