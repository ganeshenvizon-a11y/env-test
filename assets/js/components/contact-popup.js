/**
 * Envizon Studio - Contact Popup Form
 * Dynamically injects and manages the contact form popup modal
 * for CTA button wrappers across all service and landing pages.
 */

import { initContactForm } from './contact-form.js';

function loadStylesheet(href) {
    if (document.querySelector(`link[href*="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

const POPUP_HTML = `
<div class="contact-popup-overlay" id="contactPopup" aria-hidden="true" role="dialog" aria-labelledby="contact-popup-title" style="display: none;">
    <div class="contact-popup-container">
        <button class="contact-popup-close" id="contactPopupClose" aria-label="Close contact form">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
        <div class="contact-popup-scroll">
            <div class="contact-form-section__container">
                <div class="contact-form-panel">
                    <h2 class="contact-form-panel__title" id="contact-popup-title">
                        Ready to request<br><span>a quote?</span>
                    </h2>
                    <p class="contact-form-panel__text">
                        Share a few details about your project and the team best
                        suited to it will follow up with next steps.
                    </p>
                    <ul class="contact-form-panel__points">
                        <li class="contact-form-panel__point">
                            <span class="contact-form-panel__point-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            </span>
                            <span>A response within one business day</span>
                        </li>
                        <li class="contact-form-panel__point">
                            <span class="contact-form-panel__point-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            </span>
                            <span>A discovery call to scope your brief</span>
                        </li>
                        <li class="contact-form-panel__point">
                            <span class="contact-form-panel__point-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            </span>
                            <span>A tailored proposal, no obligation</span>
                        </li>
                    </ul>
                    <div class="contact-form-panel__direct">
                        <a href="mailto:hello@envizonstudio.com" class="contact-form-panel__direct-link">
                            <span class="contact-form-panel__direct-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 6l9 7 9-7M3 6v12h18V6"/></svg>
                            </span>
                            hello@envizonstudio.com
                        </a>
                        <a href="tel:+919849499191" class="contact-form-panel__direct-link">
                            <span class="contact-form-panel__direct-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.8 2Z"/></svg>
                            </span>
                            +91 98494 99191
                        </a>
                    </div>
                </div>

                <form class="contact-form" id="contactPopupForm" novalidate>
                    <div class="contact-form__row">
                        <div class="contact-form__field">
                            <label class="contact-form__label" for="popup-contact-name">Full Name <span class="contact-form__required">*</span></label>
                            <input class="contact-form__control" type="text" id="popup-contact-name" name="name" autocomplete="name" required aria-required="true">
                            <span class="contact-form__error" role="alert"></span>
                        </div>
                        <div class="contact-form__field">
                            <label class="contact-form__label" for="popup-contact-email">Email Address <span class="contact-form__required">*</span></label>
                            <input class="contact-form__control" type="email" id="popup-contact-email" name="email" autocomplete="email" required aria-required="true">
                            <span class="contact-form__error" role="alert"></span>
                        </div>
                    </div>
                    <div class="contact-form__row">
                        <div class="contact-form__field">
                            <label class="contact-form__label" for="popup-contact-phone">Phone Number</label>
                            <input class="contact-form__control" type="tel" id="popup-contact-phone" name="phone" autocomplete="tel">
                            <span class="contact-form__error" role="alert"></span>
                        </div>
                        <div class="contact-form__field">
                            <label class="contact-form__label" for="popup-contact-company">Company</label>
                            <input class="contact-form__control" type="text" id="popup-contact-company" name="company" autocomplete="organization">
                            <span class="contact-form__error" role="alert"></span>
                        </div>
                    </div>
                    <div class="contact-form__row">
                        <div class="contact-form__field contact-form__field--full">
                            <label class="contact-form__label" for="popup-contact-subject">What are you looking for? <span class="contact-form__required">*</span></label>
                            <select class="contact-form__control" id="popup-contact-subject" name="subject" required aria-required="true">
                                <option value="" selected disabled>Select a service</option>
                                <option value="Brand Strategy">Brand Strategy</option>
                                <option value="Website / Application">Website / Application</option>
                                <option value="Digital Marketing">Digital Marketing</option>
                                <option value="Print & Packaging">Print &amp; Packaging</option>
                                <option value="Ad Film / Photo Shoot">Ad Film / Photo Shoot</option>
                                <option value="Other">Other</option>
                            </select>
                            <span class="contact-form__error" role="alert"></span>
                        </div>
                    </div>
                    <div class="contact-form__field">
                        <label class="contact-form__label" for="popup-contact-message">Message <span class="contact-form__required">*</span></label>
                        <textarea class="contact-form__control" id="popup-contact-message" name="message" rows="5" required aria-required="true"></textarea>
                        <span class="contact-form__error" role="alert"></span>
                    </div>
                    <input type="text" name="website_url" class="contact-form__honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">

                    <div class="contact-form__recaptcha" data-recaptcha></div>

                    <p class="contact-form__status" role="status" aria-live="polite"></p>
                    <div class="contact-form__footer">
                        <p class="contact-form__note">By submitting this form you agree to be contacted by Envizon Studio regarding your enquiry.</p>
                        <button type="submit" class="btn btn-primary contact-form__submit">Send Message</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
`;

let activeTriggerButton = null;
let closeTimeoutId = null;

export function initContactPopup() {
    // If we're already on the contact page, don't initialize the popup
    if (window.location.pathname.endsWith('contact.html') || document.querySelector('.contact-hero')) {
        return;
    }

    // Find all CTA wrappers
    const ctaWrappers = document.querySelectorAll('.cta-button-wrapper');
    if (ctaWrappers.length === 0) return;

    // Inject the popup container HTML if it doesn't exist
    if (!document.getElementById('contactPopup')) {
        document.body.insertAdjacentHTML('beforeend', POPUP_HTML);
        
        // Dynamically load the style dependencies
        loadStylesheet('assets/css/components/contact-form.css');
        loadStylesheet('assets/css/components/contact-popup.css');
        
        // Initialize form validation behavior
        initContactForm('#contactPopupForm');
    }

    const overlay = document.getElementById('contactPopup');
    const closeBtn = document.getElementById('contactPopupClose');
    const form = document.getElementById('contactPopupForm');

    if (!overlay || !closeBtn || !form) return;

    const openPopup = (e) => {
        e.preventDefault();
        activeTriggerButton = e.currentTarget;
        
        if (closeTimeoutId) {
            clearTimeout(closeTimeoutId);
            closeTimeoutId = null;
        }

        overlay.style.display = 'flex';
        // Force reflow
        void overlay.offsetHeight;
        
        overlay.classList.add('is-active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('contact-popup-open');

        // Focus the first input field
        setTimeout(() => {
            const firstInput = form.querySelector('#popup-contact-name');
            firstInput?.focus();
        }, 100);
    };

    const closePopup = () => {
        overlay.classList.remove('is-active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('contact-popup-open');

        if (closeTimeoutId) {
            clearTimeout(closeTimeoutId);
        }

        closeTimeoutId = setTimeout(() => {
            if (!overlay.classList.contains('is-active')) {
                overlay.style.display = 'none';
            }
            closeTimeoutId = null;
        }, 350); // Matches transition time in contact-popup.css

        // Reset the form values and status on close
        form.reset();
        const statusEl = form.querySelector('.contact-form__status');
        if (statusEl) {
            statusEl.textContent = '';
            statusEl.removeAttribute('data-state');
        }
        form.querySelectorAll('.contact-form__field.has-error').forEach(field => {
            field.classList.remove('has-error');
            field.querySelector('.contact-form__control')?.removeAttribute('aria-invalid');
            const errorEl = field.querySelector('.contact-form__error');
            if (errorEl) errorEl.textContent = '';
        });

        // Restore focus to the trigger button
        if (activeTriggerButton) {
            activeTriggerButton.focus();
            activeTriggerButton = null;
        }
    };

    // Attach click events to CTA links inside wrapper
    ctaWrappers.forEach(wrapper => {
        const link = wrapper.querySelector('a');
        if (link) {
            link.addEventListener('click', openPopup);
        }
    });

    // Close button click
    closeBtn.addEventListener('click', closePopup);

    // Overlay click (closes when clicking on backdrop, not container)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closePopup();
        }
    });

    // Escape key close listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
            closePopup();
        }
    });
}
