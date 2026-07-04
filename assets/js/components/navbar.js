/**
 * Envizon Studio - Navbar
 * Handles the accessible right-side off-canvas sidebar (mobile/tablet nav):
 * open/close, backdrop click, escape key, focus trap and body scroll lock.
 */

export function initNavbar() {
    const toggle = document.querySelector('.nav-toggle');
    const sidebar = document.querySelector('.mobile-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const closeBtn = document.querySelector('.sidebar-close');

    if (!toggle || !sidebar || !overlay) return;

    let lastFocused = null;

    const getFocusable = () =>
        Array.from(sidebar.querySelectorAll('a[href], button:not([disabled])'));

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
        if (e.key === 'Escape') {
            closeMenu();
        } else {
            trapFocus(e);
        }
    };

    function openMenu() {
        lastFocused = document.activeElement;

        toggle.setAttribute('aria-expanded', 'true');
        toggle.classList.add('is-open');
        sidebar.setAttribute('aria-hidden', 'false');
        sidebar.classList.add('is-open');
        overlay.classList.add('is-open');
        document.body.classList.add('nav-open');

        const focusable = getFocusable();
        (closeBtn || focusable[0] || sidebar).focus();

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
