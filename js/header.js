import { initNavbar } from '../assets/js/components/navbar.js?v=1.1';
import { initLenis } from './lenis-setup.js';

// Initialize Lenis smooth scroll
initLenis();

document.addEventListener('DOMContentLoaded', () => {
    const placeholder = document.querySelector('header.header');
    if (!placeholder) return;
    if (placeholder.dataset.loaded === 'true') return;

    fetch('components/header.html')
        .then(res => res.text())
        .then(html => {
            // Check again in case it was loaded in parallel
            if (placeholder.dataset.loaded === 'true') return;

            // Dev servers with live-reload (e.g. VS Code Live Server) inject their
            // reload <script> into every response, including this fragment. With
            // no </body> to target, it lands mid-markup (inside the inline <svg>
            // icons), which corrupts how the browser parses the rest of the
            // fragment once it's set via innerHTML — the mobile off-canvas menu
            // ends up with most of its links silently dropped. Strip any <script>
            // tags before inserting, since this fragment never legitimately
            // contains one (behavior scripts are loaded separately via this file).
            const sanitizedHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

            placeholder.innerHTML = sanitizedHtml;
            placeholder.dataset.loaded = 'true';
            
            // Set active page navigation link
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            let targetPage = currentPath;
            if (currentPath === '') {
                targetPage = 'index.html';
            }
            
            const allLinks = placeholder.querySelectorAll('.nav-links a, .mobile-nav-links a');
            allLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === targetPage) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            // Initialize navigation behaviors (sticky, toggles, keyboard trap, scroll lock, overlays)
            initNavbar();

            // Initialize services dropdown preview swap logic
            initServicesDropdown();

            // Initialize mobile submenu collapse/expand toggle
            initMobileSubmenu();

            // Dispatch load event for animation listeners
            document.dispatchEvent(new CustomEvent('headerLoaded'));
        })
        .catch(err => console.error("Error loading header component:", err));
});

function initServicesDropdown() {
    const trigger = document.querySelector('.services-trigger');
    const dropdown = document.querySelector('.services-dropdown');
    if (!trigger || !dropdown) return;

    const links = dropdown.querySelectorAll('.services-dropdown__list a');
    const previewImg = dropdown.querySelector('#dropdown-preview-img');
    if (!previewImg) return;

    const defaultHero = "assets/images/services/branding/image 165.jpg";
    let hoverTimeout;

    const showDropdown = () => {
        clearTimeout(hoverTimeout);
        dropdown.classList.add('is-active');
        trigger.classList.add('is-active');
    };

    const hideDropdown = () => {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
            dropdown.classList.remove('is-active');
            trigger.classList.remove('is-active');
        }, 300); // 300ms grace period makes diagonal mouse movement bulletproof
    };

    // Attach mouse listeners to both trigger and dropdown menu
    trigger.addEventListener('mouseenter', showDropdown);
    trigger.addEventListener('mouseleave', hideDropdown);

    dropdown.addEventListener('mouseenter', showDropdown);
    dropdown.addEventListener('mouseleave', hideDropdown);

    // Dynamic preview image swaps on hover
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const heroSrc = link.getAttribute('data-hero');
            if (heroSrc && previewImg.getAttribute('src') !== heroSrc) {
                previewImg.classList.add('fade-out');
                setTimeout(() => {
                    previewImg.setAttribute('src', heroSrc);
                    previewImg.classList.remove('fade-out');
                }, 150);
            }
        });
    });

    // Reset preview to branding hero on mouse leave
    dropdown.addEventListener('mouseleave', () => {
        if (previewImg.getAttribute('src') !== defaultHero) {
            previewImg.classList.add('fade-out');
            setTimeout(() => {
                previewImg.setAttribute('src', defaultHero);
                previewImg.classList.remove('fade-out');
            }, 150);
        }
    });
}

function initMobileSubmenu() {
    const toggle = document.querySelector('.mobile-submenu-toggle');
    const hasSubmenu = document.querySelector('.mobile-has-submenu');
    if (!toggle || !hasSubmenu) return;

    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        hasSubmenu.classList.toggle('is-open');
    });
}
