/**
 * Envizon Studio - Services Category Nav
 * Thin nav strip synced to the showcase carousel's active card.
 */

export class ServicesNav {
    constructor(root, carousel) {
        this.root = root;
        this.carousel = carousel;
        this.items = Array.from(root.querySelectorAll('.services-bar__item'));

        if (!this.items.length || !carousel) return;

        this.bindClicks();
        carousel.onChange((index) => this.setActive(index));
    }

    bindClicks() {
        this.items.forEach((item, i) => {
            const btn = item.querySelector('.services-bar__btn');
            btn?.addEventListener('click', () => {
                this.carousel.goTo(i);
                this.carousel.restartAutoplay();
            });
        });
    }

    setActive(index) {
        this.items.forEach((item, i) => {
            item.classList.toggle('is-active', i === index);
        });

        // Center the active item within the ticker's own horizontal scroller
        // (`.services-bar`, this.root's parent) directly via scrollLeft, rather
        // than scrollIntoView: `.services-bar__track` (this.root) itself has no
        // overflow set, so scrollIntoView's "nearest" block-axis search can't
        // find a scrollable ancestor and escalates all the way to the window —
        // scrolling the whole page every time this fires (including on every
        // carousel autoplay tick, every 3s) and fighting any other scroll owner
        // on the page (e.g. the pinned services-scroll section's ScrollTrigger).
        const item = this.items[index];
        const scroller = this.root.parentElement;
        if (!item || !scroller) return;

        const target = item.offsetLeft - (scroller.clientWidth - item.offsetWidth) / 2;
        scroller.scrollTo({ left: target, behavior: 'smooth' });
    }
}

export function initServicesNav(selector = '#servicesTicker', carousel) {
    const root = document.querySelector(selector);
    if (!root) return null;
    return new ServicesNav(root, carousel);
}
