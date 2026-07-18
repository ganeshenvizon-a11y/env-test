/**
 * Envizon Studio - Lenis Smooth Scroll Setup and GSAP Integration
 */

export function initLenis() {
    // Prevent duplicate initialization
    if (window.lenis) {
        return window.lenis;
    }

    const Lenis = window.Lenis;
    if (!Lenis) {
        console.warn("Lenis library is missing. Make sure the CDN script is included.");
        return null;
    }

    // Initialize Lenis
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo easing (snappy then smooth)
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    window.lenis = lenis;

    // Sync with GSAP ScrollTrigger if both are loaded
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (gsap && ScrollTrigger) {
        // Register ScrollTrigger to be safe
        gsap.registerPlugin(ScrollTrigger);

        // Tell ScrollTrigger to use Lenis's scroll values
        lenis.on('scroll', ScrollTrigger.update);

        // Feed Lenis raf time into GSAP ticker
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        // Disable GSAP lag smoothing to keep GSAP ticker and Lenis in sync
        gsap.ticker.lagSmoothing(0);

        // Refresh ScrollTrigger and Lenis boundaries on refresh
        ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    } else {
        // Fallback standard requestAnimationFrame loop if GSAP isn't on this page
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // Smooth scroll for hash anchors (internal links)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                lenis.scrollTo(targetEl, {
                    offset: 0,
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // Observe body class list to automatically stop/start scroll on overlays/navigation open
    const scrollLockObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const bodyClasses = document.body.classList;
                const shouldLock = bodyClasses.contains('nav-open') || 
                                   bodyClasses.contains('contact-popup-open');
                if (shouldLock) {
                    lenis.stop();
                } else {
                    lenis.start();
                }
            }
        });
    });

    scrollLockObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return lenis;
}
