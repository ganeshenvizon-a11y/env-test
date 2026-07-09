/**
 * Envizon Studio - About Page: Communication section
 * Switches the active pill and its matching feature panel (same layout,
 * swappable content/graphic per tab).
 */

export function initAboutCommunication(root = '.about-communication') {
    const section = document.querySelector(root);
    if (!section) return;

    const tabs = Array.from(section.querySelectorAll('.pill-item'));
    const panels = Array.from(section.querySelectorAll('.feature-panel'));

    if (!tabs.length || !panels.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            const currentActivePanel = panels.find(p => p.classList.contains('is-active'));
            const nextActivePanel = panels.find(p => p.dataset.panel === target);

            if (currentActivePanel === nextActivePanel) return;

            tabs.forEach(t => {
                const isActive = t === tab;
                t.classList.toggle('is-active', isActive);
                t.setAttribute('aria-selected', String(isActive));
            });

            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const gsap = window.gsap;

            if (gsap && !prefersReducedMotion && currentActivePanel && nextActivePanel) {
                gsap.killTweensOf(panels);

                // Phase 1: Animate current active panel out
                gsap.to(currentActivePanel, {
                    opacity: 0,
                    y: 15,
                    scale: 0.97,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: () => {
                        currentActivePanel.classList.remove('is-active');
                        currentActivePanel.hidden = true;

                        // Phase 2: Setup next panel and animate in
                        nextActivePanel.hidden = false;
                        nextActivePanel.classList.add('is-active');
                        
                        gsap.fromTo(nextActivePanel,
                            { opacity: 0, y: -15, scale: 0.97 },
                            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }
                        );
                    }
                });
            } else {
                // Fallback direct toggle without animation
                panels.forEach(panel => {
                    const isActive = panel === nextActivePanel;
                    panel.classList.toggle('is-active', isActive);
                    panel.hidden = !isActive;
                    if (isActive) {
                        panel.style.opacity = '1';
                        panel.style.transform = 'none';
                    }
                });
            }
        });
    });
}
