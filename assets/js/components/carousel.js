/**
 * Envizon Studio - Showcase Carousel
 * 5-card center-focused coverflow carousel driven by GSAP timelines.
 * Cards use transform-only properties (x, scale, rotation, opacity, filter)
 * so the loop stays on the compositor and holds 60fps.
 */

const AUTOPLAY_MS = 3000;
const SWIPE_THRESHOLD = 40;

const SHADOWS = [
    '0 40px 80px rgba(0,0,0,.35)',
    '0 25px 50px rgba(0,0,0,.22)',
    '0 15px 30px rgba(0,0,0,.15)',
    '0 10px 20px rgba(0,0,0,.08)'
];

const LAYOUTS = {
    desktop: {
        query: '(min-width: 1025px)',
        levels: [
            { x: 0,   scale: 1,   opacity: 1,   blur: 0,  rotate: 0, overlay: 0,   z: 50 },
            { x: 300, scale: .82, opacity: 1,   blur: 0,  rotate: 2, overlay: .35, z: 40 },
            { x: 500, scale: .65, opacity: 1,   blur: .5, rotate: 3, overlay: .6,  z: 30 },
            { x: 640, scale: .5,  opacity: 0,   blur: 2,  rotate: 4, overlay: .85, z: 10 }
        ]
    },
    tablet: {
        query: '(min-width: 641px) and (max-width: 1024px)',
        levels: [
            { x: 0,   scale: 1,   opacity: 1, blur: 0, rotate: 0, overlay: 0,   z: 50 },
            { x: 200, scale: .8,  opacity: 1, blur: 0, rotate: 2, overlay: .35, z: 40 },
            { x: 320, scale: .6,  opacity: 0, blur: 1, rotate: 3, overlay: .6,  z: 20 },
            { x: 400, scale: .5,  opacity: 0, blur: 2, rotate: 4, overlay: .85, z: 10 }
        ]
    },
    mobile: {
        query: '(max-width: 640px)',
        levels: [
            { x: 0,   scale: 1,   opacity: 1,   blur: 0, rotate: 0, overlay: 0,   z: 50 },
            { x: 150, scale: .78, opacity: .55, blur: 0, rotate: 2, overlay: .45, z: 20 },
            { x: 210, scale: .6,  opacity: 0,   blur: 1, rotate: 3, overlay: .7,  z: 10 },
            { x: 260, scale: .5,  opacity: 0,   blur: 2, rotate: 4, overlay: .9,  z: 5 }
        ]
    }
};

function getOffset(index, active, total) {
    let diff = (index - active) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
}

function currentLayoutName() {
    if (window.matchMedia(LAYOUTS.mobile.query).matches) return 'mobile';
    if (window.matchMedia(LAYOUTS.tablet.query).matches) return 'tablet';
    return 'desktop';
}

export class ShowcaseCarousel {
    constructor(root) {
        this.root = root;
        this.cards = Array.from(root.querySelectorAll('.showcase-card'));
        this.overlays = this.cards.map(card => card.querySelector('.showcase-card__overlay'));
        this.total = this.cards.length;
        this.active = 0;
        this.autoplayId = null;
        this.listeners = new Set();

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.duration = reduceMotion ? 0.01 : 1.1;

        if (!this.total) return;

        this.handleBrokenImages();
        gsap.set(this.cards, { xPercent: -50, yPercent: -50, force3D: true });
        this.render(true);
        this.bindInteractions();
        this.startAutoplay();
    }

    handleBrokenImages() {
        this.root.querySelectorAll('.showcase-card__image').forEach(img => {
            img.addEventListener('error', () => img.classList.add('is-broken'), { once: true });
        });
    }

    render(immediate = false) {
        const layout = LAYOUTS[currentLayoutName()];
        const tl = gsap.timeline({
            defaults: { duration: immediate ? 0 : this.duration, ease: 'power4.inOut' }
        });

        this.cards.forEach((card, i) => {
            const offset = getOffset(i, this.active, this.total);
            const level = Math.min(Math.abs(offset), layout.levels.length - 1);
            const cfg = layout.levels[level];
            const sign = offset === 0 ? 0 : (offset < 0 ? -1 : 1);

            tl.set(card, { zIndex: cfg.z }, 0);
            tl.to(card, {
                x: cfg.x * sign,
                scale: cfg.scale,
                opacity: cfg.opacity,
                rotation: cfg.rotate * sign,
                filter: `blur(${cfg.blur}px)`,
                boxShadow: SHADOWS[level],
                force3D: true
            }, 0);
            tl.to(this.overlays[i], { opacity: cfg.overlay }, 0);

            card.setAttribute('aria-current', i === this.active ? 'true' : 'false');
        });

        this.emit();
    }

    goTo(index) {
        this.active = ((index % this.total) + this.total) % this.total;
        this.render();
    }

    next() { this.goTo(this.active + 1); }
    prev() { this.goTo(this.active - 1); }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayId = setInterval(() => this.next(), AUTOPLAY_MS);
    }

    stopAutoplay() {
        if (this.autoplayId) clearInterval(this.autoplayId);
        this.autoplayId = null;
    }

    restartAutoplay() {
        this.startAutoplay();
    }

    bindInteractions() {
        const stage = this.root.querySelector('.showcase-carousel__stage');
        const prev = this.root.querySelector('.showcase-carousel__arrow--prev');
        const next = this.root.querySelector('.showcase-carousel__arrow--next');

        prev?.addEventListener('click', () => { this.prev(); this.restartAutoplay(); });
        next?.addEventListener('click', () => { this.next(); this.restartAutoplay(); });

        this.cards.forEach((card, i) => {
            card.addEventListener('click', () => { this.goTo(i); this.restartAutoplay(); });
        });

        this.root.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { this.next(); this.restartAutoplay(); }
            if (e.key === 'ArrowLeft') { this.prev(); this.restartAutoplay(); }
        });

        let startX = 0;
        let dragging = false;

        stage.addEventListener('pointerdown', (e) => {
            dragging = true;
            startX = e.clientX;
        });

        stage.addEventListener('pointerup', (e) => {
            if (!dragging) return;
            dragging = false;
            const delta = e.clientX - startX;
            if (Math.abs(delta) > SWIPE_THRESHOLD) {
                delta < 0 ? this.next() : this.prev();
                this.restartAutoplay();
            }
        });

        stage.addEventListener('pointercancel', () => { dragging = false; });

        this.root.addEventListener('pointerenter', () => this.stopAutoplay());
        this.root.addEventListener('pointerleave', () => this.startAutoplay());
        this.root.addEventListener('focusin', () => this.stopAutoplay());
        this.root.addEventListener('focusout', () => this.startAutoplay());

        window.addEventListener('resize', () => this.render(true));
    }

    onChange(callback) {
        this.listeners.add(callback);
        callback(this.active);
    }

    emit() {
        this.listeners.forEach(cb => cb(this.active));
    }

    destroy() {
        this.stopAutoplay();
    }
}

export function initShowcaseCarousel(selector = '#showcaseCarousel') {
    const root = document.querySelector(selector);
    if (!root) return null;
    return new ShowcaseCarousel(root);
}
