import {
  fetchAllProjects,
  getProjectImage,
  isRenderableProject,
  UNTITLED_PROJECT_TITLE,
} from "./project-utils.js";
import { decodeHtmlEntities } from "./wp-utils.js";

const LATEST_COUNT = 4;

// Matches the 4 hand-picked colors from the original static markup, cycled
// per card so the notched-card design keeps its varied look with real data.
const CARD_PALETTE = [
  { bg: "#080337", accent: "#eda922" },
  { bg: "#080337", accent: "#eda922" },
  { bg: "#080337", accent: "#eda922" },
  { bg: "#080337", accent: "#eda922" },
];

// Each services page reuses the same "*-cases" markup/CSS, just with its own
// class and SVG symbol prefix (branding-card, digital-card, ...). serviceSlug
// is the taxonomy term each page prefers — matches the CMS's own service
// term slugs (e.g. a project tagged "branding") once such tags exist.
const PAGE_CONFIGS = [
  { grid: ".branding-cases__grid", prefix: "branding", serviceSlug: "branding" },
  { grid: ".digital-cases__grid", prefix: "digital", serviceSlug: "digital" },
  { grid: ".motion-cases__grid", prefix: "motion", serviceSlug: "motion" },
  { grid: ".strategy-cases__grid", prefix: "strategy", serviceSlug: "strategy" },
];

/**
 * Prefers projects tagged with this page's own service term (newest first,
 * since fetchAllProjects already returns that order), then tops up any
 * remaining slots with the next-latest projects overall — so a page with
 * too few (or zero) tagged projects still shows a full row instead of an
 * empty or half-filled section.
 */
function selectLatestForService(projects, serviceSlug, count) {
  const tagged = projects.filter((project) =>
    (project.service_terms || []).some((term) => term.slug === serviceSlug),
  );
  if (tagged.length >= count) return tagged.slice(0, count);

  const taggedIds = new Set(tagged.map((project) => project.id));
  const fillers = projects
    .filter((project) => !taggedIds.has(project.id))
    .slice(0, count - tagged.length);

  return [...tagged, ...fillers];
}

function createCard(project, prefix, palette) {
  const title = decodeHtmlEntities(project.title?.rendered || UNTITLED_PROJECT_TITLE);
  const href = `project.html?slug=${encodeURIComponent(project.slug || "")}`;

  const card = document.createElement("a");
  card.href = href;
  card.className = `${prefix}-card`;
  card.setAttribute("aria-label", `View ${title} case study`);
  card.style.setProperty("--card-bg", palette.bg);
  card.style.setProperty("--card-accent", palette.accent);

  card.innerHTML = `
        <span class="${prefix}-card__bg">
            <span class="${prefix}-card__logo-wrap">
                <img class="${prefix}-card__logo" src="${getProjectImage(project)}" alt="${title} logo" loading="lazy">
            </span>
        </span>
        <svg class="${prefix}-card__frame" viewBox="0 0 400 178" aria-hidden="true" focusable="false">
            <use href="#${prefix}-card-frame"></use>
        </svg>
        <span class="${prefix}-card__content">
            <h3 class="${prefix}-card__title">${title}</h3>
        </span>
    `;

  return card;
}

async function init() {
  const config = PAGE_CONFIGS.find(({ grid }) => document.querySelector(grid));
  if (!config) return;

  const grid = document.querySelector(config.grid);

  try {
    const projects = await fetchAllProjects();
    const renderable = projects.filter(isRenderableProject);
    const latest = selectLatestForService(renderable, config.serviceSlug, LATEST_COUNT);
    if (!latest.length) return;

    const fragment = document.createDocumentFragment();
    latest.forEach((project, index) => {
      fragment.appendChild(
        createCard(project, config.prefix, CARD_PALETTE[index % CARD_PALETTE.length]),
      );
    });

    // Only replace the static placeholder cards once real ones are ready, so
    // a fetch failure leaves the existing markup as a graceful fallback
    // instead of emptying the section.
    grid.innerHTML = "";
    grid.appendChild(fragment);
  } catch (err) {
    console.error("Error loading latest projects:", err);
  }
}

document.addEventListener("DOMContentLoaded", init);
