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

        this.items[index]?.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest'
        });
    }
}

export function initServicesNav(selector = '#servicesTicker', carousel) {
    const root = document.querySelector(selector);
    if (!root) return null;
    return new ServicesNav(root, carousel);
}
