/**
 * Envizon Studio - Careers Page: Open Positions
 * Renders every job listing from a single data array through one
 * reusable card template — no duplicated markup per opening.
 */

const OPENINGS = [
    {
        title: 'UI/UX Designer',
        department: 'Design',
        location: 'Hyderabad',
        type: 'Full-time',
        description: 'Create compelling experiences for path-breaking applications spanning responsive web, mobile, and TV — engaged throughout the entire product development lifecycle.'
    },
    {
        title: 'Lead Graphic Designer',
        department: 'Design',
        location: 'Hyderabad',
        type: 'Full-time',
        description: 'Translate complex business, product, and content requirements into clear visual direction, with a strong grasp of UX principles and the ability to lead project goals and people.'
    },
    {
        title: 'Marketing Manager',
        department: 'Marketing',
        location: 'Hyderabad',
        type: 'Full-time',
        description: 'A street-smart, sales-focused role engaging customers across industries, with a benefit package that rewards performance through commission on top of a base salary.'
    }
];

function createJobCard(job) {
    const card = document.createElement('article');
    card.className = 'job-card';

    card.innerHTML = `
        <div class="job-card__meta">
            <span class="job-card__tag">${job.department}</span>
            <span class="job-card__tag">${job.location}</span>
            <span class="job-card__tag">${job.type}</span>
        </div>
        <h3 class="job-card__title">${job.title}</h3>
        <p class="job-card__desc">${job.description}</p>
        <a href="#careers-form" class="job-card__apply" data-position="${job.title}">
            Apply Now
            <span aria-hidden="true">↗</span>
        </a>
    `;

    return card;
}

function revealCards(cards) {
    if (window.gsap && window.ScrollTrigger) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        cards.forEach(card => card.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    cards.forEach(card => observer.observe(card));
}

export function initCareersOpenings(root = '.careers-openings') {
    const section = document.querySelector(root);
    if (!section) return;

    const grid = section.querySelector('.careers-openings__grid');
    if (!grid) return;

    if (!OPENINGS.length) {
        grid.innerHTML = '<p class="careers-openings__empty">There are no open positions right now — check back soon or send us your CV anyway.</p>';
        return;
    }

    const cards = OPENINGS.map(createJobCard);
    cards.forEach(card => grid.appendChild(card));

    revealCards(cards);

    grid.addEventListener('click', (event) => {
        const trigger = event.target.closest('.job-card__apply');
        if (!trigger) return;

        const positionField = document.querySelector('#careers-position');
        if (positionField) {
            const position = trigger.dataset.position;
            const optionExists = Array.from(positionField.options).some(opt => opt.value === position);
            if (optionExists) positionField.value = position;
        }
    });
}
