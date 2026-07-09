/**
 * Envizon Studio - Contact Page GSAP Animations Controller
 * Drive elegant, high-end agency transitions and micro-interactions
 */

export function initContactAnimations() {
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
        gsap.set('.contact-info__title, .contact-info__text, .contact-info-card, .contact-form-panel, .contact-form, .contact-map__header, .contact-map__frame, .insights__container', { opacity: 1 });
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
    heroTl.fromTo('.contact-info__title .title-line-inner',
        { yPercent: 100 },
        { yPercent: 0, duration: 1.1, stagger: 0.15, ease: 'power4.out' }
    );

    // Make title visible
    gsap.set('.contact-info__title', { opacity: 1 });

    // Paragraph fade-up
    heroTl.fromTo('.contact-info__text',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
        '-=0.75'
    );

    // ----------------------------------------------------
    // 3. Contact Info Cards Staggered Reveal
    // ----------------------------------------------------
    gsap.fromTo('.contact-info-card',
        { y: 40, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.contact-info__grid',
                start: 'top 85%'
            }
        }
    );

    // Cards hover animation
    const infoCards = document.querySelectorAll('.contact-info-card');
    infoCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -8, scale: 1.01, duration: 0.35, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, scale: 1, duration: 0.35, ease: 'power2.out' });
        });
    });

    // ----------------------------------------------------
    // 4. Contact Form Section Reveal
    // ----------------------------------------------------
    const formTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.contact-form-section',
            start: 'top 80%'
        }
    });

    formTl.fromTo('.contact-form-panel',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );

    formTl.fromTo('.contact-form',
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.8'
    );

    // Staggered points inside left panel
    formTl.fromTo('.contact-form-panel__point',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
        '-=0.4'
    );

    // ----------------------------------------------------
    // 5. Contact Map Reveal
    // ----------------------------------------------------
    gsap.fromTo('.contact-map__header',
        { y: 30, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.contact-map',
                start: 'top 85%'
            }
        }
    );

    gsap.fromTo('.contact-map__frame',
        { y: 40, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.contact-map__frame',
                start: 'top 85%'
            }
        }
    );

    // ----------------------------------------------------
    // 6. Insights Section ScrollTrigger
    // ----------------------------------------------------
    // Animate insights header first
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

    // Then stagger animate insight cards
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

    // Make insights visible wrapper
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
    // 7. Global Call-to-Action Section
    // ----------------------------------------------------
    const ctaTrigger = '.global-cta';
    if (document.querySelector(ctaTrigger)) {
        const ctaTl = gsap.timeline({
            scrollTrigger: {
                trigger: ctaTrigger,
                start: 'top 80%'
            }
        });

        // Title Reveal line by line
        ctaTl.fromTo('.lets-build-something-container span',
            { y: 35, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
        );

        // Dots expand scale in
        ctaTl.fromTo('.decorative-elements img',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.8)' },
            '-=0.5'
        );

        // Discovery call button scale up
        ctaTl.fromTo('.cta-button-wrapper',
            { scale: 0.85, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' },
            '-=0.4'
        );
    }

    // Discover Call button hover effect
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
    // 8. Footer soft stagger-in ScrollTrigger
    // ----------------------------------------------------
    const runFooterAnimations = () => {
        const footer = document.querySelector('footer.footer');
        if (!footer) return;

        // Elements inside footer to animate
        const brand = footer.querySelector('.footer-brand');
        const cols = Array.from(footer.querySelectorAll('.footer-navigation-grid > div'));
        const bottomLine = footer.querySelector('.horizontalborder');

        const elements = [];
        if (brand) elements.push(brand);
        elements.push(...cols);
        if (bottomLine) elements.push(bottomLine);

        // Stagger entrance trigger on footer visibility
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

    // If footer is already loaded, animate; otherwise wait for loaded event
    const footerPlaceholder = document.querySelector('footer.footer');
    if (footerPlaceholder && footerPlaceholder.dataset.loaded === 'true') {
        runFooterAnimations();
    } else {
        document.addEventListener('footerLoaded', runFooterAnimations);
    }
}
