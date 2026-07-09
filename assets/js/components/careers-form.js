/**
 * Envizon Studio - Careers Page: Application form validation
 * Client-side only: validates required fields, email/phone/URL formats and
 * the resume upload, surfaces inline errors, and shows a success state on
 * valid submission. There is no backend wired up yet, so a valid submit
 * simply confirms receipt to the applicant and resets the form.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/;
const URL_PATTERN = /^https?:\/\/.+\..+/i;
const RESUME_ACCEPT = ['.pdf', '.doc', '.docx'];
const RESUME_MAX_BYTES = 5 * 1024 * 1024;

function setFieldError(field, message) {
    const wrapper = field.closest('.careers-form__field');
    if (!wrapper) return;

    const errorEl = wrapper.querySelector('.careers-form__error');

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

    if (field.type === 'file') {
        const file = field.files && field.files[0];

        if (field.hasAttribute('required') && !file) {
            setFieldError(field, 'Please attach your resume.');
            return false;
        }

        if (file) {
            const hasValidExtension = RESUME_ACCEPT.some(ext => file.name.toLowerCase().endsWith(ext));
            if (!hasValidExtension) {
                setFieldError(field, 'Upload a PDF or Word document.');
                return false;
            }
            if (file.size > RESUME_MAX_BYTES) {
                setFieldError(field, 'File must be under 5MB.');
                return false;
            }
        }

        setFieldError(field, '');
        return true;
    }

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

    if (field.type === 'url' && value && !URL_PATTERN.test(value)) {
        setFieldError(field, 'Enter a valid URL, starting with http(s)://');
        return false;
    }

    setFieldError(field, '');
    return true;
}

function initResumeField(form) {
    const fileInput = form.querySelector('.careers-form__file-input');
    if (!fileInput) return;

    const nameEl = form.querySelector('.careers-form__file-name');
    const defaultLabel = nameEl ? nameEl.textContent : '';

    fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        if (!nameEl) return;

        if (file) {
            nameEl.textContent = file.name;
            nameEl.dataset.hasFile = 'true';
        } else {
            nameEl.textContent = defaultLabel;
            nameEl.dataset.hasFile = 'false';
        }

        validateField(fileInput);
    });
}

export function initCareersForm(selector = '.careers-form') {
    const form = document.querySelector(selector);
    if (!form) return;

    const fields = Array.from(form.querySelectorAll('.careers-form__control'));
    const statusEl = form.querySelector('.careers-form__status');

    initResumeField(form);

    fields.forEach(field => {
        const eventName = field.type === 'file' || field.tagName === 'SELECT' ? 'change' : 'blur';
        field.addEventListener(eventName, () => validateField(field));
        field.addEventListener('input', () => {
            if (field.closest('.careers-form__field')?.classList.contains('has-error')) {
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
            const firstError = form.querySelector('.careers-form__field.has-error .careers-form__control');
            firstError?.focus();
            return;
        }

        if (statusEl) {
            statusEl.textContent = "Thanks — we've received your application and will be in touch if there's a fit.";
            statusEl.dataset.state = 'success';
        }
        form.reset();

        const nameEl = form.querySelector('.careers-form__file-name');
        if (nameEl) {
            nameEl.textContent = 'No file chosen';
            nameEl.dataset.hasFile = 'false';
        }
    });
}
