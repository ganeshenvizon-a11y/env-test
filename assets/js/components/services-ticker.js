/**
 * Envizon Studio - Services Category Nav
 * Slow, infinite GSAP marquee effect.
 */

export class ServicesNav {
    constructor(root) {
        this.root = root; // this is the track (e.g. #servicesTicker, which is ul.services-bar__track)
        if (!this.root) return;

        this.originalItems = Array.from(this.root.querySelectorAll('.services-bar__item'));
        if (!this.originalItems.length) return;

        // Wrap original items in a group to measure its width easily
        this.group = document.createElement('div');
        this.group.className = 'services-bar__group';
        
        // Move items into the group
        this.originalItems.forEach(item => this.group.appendChild(item));
        this.root.appendChild(this.group);

        // Clone the group to ensure we have enough items for seamless scrolling
        // We will make 4 groups in total (1 original + 3 clones)
        for (let i = 0; i < 3; i++) {
            const clone = this.group.cloneNode(true);
            this.root.appendChild(clone);
        }

        this.initMarquee();
    }

    initMarquee() {
        const startAnimation = () => {
            const groupWidth = this.group.getBoundingClientRect().width;
            const gap = parseFloat(window.getComputedStyle(this.root).gap) || 0;
            const totalDistance = groupWidth + gap;

            if (this.tween) {
                this.tween.kill();
            }

            // Animate x of the track
            this.tween = gsap.to(this.root, {
                x: -totalDistance,
                ease: 'none',
                duration: 35, // slow marquee speed
                repeat: -1
            });
        };

        // Run with a tiny timeout to ensure styling/fonts are applied and clientRect measurements are accurate
        setTimeout(startAnimation, 50);

        this.resizeHandler = () => startAnimation();
        window.addEventListener('resize', this.resizeHandler);
    }

    destroy() {
        if (this.tween) {
            this.tween.kill();
        }
        window.removeEventListener('resize', this.resizeHandler);
    }
}

export function initServicesNav(selector = '#servicesTicker') {
    const root = document.querySelector(selector);
    if (!root) return null;
    return new ServicesNav(root);
}
