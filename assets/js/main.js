import { initNavbar } from './components/navbar.js';
import { initShowcaseCarousel } from './components/carousel.js';
import { initServicesNav } from './components/services-ticker.js';
import { initServicesScroll } from './components/services-scroll.js';

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    const carousel = initShowcaseCarousel('#showcaseCarousel');
    initServicesNav('#servicesTicker', carousel);
    initServicesScroll('#servicesScroll');
});

/**
 * Animate service cards into view on scroll
 */
window.addEventListener('load', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });
});
