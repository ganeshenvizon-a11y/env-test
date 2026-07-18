/**
 * Envizon Studio - Contact Page: Form validation
 * Validates required fields, email and phone formats, surfaces inline
 * errors, renders the reCAPTCHA widget, and submits to contact_validate.php.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;
const RECAPTCHA_SITE_KEY = '6LfMv1YqAAAAAKtfU2OduJtKdwY5TrzHdZaYO1jw';
const RECAPTCHA_SCRIPT_SRC = 'https://www.google.com/recaptcha/api.js?render=explicit';
const SUBMIT_ENDPOINT = '/contact_validate.php';

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

function renderRecaptcha(form) {
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

function getRecaptchaResponse(form) {
    const container = form.querySelector('[data-recaptcha]');
    if (!container || container.dataset.rendered !== 'true' || !window.grecaptcha) return '';
    return window.grecaptcha.getResponse(Number(container.dataset.widgetId));
}

function resetRecaptcha(form) {
    const container = form.querySelector('[data-recaptcha]');
    if (!container || container.dataset.rendered !== 'true' || !window.grecaptcha) return;
    window.grecaptcha.reset(Number(container.dataset.widgetId));
}

function setFieldError(field, message) {
    const wrapper = field.closest('.contact-form__field');
    if (!wrapper) return;

    const errorEl = wrapper.querySelector('.contact-form__error');

    if (message) {
        wrapper.classList.add('has-error');
        field.setAttribute('aria-invalid', 'true');
        if (errorEl) errorEl.textContent = message;
    } else {
        wrapper.classList.remove('has-error');
        field.removeAttribute('aria-invalid');
        if (errorEl) errorEl.textContent = '';
    }
}

function validateField(field) {
    const value = field.value.trim();

    if (field.hasAttribute('required') && !value) {
        setFieldError(field, 'This field is required.');
        return false;
    }

    if (field.type === 'email' && value && !EMAIL_PATTERN.test(value)) {
        setFieldError(field, 'Enter a valid email address.');
        return false;
    }

    if (field.type === 'tel' && value && !PHONE_PATTERN.test(value)) {
        setFieldError(field, 'Enter a valid phone number.');
        return false;
    }

    setFieldError(field, '');
    return true;
}

export function initContactForm(selector = '.contact-form') {
    const form = document.querySelector(selector);
    if (!form) return;

    const fields = Array.from(form.querySelectorAll('.contact-form__control'));
    const statusEl = form.querySelector('.contact-form__status');
    const submitBtn = form.querySelector('.contact-form__submit');

    renderRecaptcha(form);

    fields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            if (field.closest('.contact-form__field')?.classList.contains('has-error')) {
                validateField(field);
            }
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const isValid = fields.reduce((valid, field) => validateField(field) && valid, true);

        if (!isValid) {
            if (statusEl) {
                statusEl.textContent = 'Please fix the highlighted fields and try again.';
                statusEl.dataset.state = 'error';
            }
            const firstError = form.querySelector('.contact-form__field.has-error .contact-form__control');
            firstError?.focus();
            return;
        }

        const recaptchaResponse = getRecaptchaResponse(form);
        if (!recaptchaResponse) {
            if (statusEl) {
                statusEl.textContent = "Please confirm you're not a robot.";
                statusEl.dataset.state = 'error';
            }
            return;
        }

        if (submitBtn) submitBtn.disabled = true;
        if (statusEl) {
            statusEl.textContent = 'Sending your message…';
            statusEl.dataset.state = 'pending';
        }

        try {
            const formData = new FormData(form);
            formData.set('g-recaptcha-response', recaptchaResponse);

            const res = await fetch(SUBMIT_ENDPOINT, { method: 'POST', body: formData });
            const data = await res.json();

            if (statusEl) {
                statusEl.textContent = data.message || (data.success
                    ? "Thanks — we've received your message and will be in touch within one business day."
                    : 'Something went wrong. Please try again.');
                statusEl.dataset.state = data.success ? 'success' : 'error';
            }

            if (data.success) form.reset();
            resetRecaptcha(form);
        } catch (err) {
            if (statusEl) {
                statusEl.textContent = 'Something went wrong. Please check your connection and try again.';
                statusEl.dataset.state = 'error';
            }
            resetRecaptcha(form);
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}
