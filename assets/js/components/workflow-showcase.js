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

    let hasInteracted = false;

    // AI toggle dark mode handling
    const toggle = section.querySelector('.workflow-showcase__toggle');
    if (toggle) {
        toggle.setAttribute('tabindex', '0');
        toggle.setAttribute('role', 'button');

        const handleToggle = () => {
            hasInteracted = true;
            section.classList.toggle('workflow-showcase--dark');
            const isDark = section.classList.contains('workflow-showcase--dark');
            toggle.setAttribute('aria-label', isDark ? "AI tools enabled (Dark Mode)" : "AI tools enabled");
        };

        toggle.addEventListener('click', handleToggle);
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
            }
        });
    }

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

            // Trigger a visual hint to show the button is interactive if user hasn't clicked it yet
            if (toggle) {
                setTimeout(() => {
                    if (hasInteracted) return;
                    section.classList.add('workflow-showcase--dark');
                    toggle.setAttribute('aria-label', "AI tools enabled (Dark Mode)");

                    setTimeout(() => {
                        if (hasInteracted) return;
                        section.classList.remove('workflow-showcase--dark');
                        toggle.setAttribute('aria-label', "AI tools enabled");
                    }, 1200);
                }, 1000);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -80px 0px'
    });

    observer.observe(container);
}
