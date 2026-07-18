/**
 * Envizon Studio - Services Page GSAP Animations Controller
 * Drive elegant, high-end agency transitions and micro-interactions
 */

export function initServicesAnimations() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) {
        console.warn("GSAP or ScrollTrigger libraries are missing. Animations disabled.");
        return;
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Standardised scroll-reveal duration (1.5 s across all pages)
    const REVEAL = 0.7;

    // Respect user preferences for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        // Force opacity on all initial state classes
        gsap.set('.capabilities-header__title, .capabilities-header__text, .video-banner__timeline-steps, .services-playbook__grid, .insights__container', { opacity: 1 });
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
            { y: 0, opacity: 1, duration: REVEAL, ease: 'power3.out' }
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
    heroTl.fromTo('.capabilities-header__title .title-line-inner',
        { yPercent: 100 },
        { yPercent: 0, duration: REVEAL, stagger: 0.15, ease: 'power4.out' }
    );

    // Make title visible
    gsap.set('.capabilities-header__title', { opacity: 1 });

    // Paragraph fade-up
    heroTl.fromTo('.capabilities-header__text',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: REVEAL, ease: 'power3.out' },
        '-=0.75'
    );

    // ----------------------------------------------------
    // 3. Process Section ScrollTrigger
    // ----------------------------------------------------
    const processTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.video-banner',
            start: 'top 80%',
            toggleActions: 'play none none none'
        }
    });

    processTl.fromTo('.video-banner__timeline-wrapper',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: REVEAL, ease: 'power2.out' }
    );

    processTl.fromTo('.video-banner__timeline-line-bg',
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: REVEAL, ease: 'power2.out' },
        '-=0.3'
    );

    processTl.fromTo('.video-banner__timeline-steps',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: REVEAL, ease: 'power2.out' },
        '-=0.5'
    );

    // ----------------------------------------------------
    // 4. Expertise cards ScrollTrigger & hover states
    // ----------------------------------------------------
    // Stagger reveal playbook heading and grid cards
    gsap.fromTo('.services-playbook__title',
        { y: 35, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: REVEAL,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.services-playbook',
                start: 'top 80%'
            }
        }
    );

    gsap.fromTo('.playbook-item',
        { y: 40, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: REVEAL,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.services-playbook__grid',
                start: 'top 85%'
            }
        }
    );

    // Make parent grid layout visible
    gsap.set('.services-playbook__grid', { opacity: 1 });

    const playbookItems = document.querySelectorAll('.playbook-item');
    playbookItems.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -8, scale: 1.01, duration: 0.35, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, scale: 1, duration: 0.35, ease: 'power2.out' });
        });
    });

    // ----------------------------------------------------
    // 4b. Services Values Section Header Reveal
    // ----------------------------------------------------
    gsap.fromTo('.about-values__header',
        { y: 40, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: REVEAL,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#servicesValues',
                start: 'top 85%'
            }
        }
    );

    // ----------------------------------------------------
    // 4c. Possibilities Section Header & Rows Reveal
    // ----------------------------------------------------
    gsap.fromTo('.possibilities__title',
        { y: 35, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: REVEAL,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.possibilities',
                start: 'top 80%'
            }
        }
    );

    gsap.fromTo('.possibilities-row',
        { y: 40, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: REVEAL,
            stagger: 0.15,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
            scrollTrigger: {
                trigger: '.possibilities',
                start: 'top 75%'
            }
        }
    );

    // ----------------------------------------------------
    // 5. “Studio. Endless Possibilities.” Accordion Interaction
    // ----------------------------------------------------
    const possibilitiesContainer = document.querySelector('.possibilities__rows');
    if (possibilitiesContainer) {
        possibilitiesContainer.classList.add('js-accordion');
        const rows = Array.from(possibilitiesContainer.querySelectorAll('.possibilities-row'));

        if (rows.length > 0) {
            // Helper function to calculate aspect-ratio matching height dynamically
            const getMediaHeight = (mediaEl) => {
                const width = mediaEl.getBoundingClientRect().width || 480;
                return window.innerWidth <= 768 ? (width / 1.1) : width;
            };

            // Setup initial states
            rows.forEach((row, i) => {
                const desc = row.querySelector('.possibilities-desc');
                const media = row.querySelector('.possibilities-media');

                if (i === 0) {
                    row.classList.add('is-active');
                    gsap.set(desc, { height: 'auto', opacity: 1, marginTop: '16px' });
                    const targetHeight = getMediaHeight(media);
                    gsap.set(media, { height: targetHeight, scale: 1, opacity: 1 });
                } else {
                    gsap.set(desc, { height: 0, opacity: 0, marginTop: '0px' });
                    gsap.set(media, { height: 0, scale: 0.9, opacity: 0 });
                }
            });

            // Expand accordion row logic
            const expandRow = (activeIndex) => {
                rows.forEach((row, idx) => {
                    const desc = row.querySelector('.possibilities-desc');
                    const media = row.querySelector('.possibilities-media');

                    if (idx === activeIndex) {
                        row.classList.add('is-active');
                        
                        // Stop conflicting tweens
                        gsap.killTweensOf([desc, media]);

                        // Expand active details
                        gsap.fromTo(desc,
                            { height: 0, opacity: 0, marginTop: '0px' },
                            { height: 'auto', opacity: 1, marginTop: '16px', duration: 0.5, ease: 'power3.out' }
                        );

                        // Reveal active image with calculated height
                        const targetHeight = getMediaHeight(media);
                        gsap.fromTo(media,
                            { height: 0, scale: 0.9, opacity: 0 },
                            { height: targetHeight, scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' }
                        );
                    } else if (row.classList.contains('is-active')) {
                        row.classList.remove('is-active');
                        
                        gsap.killTweensOf([desc, media]);

                        // Collapse details
                        gsap.to(desc, { height: 0, opacity: 0, marginTop: '0px', duration: 0.4, ease: 'power2.in' });

                        // Collapse media
                        gsap.to(media, {
                            height: 0,
                            scale: 0.9,
                            opacity: 0,
                            duration: 0.4,
                            ease: 'power2.in'
                        });
                    }
                });
            };

            // Recalculate heights on resize for active item
            window.addEventListener('resize', () => {
                const activeRow = possibilitiesContainer.querySelector('.possibilities-row.is-active');
                if (activeRow) {
                    const activeMedia = activeRow.querySelector('.possibilities-media');
                    if (activeMedia) {
                        const targetHeight = getMediaHeight(activeMedia);
                        gsap.set(activeMedia, { height: targetHeight });
                    }
                }
            });

            // Bind click & hover handlers to rows
            rows.forEach((row, idx) => {
                row.addEventListener('click', () => {
                    if (!row.classList.contains('is-active')) {
                        expandRow(idx);
                    }
                });

                row.addEventListener('mouseenter', () => {
                    if (!row.classList.contains('is-active')) {
                        expandRow(idx);
                    }
                });
            });
        }
    }

    // ----------------------------------------------------
    // 6. Insights Section ScrollTrigger
    // ----------------------------------------------------
    // Animate insights header first
    gsap.fromTo('.insights__header',
        { y: 30, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: REVEAL,
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
            duration: REVEAL,
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
            { y: 0, opacity: 1, duration: REVEAL, stagger: 0.15, ease: 'power3.out' }
        );

        // Dots expand scale in
        ctaTl.fromTo('.decorative-elements img',
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: REVEAL, stagger: 0.08, ease: 'back.out(1.8)' },
            '-=0.5'
        );

        // Discovery call button scale up
        ctaTl.fromTo('.cta-button-wrapper',
            { scale: 0.85, opacity: 0 },
            { scale: 1, opacity: 1, duration: REVEAL, ease: 'back.out(1.5)' },
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
                duration: REVEAL,
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
