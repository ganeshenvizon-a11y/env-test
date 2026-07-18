const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';

const VALUES = [
    {
        title: 'Brand Strategy',
        description: 'We define the positioning, personality, and platform for brands poised to disrupt their markets and capture lasting value.',
        label: 'STRUCTURAL REBRANDING',
        companies: [
            { name: 'Aakash', url: '#' },
            { name: 'PolySoft', url: '#' },
            { name: 'ISRO', url: '#' },
            { name: 'DhwibhasI', url: '#' },
            { name: 'Amazon', url: '#' },
            { name: 'AuraFarms', url: '#' }
        ],
        checklist: [
            "Rebrand or refresh",
            "Brand Strategy",
            "Web Design",
            "Visual Identity",
            "Logo Design",
            "Competitive Positioning",
            "Brand Guidelines"
        ]
    },
    {
        title: 'Communication Design',
        description: 'We translate complex value propositions into clear, compelling visual narratives that connect across touchpoints.',
        label: 'VISUAL NARRATIVES',
        companies: [
            { name: 'PolySoft', url: '#' },
            { name: 'DhwibhasI', url: '#' },
            { name: 'Amazon', url: '#' },
            { name: 'Google', url: '#' },
            { name: 'Microsoft', url: '#' }
        ],
        checklist: [
            "Marketing Collateral",
            "Pitch Decks",
            "Social Media Kit",
            "Infographics",
            "Copywriting",
            "Illustration & Iconography",
            "Campaign Graphics"
        ]
    },
    {
        title: 'Product Design',
        description: 'We design intuitive interfaces and engaging user experiences that make complex digital systems effortless to use.',
        label: 'DIGITAL EXPERIENCES',
        companies: [
            { name: 'Aakash', url: '#' },
            { name: 'ISRO', url: '#' },
            { name: 'AuraFarms', url: '#' },
            { name: 'Netflix', url: '#' },
            { name: 'Airbnb', url: '#' }
        ],
        checklist: [
            "User Interface Design",
            "User Experience Design",
            "Wireframing & Prototyping",
            "User Journey Mapping",
            "Design Systems",
            "Usability Testing",
            "Interaction Design"
        ]
    },
    {
        title: 'Digital Development',
        description: 'We build high-performance web frontends and robust systems that are secure, scalable, and optimized for speed.',
        label: 'ENGINEERING EXCELLENCE',
        companies: [
            { name: 'PolySoft', url: '#' },
            { name: 'Amazon', url: '#' },
            { name: 'AuraFarms', url: '#' },
            { name: 'Stripe', url: '#' },
            { name: 'Vercel', url: '#' }
        ],
        checklist: [
            "Front-End Development",
            "Back-End Integration",
            "Performance Optimization",
            "SEO & Accessibility",
            "CMS Implementations",
            "Custom Web Apps",
            "Quality Assurance"
        ]
    }
];

function renderCards(track) {
    const total = VALUES.length;

    track.innerHTML = VALUES.map((value, index) => `
        <article class="value-card" aria-label="${index + 1} of ${total}: ${value.title}">
            <div class="value-card__inner">
                <div class="value-card__col value-card__col--left">
                    <div>
                        <span class="value-card__index">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
                        <h3 class="value-card__title">${value.title}</h3>
                    </div>
                    <div class="value-card__companies">
                        <span class="value-card__companies-title">Companies Delivered</span>
                        <ul class="value-card__companies-list">
                            ${value.companies.map(c => `
                                <li>
                                    <a href="${c.url}" class="value-card__company-pill">
                                        ${c.name} <span class="value-card__company-arrow">↗</span>
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                <div class="value-card__col">
                    <span class="value-card__label">${value.label}</span>
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

export function initServicesValues(sectionSelector = '#servicesValues') {
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

        // Initial state for checklist items
        gsap.set(card.querySelectorAll('.value-card__check-item'), {
            opacity: i === 0 ? 1 : 0,
            x: i === 0 ? 0 : -15
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

            tl.to(incoming.querySelectorAll('.value-card__check-item'), {
                opacity: 1,
                x: 0,
                stagger: 0.08,
                duration: 0.6,
                ease: 'power2.out'
            }, i + 0.1);
        }

        return tl;
    };

    // Desktop: pin the whole section (heading + CTA + description + divider
    // + card stage), flush against the literal viewport top — the floating
    // nav auto-hides on scroll-down and is gone by the time the user reaches
    // this section, so no clearance needs to be reserved for it.
    //
    // Mobile/tablet: the nav stays permanently visible there (navbar.js), so
    // only the card stage pins — offset to clear the ~138px nav — while the
    // heading, CTA and description scroll normally above it. Same behavior
    // as the about page's equivalent section (about-values.js).
    ScrollTrigger.matchMedia({
        '(min-width: 861px)': () => buildTimeline(section, section, 'top top'),
        '(max-width: 860px)': () => buildTimeline(stage, stage, 'top 140px')
    });
}
