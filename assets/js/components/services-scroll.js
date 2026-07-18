/**
 * Envizon Studio - Pinned Stacked-Card Services
 * Renders 6 service cards from a single data array, then GSAP ScrollTrigger
 * pins the section only for the scroll distance needed to step through them:
 * each new card slides up from below (translateY + scale + opacity) and
 * overlays the previous one via z-index, scrubbed bidirectionally so
 * scrolling back up reverses the sequence exactly. The pin releases
 * automatically after the last card and normal scrolling continues straight
 * into the next section.
 */

const SERVICES = [
  {
    title: "UI/UX Design",
    description:
      "Most digital products fail not because they're badly built — but because they were never truly understood. Users leave because the experience fights them instead of guiding them.",
    impact:
      "Clients see an average 40% reduction in drop-off and 2.8× increase in task completion rates within 60 days of launch.",
    tags: [
      "User Research",
      "Information Architecture",
      "Interaction Design",
      "Usability Testing",
    ],
  },
  {
    title: "Web Design",
    description:
      "A beautiful layout means nothing if it slows people down. We design pages that load fast, read clearly, and move visitors toward a decision on every scroll.",
    impact:
      "Redesigned sites convert 35% more visitors on average, with bounce rate dropping within the first two weeks live.",
    tags: [
      "Visual Design",
      "Responsive Layouts",
      "Design Systems",
      "Prototyping",
    ],
  },
  {
    title: "Web Development",
    description:
      "Design without solid engineering behind it breaks under real traffic. We build fast, resilient front ends that hold up as products and teams grow.",
    impact:
      "Pages ship with sub-1.5s load times and 98+ Lighthouse scores, cutting infrastructure cost alongside bounce rate.",
    tags: [
      "Front-End Engineering",
      "CMS Integration",
      "Performance Tuning",
      "API Integration",
    ],
  },
  {
    title: "Branding & Identity",
    description:
      "A logo is not a brand. We build identity systems that hold together across every touchpoint, so recognition compounds instead of resetting each time.",
    impact:
      "Brands we relaunch report 3× higher recall in customer surveys within the first quarter.",
    tags: [
      "Logo Design",
      "Brand Guidelines",
      "Visual Identity",
      "Art Direction",
    ],
  },
  {
    title: "CRO Optimization",
    description:
      "Traffic without conversion is just spend. We test what actually changes behavior, not what looks clever in a deck.",
    impact:
      "Ongoing CRO programs typically lift conversion rate by 20-45% within two quarters of testing.",
    tags: [
      "A/B Testing",
      "Funnel Analysis",
      "Heatmap Tracking",
      "Copy Optimization",
    ],
  },
  {
    title: "Product Strategy",
    description:
      "The best-built feature is wasted if it solves the wrong problem. We align teams on what to build before a single screen gets designed.",
    impact:
      "Teams we advise cut roadmap churn in half and ship validated features one release cycle sooner.",
    tags: [
      "Market Research",
      "Roadmapping",
      "Stakeholder Workshops",
      "Competitive Analysis",
    ],
  },
];

function renderPanels(track) {
  const total = SERVICES.length;

  track.innerHTML = SERVICES.map(
    (service, index) => `
        <article class="service-panel" aria-label="Service ${index + 1} of ${total}: ${service.title}">
            <div class="service-panel__row">
                <div class="service-panel__inner">
                    <div class="service-panel__col">
                        <span class="service-panel__index">${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
                        <h3 class="service-panel__title">${service.title}</h3>
                        <p class="service-panel__desc">${service.description}</p>
                    </div>
                    <div class="service-panel__col">
                        <span class="service-panel__label">Our Approach</span>
                        <div class="service-panel__impact">
                            <span class="service-panel__impact-label">Business Impact</span>
                            <p class="service-panel__impact-text">${service.impact}</p>
                        </div>
                        <ul class="service-panel__tags">
                            ${service.tags.map((tag) => `<li class="service-panel__tag">${tag}</li>`).join("")}
                        </ul>
                    </div>
                </div>
            </div>
        </article>
    `,
  ).join("");
}

// Depth cues — only ever tweened via transform/opacity/filter/box-shadow.
const SHADOW_ACTIVE =
  "0 20px 40px -18px rgba(17,17,17,0.22), 0 6px 16px -8px rgba(17,17,17,0.1)";
const SHADOW_FADED = "0 6px 16px -10px rgba(17,17,17,0.08)";

export function initServicesScroll(sectionSelector = "#servicesScroll") {
  const section = document.querySelector(sectionSelector);
  if (!section) return;

  const stage = section.querySelector(".about-values__stage");
  const track = section.querySelector(".about-values__track");
  if (!stage || !track) return;

  renderPanels(track);

  const panels = Array.from(track.querySelectorAll(".service-panel"));
  if (!panels.length) return;

  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger) {
    panels.forEach((panel, i) => {
      panel.style.position = i === 0 ? "relative" : "absolute";
      panel.classList.add("is-active");
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Native wheel-driven scrolling applies its own inertial easing at the browser
  // level (independent of CSS scroll-behavior), which can momentarily read as a
  // tiny backward scroll to ScrollTrigger mid-gesture. For a plain scrub this is
  // harmless, but with pin:true that single-frame direction flip can make
  // ScrollTrigger briefly consider the pin inactive, collapse the pin-spacer, and
  // yank the whole page back toward the section's start — i.e. exactly the
  // "resets to Card 01" bug. normalizeScroll() makes ScrollTrigger own scroll
  // handling directly so it never misreads that kind of micro-reversal.
  //
  // On mobile, the address bar hiding/showing while the user scrolls fires its
  // own 'resize' event. ScrollTrigger listens for resize to auto-refresh (to
  // account for real layout changes), and a refresh recalculates this section's
  // pinned start/end and repositions scroll to preserve progress. Because that
  // repositioning happens outside of normalizeScroll's own wheel/touch-tracked
  // state, the very next frame normalizeScroll reasserts its last known position
  // over top of it — which is what actually produces the visible "snap back
  // toward the start of the pin" while scrolling. ignoreMobileResize tells
  // ScrollTrigger to disregard address-bar-only resizes so they never trigger
  // that refresh in the first place.
  if (!ScrollTrigger.__envizonNormalized) {
    ScrollTrigger.config({ ignoreMobileResize: true });
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.__envizonNormalized = true;
  }

  const total = panels.length;
  const setActive = (index) => {
    panels.forEach((panel, i) =>
      panel.classList.toggle("is-active", i === index),
    );
  };

  // Resting stack: card 0 up front and in focus. Every later card starts fully
  // hidden (opacity 0) — only the active card, the one card entering, and the
  // one card that just retired are ever non-zero opacity at once, so dense
  // two-column text never double-exposes across more than an adjacent pair.
  panels.forEach((panel, i) => {
    gsap.set(panel, {
      zIndex: i + 1,
      scale: i === 0 ? 1 : 0.95,
      y: i === 0 ? 0 : 100,
      opacity: i === 0 ? 1 : 0,
      filter: i === 0 ? "blur(0px)" : "blur(8px)",
      boxShadow: i === 0 ? SHADOW_ACTIVE : SHADOW_FADED,
    });
  });
  setActive(0);

  // One timeline "unit" per transition between adjacent cards — scrub maps
  // scroll progress onto it directly (bidirectional), so scrolling back up
  // reverses the exact same sequence with no separate reverse logic needed.
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
          const index = Math.min(
            total - 1,
            Math.round(self.progress * (total - 1)),
          );
          setActive(index);
        },
      },
    });

    for (let i = 0; i < total - 1; i++) {
      const outgoing = panels[i];
      const incoming = panels[i + 1];

      // reveal the incoming card into its resting "about to enter" look the
      // instant its segment starts (imperceptible snap, not an animated tween)
      tl.set(
        incoming,
        { opacity: 0, scale: 0.95, y: 100, filter: "blur(8px)" },
        i,
      );

      // fully retire the card from two steps back quickly (finishes in the first
      // half of this segment) so at most one faded "previous" card is ever on
      // screen at once, rather than it lingering through the whole transition
      if (i >= 1) {
        tl.to(
          panels[i - 1],
          { opacity: 0, duration: 0.5, ease: "power1.out" },
          i,
        );
      }

      // outgoing: settles underneath, slightly faded, lower in the stack
      tl.to(
        outgoing,
        {
          scale: 0.96,
          y: -30,
          opacity: 0.6,
          boxShadow: SHADOW_FADED,
          ease: "power3.out",
          duration: 1,
        },
        i,
      );

      // incoming: translateY + scale + shadow drive the full-duration slide-up
      tl.to(
        incoming,
        {
          y: 0,
          scale: 1,
          boxShadow: SHADOW_ACTIVE,
          ease: "power4.out",
          duration: 1,
        },
        i,
      );

      // incoming: opacity + blur resolve quickly (front-loaded) so the card is
      // already fully opaque for most of its slide, avoiding a long translucent
      // overlap with the card underneath it
      tl.to(
        incoming,
        {
          opacity: 1,
          filter: "blur(0px)",
          ease: "power2.out",
          duration: 0.45,
        },
        i,
      );
    }

    return tl;
  };

  // Desktop: pin the whole section (heading + CTA + description + divider +
  // card stage), flush against the literal viewport top — the floating nav
  // auto-hides on scroll-down and is gone by the time the user reaches this
  // section, so no clearance needs to be reserved for it.
  //
  // Mobile/tablet: the nav stays permanently visible there (navbar.js), so
  // only the card stage pins — offset to clear the ~138px nav — while the
  // heading, CTA and description scroll normally above it. Same behavior as
  // the about and services pages' equivalent sections.
  ScrollTrigger.matchMedia({
    "(min-width: 861px)": () => buildTimeline(section, section, "top top"),
    "(max-width: 860px)": () => buildTimeline(stage, stage, "top 140px"),
  });
}
