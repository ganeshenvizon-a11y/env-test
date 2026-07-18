import { initShowcaseCarousel } from "./components/carousel.js";
import { initServicesNav } from "./components/services-ticker.js";
import { initServicesScroll } from "./components/services-scroll.js";
import { initHowWeWork } from "./components/how-we-work.js";
import { initWorkflowShowcase } from "./components/workflow-showcase.js";
import { initFaq } from "./components/faq.js";
import { initInsights } from "./components/insights.js";
import { initTestimonials } from "./components/testimonials.js";
import { initContactPopup } from "./components/contact-popup.js";

document.addEventListener("DOMContentLoaded", () => {
  const carousel = initShowcaseCarousel("#showcaseCarousel");
  initServicesNav("#servicesTicker");
  initServicesScroll("#servicesScroll");
  initHowWeWork(".how-we-work");
  initWorkflowShowcase(".workflow-showcase");
  initFaq(".faq__accordion");
  initInsights(".insights");
  initTestimonials(".testimonials");
  initContactPopup();
});

/**
 * Animate service cards into view on scroll
 */
window.addEventListener("load", () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = "fadeInUp 0.6s ease forwards";
      }
    });
  }, observerOptions);

  document.querySelectorAll(".service-card").forEach((card) => {
    observer.observe(card);
  });
});
