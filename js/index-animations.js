/**
 * Envizon Studio - Homepage GSAP Animations Controller
 * Drive elegant, high-end agency transitions and micro-interactions
 */

export function initIndexAnimations() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) {
        console.warn("GSAP or ScrollTrigger libraries are missing. Animations disabled.");
        return;
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Respect user preferences for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        // Force opacity on all initial state classes
        gsap.set('.hero-title, .hero-content p, .hero-buttons, .carousel-section, .workflow-showcase__card, .workflow-showcase__heading, .craft-header__title, .craft-header__text, .craft-header__cta, .stats-highlight__title, .stats-highlight__text, .stats-highlight__card, .integrations__title, .integrations__subtitle, .integrations__item, .how-we-work__title, .how-we-work__text, .how-we-work__cta, .stage-card, .testimonials__title, .testimonials__text, .testimonial-card, .faq__title, .faq-item, .insights__container, .insights__header, .insight-card', { opacity: 1 });
        return;
    }

    // ----------------------------------------------------
    // 1. Header Animations (Slide down on dynamic loaded event)
    // ----------------------------------------------------
    const runHeaderAnimations = () => {
        const header = document.querySelector('header.header');
        if (!header) return;

        const navbar = header.querySelector('.navbar');
        if (!navbar) return;

        // Slide down navbar from top
        gsap.fromTo(navbar,
            { y: -80, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
        );

        // Link hover effect: add classes/transitions using Javascript
        const allLinks = header.querySelectorAll('.nav-links a, .mobile-nav-links a');
        allLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                gsap.to(link, { letterSpacing: '0.04em', duration: 0.25, ease: 'power2.out' });
            });
            link.addEventListener('mouseleave', () => {
                gsap.to(link, { letterSpacing: '0em', duration: 0.25, ease: 'power2.out' });
            });
        });

        // CTA Arrow nudge
        const ctaBtn = header.querySelector('.header-btn');
        if (ctaBtn) {
            const arrow = ctaBtn.querySelector('span');
            if (arrow) {
                arrow.classList.add('btn-arrow-nudge');
            }
        }
    };

    // If header is already loaded, animate immediately; otherwise wait for custom loaded event
    const headerPlaceholder = document.querySelector('header.header');
    if (headerPlaceholder && headerPlaceholder.dataset.loaded === 'true') {
        runHeaderAnimations();
    } else {
        document.addEventListener('headerLoaded', runHeaderAnimations);
    }

    // ----------------------------------------------------
    // 2. Hero Section Animations
    // ----------------------------------------------------
    const heroTl = gsap.timeline();

    // Line-by-line reveal
    heroTl.fromTo('.hero-title .title-line-inner',
        { yPercent: 100 },
        { yPercent: 0, duration: 1.1, stagger: 0.15, ease: 'power4.out' }
    );

    // Make title visible
    gsap.set('.hero-title', { opacity: 1 });

    // Paragraph fade-up
    heroTl.fromTo('.hero-content p',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
        '-=0.75'
    );

    // Hero buttons scale up
    heroTl.fromTo('.hero-buttons',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
        '-=0.6'
    );

    // Carousel section reveal
    heroTl.fromTo('.carousel-section',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
        '-=0.5'
    );

    // ----------------------------------------------------
    // 3. Workflow Showcase (Floating AI Tools) ScrollTrigger
    // ----------------------------------------------------
    const workflowTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.workflow-showcase',
            start: 'top 80%'
        }
    });

    // Animate heading reveal
    workflowTl.fromTo('.workflow-showcase__heading .title-line-inner',
        { yPercent: 100 },
        { yPercent: 0, duration: 1.0, stagger: 0.12, ease: 'power3.out' }
    );

    gsap.set('.workflow-showcase__heading', { opacity: 1 });

    // Stagger float cards scale in
    workflowTl.fromTo('.workflow-showcase__card',
        { scale: 0.85, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'back.out(1.5)' },
        '-=0.6'
    );

    // ----------------------------------------------------
    // 4. Craft Header ScrollTrigger
    // ----------------------------------------------------
    const craftTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.craft-header',
            start: 'top 80%'
        }
    });

    craftTl.fromTo('.craft-header__title .title-line-inner',
        { yPercent: 100 },
        { yPercent: 0, duration: 1.0, stagger: 0.12, ease: 'power3.out' }
    );

    gsap.set('.craft-header__title', { opacity: 1 });

    craftTl.fromTo('.craft-header__text',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.6'
    );

    craftTl.fromTo('.craft-header__cta',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' },
        '-=0.5'
    );

    // ----------------------------------------------------
    // 5. Stats Highlight ScrollTrigger
    // ----------------------------------------------------
    const statsTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.stats-highlight',
            start: 'top 80%'
        }
    });

    statsTl.fromTo('.stats-highlight__title .title-line-inner',
        { yPercent: 100 },
        { yPercent: 0, duration: 1.0, stagger: 0.12, ease: 'power3.out' }
    );

    gsap.set('.stats-highlight__title', { opacity: 1 });

    statsTl.fromTo('.stats-highlight__text',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.6'
    );

    statsTl.fromTo('.stats-highlight__card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' },
        '-=0.5'
    );

    const statsCards = document.querySelectorAll('.stats-highlight__card');
    statsCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -8, scale: 1.01, duration: 0.35, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, scale: 1, duration: 0.35, ease: 'power2.out' });
        });
    });

    // ----------------------------------------------------
    // 6. Integrations Section ScrollTrigger
    // ----------------------------------------------------
    const integrationsTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.integrations',
            start: 'top 80%'
        }
    });

    integrationsTl.fromTo('.integrations__title .title-line-inner',
        { yPercent: 100 },
        { yPercent: 0, duration: 1.0, stagger: 0.12, ease: 'power3.out' }
    );

    gsap.set('.integrations__title', { opacity: 1 });

    integrationsTl.fromTo('.integrations__subtitle',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.6'
    );

    integrationsTl.fromTo('.integrations__item',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.5)' },
        '-=0.5'
    );

    const integrationItems = document.querySelectorAll('.integrations__item');
    integrationItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, { y: -5, scale: 1.02, duration: 0.3, ease: 'power2.out' });
        });
        item.addEventListener('mouseleave', () => {
            gsap.to(item, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
        });
    });

    // ----------------------------------------------------
    // 7. How We Work ScrollTrigger
    // ----------------------------------------------------
    const howTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.how-we-work',
            start: 'top 80%'
        }
    });

    howTl.fromTo('.how-we-work__title .title-line-inner',
        { yPercent: 100 },
        { yPercent: 0, duration: 1.0, stagger: 0.12, ease: 'power3.out' }
    );

    gsap.set('.how-we-work__title', { opacity: 1 });

    howTl.fromTo('.how-we-work__text',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.6'
    );

    howTl.fromTo('.how-we-work__cta',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' },
        '-=0.5'
    );

    howTl.fromTo('.stage-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' },
        '-=0.4'
    );

    const stageCards = document.querySelectorAll('.stage-card');
    stageCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Apply hover animation if it is not currently the active card
            if (!card.classList.contains('is-active')) {
                gsap.to(card, { y: -8, duration: 0.35, ease: 'power2.out' });
            }
        });
        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('is-active')) {
                gsap.to(card, { y: 0, duration: 0.35, ease: 'power2.out' });
            }
        });
    });

    // ----------------------------------------------------
    // 8. Testimonials ScrollTrigger
    // ----------------------------------------------------
    const testTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.testimonials',
            start: 'top 80%'
        }
    });

    testTl.fromTo('.testimonials__title .title-line-inner',
        { yPercent: 100 },
        { yPercent: 0, duration: 1.0, stagger: 0.12, ease: 'power3.out' }
    );

    gsap.set('.testimonials__title', { opacity: 1 });

    testTl.fromTo('.testimonials__text',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.6'
    );

    testTl.fromTo('.testimonial-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' },
        '-=0.5'
    );

    const testCards = document.querySelectorAll('.testimonial-card');
    testCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -8, scale: 1.01, duration: 0.35, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, scale: 1, duration: 0.35, ease: 'power2.out' });
        });
    });

    // ----------------------------------------------------
    // 9. FAQ Section ScrollTrigger
    // ----------------------------------------------------
    const faqTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.faq',
            start: 'top 80%'
        }
    });

    faqTl.fromTo('.faq__title .title-line-inner',
        { yPercent: 100 },
        { yPercent: 0, duration: 1.0, stagger: 0.12, ease: 'power3.out' }
    );

    gsap.set('.faq__title', { opacity: 1 });

    faqTl.fromTo('.faq-item',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
        '-=0.5'
    );

    // ----------------------------------------------------
    // 10. Insights Section ScrollTrigger
    // ----------------------------------------------------
    gsap.fromTo('.insights__header',
        { y: 30, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.insights',
                start: 'top 85%'
            }
        }
    );

    gsap.fromTo('.insight-card',
        {
            opacity: 0,
            y: 60,
            clipPath: 'inset(100% 0% 0% 0%)'
        },
        {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.insights__container',
                start: 'top 80%'
            }
        }
    );

    gsap.set('.insights__container', { opacity: 1 });

    const insightCards = document.querySelectorAll('.insight-card');
    insightCards.forEach(card => {
        const img = card.querySelector('.insight-card__image');
        
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -8, duration: 0.35, ease: 'power2.out' });
            if (img) gsap.to(img, { scale: 1.04, duration: 0.35, ease: 'power2.out' });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, duration: 0.35, ease: 'power2.out' });
            if (img) gsap.to(img, { scale: 1, duration: 0.35, ease: 'power2.out' });
        });
    });

    // ----------------------------------------------------
    // 11. Global Call-to-Action Section
    // ----------------------------------------------------
    const ctaTrigger = '.global-cta';
    if (document.querySelector(ctaTrigger)) {
        const ctaTl = gsap.timeline({
            scrollTrigger: {
                trigger: ctaTrigger,
                start: 'top 80%'
            }
        });

        ctaTl.fromTo('.lets-build-something-container span',
            { y: 35, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
        );

        ctaTl.fromTo('.decorative-elements img',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.8)' },
            '-=0.5'
        );

        ctaTl.fromTo('.cta-button-wrapper',
            { scale: 0.85, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' },
            '-=0.4'
        );
    }

    const discoveryBtn = document.querySelector('.link6');
    if (discoveryBtn) {
        const arrow = discoveryBtn.querySelector('.svg-icon');
        if (arrow) {
            arrow.classList.add('btn-arrow-nudge');
        }

        discoveryBtn.addEventListener('mouseenter', () => {
            gsap.to(discoveryBtn, { scale: 1.03, duration: 0.3, ease: 'power2.out' });
        });
        discoveryBtn.addEventListener('mouseleave', () => {
            gsap.to(discoveryBtn, { scale: 1, duration: 0.3, ease: 'power2.out' });
        });
    }

    // ----------------------------------------------------
    // 12. Footer soft stagger-in ScrollTrigger
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
                duration: 0.7,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: footer,
                    start: 'top 95%'
                }
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
