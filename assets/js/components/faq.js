/**
 * Envizon Studio - FAQ accordion
 * Only one item open at a time. Panels animate on height via rAF-driven
 * inline styles so the transition works from/to the content's natural
 * (variable) height, then settle on "auto" once open for responsiveness.
 */

export class FaqAccordion {
    constructor(root) {
        this.root = root;
        this.items = Array.from(root.querySelectorAll('.faq-item'));

        if (!this.items.length) return;

        this.items.forEach(item => this.bindItem(item));
    }

    bindItem(item) {
        const trigger = item.querySelector('.faq-item__trigger');
        const panel = item.querySelector('.faq-item__panel');

        if (!trigger || !panel) return;

        trigger.addEventListener('click', () => {
            const wasOpen = item.classList.contains('is-open');

            this.items.forEach(other => {
                if (other !== item) this.closeItem(other);
            });

            if (wasOpen) {
                this.closeItem(item);
            } else {
                this.openItem(item);
            }
        });
    }

    openItem(item) {
        const trigger = item.querySelector('.faq-item__trigger');
        const panel = item.querySelector('.faq-item__panel');

        if (item.classList.contains('is-open')) return;

        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');

        const target = panel.scrollHeight;
        panel.style.height = '0px';

        requestAnimationFrame(() => {
            panel.style.height = target + 'px';
        });

        panel.addEventListener('transitionend', function onEnd(e) {
            if (e.propertyName !== 'height') return;
            panel.style.height = 'auto';
            panel.removeEventListener('transitionend', onEnd);
        });
    }

    closeItem(item) {
        const trigger = item.querySelector('.faq-item__trigger');
        const panel = item.querySelector('.faq-item__panel');

        if (!item.classList.contains('is-open')) return;

        const height = panel.scrollHeight;
        panel.style.height = height + 'px';
        void panel.offsetHeight;

        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');

        requestAnimationFrame(() => {
            panel.style.height = '0px';
        });

        panel.addEventListener('transitionend', function onEnd(e) {
            if (e.propertyName !== 'height') return;
            panel.style.height = '';
            panel.removeEventListener('transitionend', onEnd);
        });
    }
}

export function initFaq(selector = '.faq__accordion') {
    const root = document.querySelector(selector);
    if (!root) return null;
    return new FaqAccordion(root);
}
