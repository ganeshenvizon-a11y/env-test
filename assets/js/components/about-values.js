/**
 * Envizon Studio - About Page: Pinned Stacked-Card Values
 * Same technique as the homepage's services-scroll.js: renders N cards from
 * a single data array, then GSAP ScrollTrigger pins the section only for the
 * scroll distance needed to step through them. Each new card slides up from
 * below (translateY + scale + opacity) and overlays the previous one via
 * z-index, scrubbed bidirectionally so scrolling back up reverses the
 * sequence exactly. The pin releases automatically after the last card.
 */

const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';

const VALUES = [
    {
        title: 'The Uncharted',
        description: "Most digital products fail not because they're badly built — but because they were never truly understood. Users leave because the experience fights them instead of guiding them.",
        checklist: [
            "The unknown is where we do our best work. New products with no playbook, no existing identity, no precedent — that's not a risk to us, it's the brief we want.",
            "We're happiest diving into problems nobody's solved yet."
        ]
    },
    {
        title: 'The Breakthrough',
        description: "Most digital products fail not because they're badly built — but because they were never truly understood. Users leave because the experience fights them instead of guiding them.",
        checklist: [
            "The unknown is where we do our best work. New products with no playbook, no existing identity, no precedent — that's not a risk to us, it's the brief we want.",
            "We're happiest diving into problems nobody's solved yet."
        ]
    },
    {
        title: 'The Craft',
        description: "Most digital products fail not because they're badly built — but because they were never truly understood. Users leave because the experience fights them instead of guiding them.",
        checklist: [
            "The unknown is where we do our best work. New products with no playbook, no existing identity, no precedent — that's not a risk to us, it's the brief we want.",
            "We're happiest diving into problems nobody's solved yet."
        ]
    },
    {
        title: 'The Commitment',
        description: "Most digital products fail not because they're badly built — but because they were never truly understood. Users leave because the experience fights them instead of guiding them.",
        checklist: [
            "The unknown is where we do our best work. New products with no playbook, no existing identity, no precedent — that's not a risk to us, it's the brief we want.",
            "We're happiest diving into problems nobody's solved yet."
        ]
    }
];

function renderCards(track) {
    const total = VALUES.length;

    track.innerHTML = VALUES.map((value, index) => `
        <article class="value-card" aria-label="${index + 1} of ${total}: ${value.title}">
            <div class="value-card__inner">
                <div class="value-card__col">
                    <span class="value-card__index">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
                    <h3 class="value-card__title">${value.title}</h3>
                    <p class="value-card__desc">${value.description}</p>
                </div>
                <div class="value-card__col">
                    <span class="value-card__label">Our Approach</span>
                    <ul class="value-card__checklist">
                        ${value.checklist.map(item => `
                            <li class="value-card__check-item">
                                <span class="value-card__check-icon" aria-hidden="true">${CHECK_ICON}</span>
                                <span class="value-card__check-text">${item}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </article>
    `).join('');
}

const SHADOW_ACTIVE = '0 20px 40px -18px rgba(17,17,17,0.22), 0 6px 16px -8px rgba(17,17,17,0.1)';
const SHADOW_FADED = '0 6px 16px -10px rgba(17,17,17,0.08)';

export function initAboutValues(sectionSelector = '#aboutValues') {
    const section = document.querySelector(sectionSelector);
    if (!section) return;

    const stage = section.querySelector('.about-values__stage');
    const track = section.querySelector('.about-values__track');
    if (!stage || !track) return;

    renderCards(track);

    const cards = Array.from(track.querySelectorAll('.value-card'));
    if (!cards.length) return;

    const { gsap, ScrollTrigger } = window;

    if (!gsap || !ScrollTrigger) {
        cards.forEach((card, i) => {
            card.style.position = i === 0 ? 'relative' : 'absolute';
            card.classList.add('is-active');
        });
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (!ScrollTrigger.__envizonNormalized) {
        ScrollTrigger.config({ ignoreMobileResize: true });
        ScrollTrigger.normalizeScroll(true);
        ScrollTrigger.__envizonNormalized = true;
    }

    const total = cards.length;
    const setActive = (index) => {
        cards.forEach((card, i) => card.classList.toggle('is-active', i === index));
    };

    cards.forEach((card, i) => {
        gsap.set(card, {
            zIndex: i + 1,
            scale: i === 0 ? 1 : 0.95,
            y: i === 0 ? 0 : 100,
            opacity: i === 0 ? 1 : 0,
            filter: i === 0 ? 'blur(0px)' : 'blur(8px)',
            boxShadow: i === 0 ? SHADOW_ACTIVE : SHADOW_FADED
        });
    });
    setActive(0);

    const buildTimeline = (pinTarget, triggerTarget, start) => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: triggerTarget,
                start,
                end: () => `+=${(total - 1) * window.innerHeight * 0.6}`,
                scrub: 1,
                pin: pinTarget,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate(self) {
                    const index = Math.min(total - 1, Math.round(self.progress * (total - 1)));
                    setActive(index);
                }
            }
        });

        for (let i = 0; i < total - 1; i++) {
            const outgoing = cards[i];
            const incoming = cards[i + 1];

            tl.set(incoming, { opacity: 0, scale: 0.95, y: 100, filter: 'blur(8px)' }, i);

            if (i >= 1) {
                tl.to(cards[i - 1], { opacity: 0, duration: 0.5, ease: 'power1.out' }, i);
            }

            tl.to(outgoing, {
                scale: 0.96,
                y: -30,
                opacity: 0.6,
                boxShadow: SHADOW_FADED,
                ease: 'power3.out',
                duration: 1
            }, i);

            tl.to(incoming, {
                y: 0,
                scale: 1,
                boxShadow: SHADOW_ACTIVE,
                ease: 'power4.out',
                duration: 1
            }, i);

            tl.to(incoming, {
                opacity: 1,
                filter: 'blur(0px)',
                ease: 'power2.out',
                duration: 0.45
            }, i);
        }

        return tl;
    };

    // Desktop: pin the whole section (heading + CTA + description + divider
    // + card stage) — not just the stage — so the complete layout stays
    // visible and motionless while only the cards animate inside it. Pins
    // flush against the literal viewport top: the floating nav (navbar.js)
    // auto-hides itself on scroll-down and is gone well before the user
    // reaches this section, so reserving clearance for it here just left a
    // dead gap above the pinned section instead of the section actually
    // touching the top of the browser.
    //
    // Mobile/tablet: the nav never auto-hides there (navbar.js keeps it
    // permanently visible on touch devices), and screen height is tight, so
    // pinning the full section would either collide with the nav or crowd
    // out the cards. There, only the card stage itself pins — the heading,
    // CTA and description scroll normally above it — clearing the ~138px
    // nav the same way this used to work before the whole-section pin was
    // introduced for desktop.
    ScrollTrigger.matchMedia({
        '(min-width: 861px)': () => buildTimeline(section, section, 'top top'),
        '(max-width: 860px)': () => buildTimeline(stage, stage, 'top 140px')
    });
}
