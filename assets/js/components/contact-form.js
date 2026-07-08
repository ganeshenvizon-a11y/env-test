/**
 * Envizon Studio - Contact Page: Form validation
 * Client-side only: validates required fields, email and phone formats,
 * surfaces inline errors, and shows a success state on valid submission.
 * There is no backend wired up yet, so a valid submit simply confirms
 * receipt to the visitor and resets the form.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;

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

    fields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            if (field.closest('.contact-form__field')?.classList.contains('has-error')) {
                validateField(field);
            }
        });
    });

    form.addEventListener('submit', (event) => {
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

        if (statusEl) {
            statusEl.textContent = "Thanks — we've received your message and will be in touch within one business day.";
            statusEl.dataset.state = 'success';
        }
        form.reset();
    });
}
