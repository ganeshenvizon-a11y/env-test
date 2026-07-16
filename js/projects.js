import { CONFIG } from "./config.js";
import { decodeHtmlEntities, FALLBACK_IMAGE } from "./wp-utils.js";
import {
  renderProjectCard,
  revealProjectCardsOnScroll,
} from "../assets/js/components/project-card.js";

// Single consistent visual treatment for every project card — the existing
// Popl card design (see assets/js/components/project-card.js). Never varies
// per project: no random colors, no color logic driven by project data.
const CARD_BG = "linear-gradient(180deg, #2b1214 0%, #6b1f2b 100%)";
const CARD_ACCENT = "#F4A825";

function handleResponse(res) {
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

/**
 * Fetches every project in one request (a generous per_page covers the
 * current catalog size; paginating this call is a future phase).
 */
function fetchProjects() {
  return fetch(`${CONFIG.API_BASE}/projects?per_page=100`).then(
    handleResponse,
  );
}

function getProjectImage(project) {
  return project.featured_image || FALLBACK_IMAGE;
}

/**
 * Maps a WordPress project record onto the shared ProjectCard component's
 * data shape, reusing its existing card design instead of introducing a new
 * one. Client name and hero subtitle are shown via the card's tag pills —
 * the only text slot besides the title that the shared component exposes.
 */
function buildCardData(project) {
  const acf = project.acf || {};
  return {
    title: decodeHtmlEntities(project.title?.rendered || ""),
    logo: getProjectImage(project),
    bgColor: CARD_BG,
    accentColor: CARD_ACCENT,
    tags: [acf.client_name, acf.hero_subtitle].filter(Boolean),
    url: `project.html?slug=${encodeURIComponent(project.slug || "")}`,
  };
}

function showState(grid, message, { retry } = {}) {
  grid.innerHTML = "";
  const state = document.createElement("div");
  state.className = "loading-state";
  state.textContent = message;

  if (retry) {
    const retryBtn = document.createElement("button");
    retryBtn.type = "button";
    retryBtn.className = "btn btn-secondary";
    retryBtn.textContent = "Try Again";
    retryBtn.addEventListener("click", retry);
    state.appendChild(document.createElement("br"));
    state.appendChild(retryBtn);
  }

  grid.appendChild(state);
}

function renderProjects(grid, projects) {
  grid.innerHTML = "";

  if (!projects.length) {
    showState(grid, "No projects published yet — check back soon.");
    return;
  }

  const fragment = document.createDocumentFragment();
  projects.forEach((project) =>
    fragment.appendChild(renderProjectCard(buildCardData(project))),
  );
  grid.appendChild(fragment);

  revealProjectCardsOnScroll(Array.from(grid.querySelectorAll(".project-card")));
}

async function loadProjects(grid) {
  showState(grid, "Loading projects…");

  try {
    const projects = await fetchProjects();
    if (!Array.isArray(projects)) throw new Error("Unexpected response format");
    renderProjects(grid, projects);
  } catch (err) {
    console.error("Error loading projects:", err);
    showState(grid, "We couldn’t load projects right now.", {
      retry: () => loadProjects(grid),
    });
  }
}

function init() {
  const grid = document.getElementById("projectsFeaturedBrandsGrid");
  if (!grid) return;
  loadProjects(grid);
}

document.addEventListener("DOMContentLoaded", init);
