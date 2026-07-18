import {
  getProjectSlugFromQuery,
  fetchProjectBySlug,
  fetchAllProjects,
  buildProjectCardData,
  calculateRelatedProjects,
} from "./project-utils.js";
import {
  renderProjectCard,
  revealProjectCardsOnScroll,
} from "../assets/js/components/project-card.js";
import { track } from "./shared/analytics.js";

const RELATED_PROJECTS_COUNT = 3;

function getRefs() {
  return {
    section: document.getElementById("relatedProjects"),
    grid: document.getElementById("relatedProjectsGrid"),
  };
}

function renderRelatedProjects(refs, projects, currentSlug) {
  const fragment = document.createDocumentFragment();
  projects.forEach((project) => {
    const cardData = buildProjectCardData(project);
    cardData.tags = []; // Remove tags for related projects section
    const card = renderProjectCard(cardData);
    card.addEventListener("click", () =>
      track("related_project_click", {
        fromSlug: currentSlug,
        toSlug: project.slug,
        toTitle: cardData.title,
      }),
    );
    fragment.appendChild(card);
  });
  refs.grid.appendChild(fragment);
  refs.section.hidden = false;

  revealProjectCardsOnScroll(
    Array.from(refs.grid.querySelectorAll(".project-card")),
    refs.grid,
  );
}

async function init() {
  const refs = getRefs();
  if (!refs.section || !refs.grid) return;

  const slug = getProjectSlugFromQuery();
  if (!slug) return;

  try {
    // fetchProjectBySlug is cached per-slug, so this doesn't duplicate the
    // request project.js already makes for the hero — whichever module
    // calls it first triggers the fetch, the other reuses the same promise.
    const [currentProject, allProjects] = await Promise.all([
      fetchProjectBySlug(slug),
      fetchAllProjects(),
    ]);
    if (!currentProject) return;

    const related = calculateRelatedProjects(
      currentProject,
      allProjects,
      RELATED_PROJECTS_COUNT,
    );
    if (!related.length) return;

    renderRelatedProjects(refs, related, currentProject.slug);
  } catch (err) {
    console.error("Error loading related projects:", err);
  }
}

document.addEventListener("DOMContentLoaded", init);
