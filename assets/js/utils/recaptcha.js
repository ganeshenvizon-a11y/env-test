/**
 * Envizon Studio - Shared reCAPTCHA v2 helper
 * Loads the reCAPTCHA script once per page, explicitly renders a widget
 * into a form's [data-recaptcha] container, and exposes response/reset
 * helpers. Shared by every form that needs captcha verification.
 */

const RECAPTCHA_SITE_KEY = '6LfMv1YqAAAAAKtfU2OduJtKdwY5TrzHdZaYO1jw';
const RECAPTCHA_SCRIPT_SRC = 'https://www.google.com/recaptcha/api.js?render=explicit';

let recaptchaScriptPromise = null;

function loadRecaptchaScript() {
    if (window.grecaptcha && window.grecaptcha.render) return Promise.resolve();
    if (recaptchaScriptPromise) return recaptchaScriptPromise;

    recaptchaScriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[src^="https://www.google.com/recaptcha/api.js"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', reject, { once: true });
            return;
        }
        const script = document.createElement('script');
        script.src = RECAPTCHA_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.addEventListener('load', () => resolve(), { once: true });
        script.addEventListener('error', reject, { once: true });
        document.head.appendChild(script);
    });

    return recaptchaScriptPromise;
}

export function renderRecaptcha(form) {
    const container = form.querySelector('[data-recaptcha]');
    if (!container || container.dataset.rendered === 'true') return;

    loadRecaptchaScript().then(() => new Promise((resolve) => window.grecaptcha.ready(resolve))).then(() => {
        if (container.dataset.rendered === 'true') return;
        const widgetId = window.grecaptcha.render(container, { sitekey: RECAPTCHA_SITE_KEY });
        container.dataset.widgetId = String(widgetId);
        container.dataset.rendered = 'true';
    }).catch(() => {
        container.dataset.loadFailed = 'true';
    });
}

export function getRecaptchaResponse(form) {
    const container = form.querySelector('[data-recaptcha]');
    if (!container || container.dataset.rendered !== 'true' || !window.grecaptcha) return '';
    return window.grecaptcha.getResponse(Number(container.dataset.widgetId));
}

export function resetRecaptcha(form) {
    const container = form.querySelector('[data-recaptcha]');
    if (!container || container.dataset.rendered !== 'true' || !window.grecaptcha) return;
    window.grecaptcha.reset(Number(container.dataset.widgetId));
}
