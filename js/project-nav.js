import { decodeHtmlEntities } from "./wp-utils.js";
import {
  getProjectSlugFromQuery,
  fetchProjectBySlug,
  fetchAllProjects,
  sortProjectsForDisplay,
  UNTITLED_PROJECT_TITLE,
} from "./project-utils.js";
import { track } from "./shared/analytics.js";

const ARROW_PREV_SRC = "assets/images/services/project-nav-arrow-prev.svg";
const ARROW_NEXT_SRC = "assets/images/services/project-nav-arrow-next.svg";

/**
 * Reuses the exact case-study-summary/case-study-header/poly-ai markup and
 * classes the Figma design already ships with (see services-case-study.css)
 * — only the title, link and arrow direction are dynamic. The arrow leads
 * for "prev" and trails for "next", mirroring the original single static
 * instance's arrow-then-title order.
 */
function createNavItem(project, direction, currentSlug) {
  const isPrev = direction === "prev";
  const href = `project.html?slug=${encodeURIComponent(project.slug || "")}`;
  const title = decodeHtmlEntities(project.title?.rendered || UNTITLED_PROJECT_TITLE);
  const arrowSrc = isPrev ? ARROW_PREV_SRC : ARROW_NEXT_SRC;
  const arrow = `
    <div class="case-study-logo-wrapper">
      <img class="case-study-logo-wrapper-child" alt="" src="${arrowSrc}">
    </div>`;
  // title is CMS text, not markup — kept out of the innerHTML template below
  // and set via textContent so literal HTML in a project title can't be
  // parsed as markup.
  const heading = `<h2 class="poly-ai"></h2>`;

  const item = document.createElement("a");
  item.className = "case-study-summary";
  item.href = href;
  item.setAttribute(
    "aria-label",
    `${isPrev ? "Previous" : "Next"} project: ${title}`,
  );
  item.innerHTML = `
    <div class="case-study-header">
      ${isPrev ? arrow + heading : heading + arrow}
    </div>
  `;
  item.querySelector(".poly-ai").textContent = title;
  item.addEventListener("click", () =>
    track(isPrev ? "project_nav_previous_click" : "project_nav_next_click", {
      fromSlug: currentSlug,
      toSlug: project.slug,
      toTitle: title,
    }),
  );
  return item;
}

/**
 * Prev/Next are derived from the site-wide display order (Featured projects,
 * then all remaining projects — see sortProjectsForDisplay) and wrap around:
 * the first project's previous is the last, the last project's next is the
 * first. Returns nulls when there's nothing to navigate to (fewer than two
 * projects total).
 */
function selectAdjacentProjects(allProjects, currentId) {
  const ordered = sortProjectsForDisplay(allProjects);
  if (ordered.length < 2) return { prevProject: null, nextProject: null };

  const currentIndex = ordered.findIndex((project) => project.id === currentId);
  if (currentIndex === -1) return { prevProject: null, nextProject: null };

  const prevProject = ordered[(currentIndex - 1 + ordered.length) % ordered.length];
  const nextProject = ordered[(currentIndex + 1) % ordered.length];
  return { prevProject, nextProject };
}

function renderNav(nav, { prevProject, nextProject }, currentSlug) {
  if (!prevProject || !nextProject) return;

  nav.innerHTML = "";
  nav.appendChild(createNavItem(prevProject, "prev", currentSlug));
  nav.appendChild(createNavItem(nextProject, "next", currentSlug));
  nav.hidden = false;
}

async function init() {
  const nav = document.getElementById("projectNav");
  if (!nav) return;

  const slug = getProjectSlugFromQuery();
  if (!slug) return;

  try {
    // fetchProjectBySlug/fetchAllProjects are cached, so this reuses the
    // same requests project.js and project-related.js already make for the
    // current page — no duplicate network calls.
    const [currentProject, allProjects] = await Promise.all([
      fetchProjectBySlug(slug),
      fetchAllProjects(),
    ]);
    if (!currentProject) return;

    renderNav(nav, selectAdjacentProjects(allProjects, currentProject.id), currentProject.slug);
  } catch (err) {
    console.error("Error loading project navigation:", err);
  }
}

document.addEventListener("DOMContentLoaded", init);
