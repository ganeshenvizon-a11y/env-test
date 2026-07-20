document.addEventListener('DOMContentLoaded', () => {
    initChatbot();

    const placeholder = document.querySelector('footer.footer');
    if (!placeholder) return;
    if (placeholder.dataset.loaded === 'true') return;

    fetch('components/footer.html')
        .then(res => res.text())
        .then(html => {
            // Check again in case of parallel execution
            if (placeholder.dataset.loaded === 'true') return;
            
            placeholder.innerHTML = html;
            placeholder.dataset.loaded = 'true';

            // Initialize interactive footer branding title
            initFooterInteractiveTitle();

            // Dispatch load event for animation listeners
            document.dispatchEvent(new CustomEvent('footerLoaded'));
        })
        .catch(err => console.error("Error loading footer component:", err));
});

// Dynamic cursor-tracking spotlight reveal on giant background branding text
const initFooterInteractiveTitle = () => {
    const footer = document.querySelector('footer.footer');
    if (!footer) return;
    const title = footer.querySelector('.envizon');
    if (!title) return;

    // Apply fluid text layout properties to resolve browser paint clipping bugs
    title.style.setProperty('width', '100%', 'important');
    title.style.setProperty('left', '0', 'important');
    title.style.setProperty('text-align', 'center', 'important');
    title.style.setProperty('overflow', 'visible', 'important');
    title.style.setProperty('z-index', '1', 'important');
    title.style.setProperty('padding-top', '45px', 'important');

    // Apply inline gradient and clip attributes overriding default styles
    title.style.setProperty('background-image', 'radial-gradient(circle var(--spotlight-radius, 0px) at var(--x, 50%) var(--y, 50%), rgba(255, 194, 33, var(--spotlight-opacity, 0)) 0%, rgba(214, 214, 214, 0.17) 65%)', 'important');
    title.style.setProperty('-webkit-background-clip', 'text', 'important');
    title.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
    title.style.setProperty('background-clip', 'text', 'important');

    footer.addEventListener('mousemove', (e) => {
        const rect = title.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        title.style.setProperty('--x', `${x}px`);
        title.style.setProperty('--y', `${y}px`);
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        title.style.setProperty('--spotlight-radius', '200px');
        title.style.setProperty('--spotlight-opacity', '0.5');
        return;
    }

    footer.addEventListener('mouseenter', () => {
        gsap.to(title, {
            '--spotlight-radius': '250px',
            '--spotlight-opacity': 0.65,
            duration: 0.4,
            ease: 'power2.out'
        });
    });

    footer.addEventListener('mouseleave', () => {
        gsap.to(title, {
            '--spotlight-radius': '0px',
            '--spotlight-opacity': 0,
            duration: 0.7,
            ease: 'power2.out'
        });
    });
};

// Initialize Collect Chatbot dynamically on all pages
const initChatbot = () => {
    if (window.CollectId) return; // Prevent double initialization
    
    window.CollectId = "69a6e2dab14893cf6adc92f4";
    const h = document.head || document.getElementsByTagName("head")[0];
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = "https://collectcdn.com/launcher.js";
    h.appendChild(s);

    setTimeout(() => {
        const existing = document.querySelector('.chat-hi-image-wrapper');
        if (existing) existing.remove();

        const wrapper = document.createElement("div");
        wrapper.className = "chat-hi-image-wrapper";
        wrapper.innerHTML = `
            <div class="chat-hi-image-close">✕</div>
            <img src="assets/images/chat-hi-there.png" alt="We Are Here">
        `;

        document.body.appendChild(wrapper);

        const closeBtn = wrapper.querySelector(".chat-hi-image-close");
        if (closeBtn) {
            closeBtn.onclick = () => wrapper.remove();
        }
    }, 1200);
};

