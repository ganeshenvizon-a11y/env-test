/**
 * Envizon Studio - Services Category Nav
 * Thin nav strip synced to the showcase carousel's active card.
 */

export class ServicesNav {
    constructor(root) {
        this.root = root;
        
        const originalItems = Array.from(root.querySelectorAll('.services-bar__item'));
        if (!originalItems.length) return;

        // Clone the original items 3 times (4 sets total) to create a seamless looping marquee
        for (let c = 0; c < 3; c++) {
            originalItems.forEach((item) => {
                const clone = item.cloneNode(true);
                this.root.appendChild(clone);
            });
        }
    }
}

export function initServicesNav(selector = '#servicesTicker') {
    const root = document.querySelector(selector);
    if (!root) return null;
    return new ServicesNav(root);
}
