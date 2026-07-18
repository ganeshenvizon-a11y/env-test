/**
 * Envizon Studio - Contact Page: Form validation
 * Validates required fields, email and phone formats, surfaces inline
 * errors, renders the reCAPTCHA widget, and submits to contact_validate.php.
 */

import { renderRecaptcha, getRecaptchaResponse, resetRecaptcha } from '../utils/recaptcha.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;
const SUBMIT_ENDPOINT = '/contact_validate.php';

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
