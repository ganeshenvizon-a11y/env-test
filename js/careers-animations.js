/**
 * Envizon Studio - Careers Page GSAP Animations Controller
 * Drive elegant, high-end agency transitions and micro-interactions.
 * Must run after the DOM-injected sections (job cards) have been
 * rendered so ScrollTrigger/GSAP selectors can find them.
 */

export function initCareersAnimations() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) {
        console.warn("GSAP or ScrollTrigger libraries are missing. Animations disabled.");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Standardised scroll-reveal duration (1.5 s across all pages)
    const REVEAL = 0.7;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        gsap.set('.careers-hero__title, .careers-hero__text, .careers-benefits__header, .benefit-card, .careers-openings__header, .job-card, .careers-process__header, .process-step, .careers-form-panel, .careers-form', { opacity: 1 });
        return;
    }

    // ----------------------------------------------------
    // 1. Header Animations
    // ----------------------------------------------------
    const runHeaderAnimations = () => {
        const header = document.querySelector('header.header');
        if (!header) return;

        const navbar = header.querySelector('.navbar');
        if (!navbar) return;

        gsap.fromTo(navbar,
            { y: -80, opacity: 0 },
            { y: 0, opacity: 1, duration: REVEAL, ease: 'power3.out' }
        );

        const allLinks = header.querySelectorAll('.nav-links a, .mobile-nav-links a');
        allLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                gsap.to(link, { letterSpacing: '0.04em', duration: 0.25, ease: 'power2.out' });
            });
            link.addEventListener('mouseleave', () => {
                gsap.to(link, { letterSpacing: '0em', duration: 0.25, ease: 'power2.out' });
            });
        });

        const ctaBtn = header.querySelector('.header-btn');
        if (ctaBtn) {
            const arrow = ctaBtn.querySelector('span');
            if (arrow) arrow.classList.add('btn-arrow-nudge');
        }
    };

    const headerPlaceholder = document.querySelector('header.header');
    if (headerPlaceholder && headerPlaceholder.dataset.loaded === 'true') {
        runHeaderAnimations();
    } else {
        document.addEventListener('headerLoaded', runHeaderAnimations);
    }

    // ----------------------------------------------------
    // 2. Hero Section
    // ----------------------------------------------------
    const heroTl = gsap.timeline();

    heroTl.fromTo('.careers-hero__title .title-line-inner',
        { yPercent: 100 },
        { yPercent: 0, duration: REVEAL, stagger: 0.15, ease: 'power4.out' }
    );

    gsap.set('.careers-hero__title', { opacity: 1 });

    heroTl.fromTo('.careers-hero__text',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: REVEAL, ease: 'power3.out' },
        '-=0.75'
    );

    // ----------------------------------------------------
    // 3. Benefits Section
    // ----------------------------------------------------
    gsap.fromTo('.careers-benefits__header',
        { y: 30, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: REVEAL,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.careers-benefits', start: 'top 85%' }
        }
    );

    gsap.fromTo('.benefit-card',
        { y: 40, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: REVEAL,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.careers-benefits__grid', start: 'top 85%' }
        }
    );

    document.querySelectorAll('.benefit-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -6, duration: 0.35, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, duration: 0.35, ease: 'power2.out' });
        });
    });

    // ----------------------------------------------------
    // 4. Open Positions Section
    // ----------------------------------------------------
    gsap.fromTo('.careers-openings__header',
        { y: 30, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: REVEAL,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.careers-openings', start: 'top 85%' }
        }
    );

    gsap.fromTo('.job-card',
        { y: 40, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: REVEAL,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.careers-openings__grid', start: 'top 85%' }
        }
    );

    document.querySelectorAll('.job-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -6, duration: 0.35, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, duration: 0.35, ease: 'power2.out' });
        });
    });

    // ----------------------------------------------------
    // 5. Selection Process Section
    // ----------------------------------------------------
    gsap.fromTo('.careers-process__header',
        { y: 30, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: REVEAL,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.careers-process', start: 'top 85%' }
        }
    );

    gsap.fromTo('.process-step',
        { y: 40, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: REVEAL,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.careers-process__grid', start: 'top 85%' }
        }
    );

    // ----------------------------------------------------
    // 6. Application Form Section
    // ----------------------------------------------------
    const formTl = gsap.timeline({
        scrollTrigger: { trigger: '.careers-form-section', start: 'top 80%' }
    });

    formTl.fromTo('.careers-form-panel',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: REVEAL, ease: 'power3.out' }
    );

    formTl.fromTo('.careers-form',
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: REVEAL, ease: 'power3.out' },
        '-=0.8'
    );

    formTl.fromTo('.careers-form-panel__point',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: REVEAL, stagger: 0.1, ease: 'power2.out' },
        '-=0.4'
    );

    // ----------------------------------------------------
    // 7. Footer soft stagger-in ScrollTrigger
    // ----------------------------------------------------
    const runFooterAnimations = () => {
        const footer = document.querySelector('footer.footer');
        if (!footer) return;

        const brand = footer.querySelector('.footer-brand');
        const cols = Array.from(footer.querySelectorAll('.footer-navigation-grid > div'));
        const bottomLine = footer.querySelector('.horizontalborder');

        const elements = [];
        if (brand) elements.push(brand);
        elements.push(...cols);
        if (bottomLine) elements.push(bottomLine);

        gsap.fromTo(elements,
            { y: 25, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: REVEAL,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: { trigger: footer, start: 'top 95%' }
            }
        );
    };

    const footerPlaceholder = document.querySelector('footer.footer');
    if (footerPlaceholder && footerPlaceholder.dataset.loaded === 'true') {
        runFooterAnimations();
    } else {
        document.addEventListener('footerLoaded', runFooterAnimations);
    }
}
