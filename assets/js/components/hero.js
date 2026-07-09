/**
 * Envizon Studio - Hero
 * Masked word entrance for the headline, a slow spinning/glowing accent
 * on the "o" in Innovation, and a scroll-driven parallax on the hero backdrop.
 */

export function initHeroAnimations() {
    if (typeof gsap === 'undefined') return;

    const words = gsap.utils.toArray('.hero-title__word');
    const bg = document.querySelector('.hero-bg');
    const heroSection = document.querySelector('.hero');
    const oIcon = document.querySelector('.innovation-o');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Entrance: headline mask reveal, then subhead/buttons rise in ---
    if (reduceMotion) {
        gsap.set(words, { opacity: 1, yPercent: 0 });
    } else {
        gsap.set(words, { yPercent: 115, opacity: 0 });
        // starting state for the subhead + buttons, set up front — animated via
        // `.to()` below rather than `.from()`, which never advances past its
        // first frame on this project's GSAP build when used inside a timeline.
        gsap.set('.hero-content > p', { y: 24, opacity: 0 });
        gsap.set('.hero-buttons .btn', { scale: 0.6, opacity: 0 });

        gsap.timeline({ delay: 0.15, defaults: { ease: 'power4.out' } })
            .to(words, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.06 })
            .to('.hero-content > p', { y: 0, opacity: 1, duration: .7, clearProps: 'transform' }, '-=0.55')
            // buttons "pop" in individually (scale + opacity, back-out overshoot)
            // rather than rising as one block with the rest of the copy
            .to('.hero-buttons .btn', {
                scale: 1,
                opacity: 1,
                duration: .6,
                stagger: 0.12,
                ease: 'back.out(2.2)',
                clearProps: 'transform'
            }, '-=0.4');
    }

    // --- Innovation "o": slow spin + subtle glow/scale pulse, forever ---
    if (oIcon && !reduceMotion) {
        gsap.to(oIcon, {
            rotation: 360,
            duration: 9,
            repeat: -1,
            ease: 'none',
            transformOrigin: '50% 50%'
        });

        gsap.to(oIcon, {
            scale: 1.12,
            filter: 'drop-shadow(0 0 10px rgba(250,179,48,.65))',
            duration: 1.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    // --- Parallax on the hero background image (translate + zoom in/out) ---
    if (bg && heroSection && !reduceMotion && typeof ScrollTrigger !== 'undefined') {
        gsap.fromTo(bg,
            { yPercent: 0, scale: 1.15 },
            {
                yPercent: 15,
                scale: 1.35,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroSection,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            }
        );
    }
}
