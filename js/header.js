import { initNavbar } from '../assets/js/components/navbar.js';

document.addEventListener('DOMContentLoaded', () => {
    const placeholder = document.querySelector('header.header');
    if (!placeholder) return;
    if (placeholder.dataset.loaded === 'true') return;

    fetch('components/header.html')
        .then(res => res.text())
        .then(html => {
            // Check again in case it was loaded in parallel
            if (placeholder.dataset.loaded === 'true') return;
            
            placeholder.innerHTML = html;
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

            // Dispatch load event for animation listeners
            document.dispatchEvent(new CustomEvent('headerLoaded'));
        })
        .catch(err => console.error("Error loading header component:", err));
});
