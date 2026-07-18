/**
 * Envizon Studio - Navbar
 * Handles the accessible right-side off-canvas sidebar (mobile/tablet nav):
 * open/close, backdrop click, escape key, focus trap and body scroll lock.
 * Includes GSAP capsule shrink and slide-away behaviors on scroll.
 */

const STICKY_THRESHOLD = 16;
const REVEAL_ZONE = 24;
const COMPACT_AT = 260;

// Sticky Class Toggle
function initStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    let ticking = false;
    const applyStickyState = () => {
        header.classList.toggle('is-sticky', window.scrollY > STICKY_THRESHOLD);
        ticking = false;
    };
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(applyStickyState);
        }
    }, { passive: true });
    applyStickyState();
}

// GSAP Shrink & Slide Scroll Effects
function initScrollBehavior() {
    const gsap = window.gsap;
    if (typeof gsap === 'undefined') return;

    const wrapper = document.querySelector('.navbar-wrapper');
    const logoImg = document.querySelector('.logo img');
    if (!wrapper || !logoImg) return;

    const desktopQuery = window.matchMedia('(min-width: 1025px)');
    let isCompact = false;
    let isHidden = false;
    let lastY = window.scrollY;

    const setCompact = (on) => {
        if (on === isCompact || !desktopQuery.matches) return;
        isCompact = on;
        
        if (on) {
            wrapper.classList.add('is-compact');
        } else {
            wrapper.classList.remove('is-compact');
        }
    };

    const setHidden = (on) => {
        if (on === isHidden) return;
        isHidden = on;
        gsap.to(wrapper, {
            yPercent: on ? -220 : 0,
            autoAlpha: on ? 0 : 1,
            duration: on ? 0.5 : 0.55,
            ease: on ? 'power3.in' : 'power3.out',
            overwrite: 'auto'
        });
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                const goingDown = y > lastY;

                if (y <= REVEAL_ZONE) {
                    setHidden(false);
                    setCompact(false);
                } else {
                    // Only slide away header on desktop scroll down; keep it permanently sticky on mobile/tablet
                    setHidden(desktopQuery.matches ? goingDown : false);
                    setCompact(y > COMPACT_AT);
                }
                lastY = y;
                ticking = false;
            });
        }
    }, { passive: true });

    desktopQuery.addEventListener('change', () => {
        setCompact(false);
        setHidden(false);
    });
}

// Mobile Sidebar focus trap and overlays
export function initNavbar() {
    initStickyHeader();
    initScrollBehavior();

    const toggle = document.querySelector('.nav-toggle');
    const sidebar = document.querySelector('.mobile-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const closeBtn = document.querySelector('.sidebar-close');
    if (!toggle || !sidebar || !overlay) return;

    let lastFocused = null;
    const getFocusable = () => Array.from(sidebar.querySelectorAll('a[href], button:not([disabled])'));

    const trapFocus = (e) => {
        if (e.key !== 'Tab') return;
        const focusable = getFocusable();
        if (focusable.length === 0) return;
        
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };

    const onKeydown = (e) => {
        if (e.key === 'Escape') closeMenu();
        else trapFocus(e);
    };

    function openMenu() {
        lastFocused = document.activeElement;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.classList.add('is-open');
        sidebar.setAttribute('aria-hidden', 'false');
        sidebar.classList.add('is-open');
        overlay.classList.add('is-open');
        document.body.classList.add('nav-open');
        (closeBtn || getFocusable()[0] || sidebar).focus();
        document.addEventListener('keydown', onKeydown);
    }

    function closeMenu() {
        if (!sidebar.classList.contains('is-open')) return;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.remove('is-open');
        sidebar.setAttribute('aria-hidden', 'true');
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-open');
        document.body.classList.remove('nav-open');
        document.removeEventListener('keydown', onKeydown);
        if (lastFocused) lastFocused.focus();
    }

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        isOpen ? closeMenu() : openMenu();
    });

    closeBtn?.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            closeMenu();
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    const desktopNavLinks = document.querySelectorAll('.nav-links a');
    desktopNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}
