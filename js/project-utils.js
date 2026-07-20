import { CONFIG } from "./config.js";
import { decodeHtmlEntities, FALLBACK_IMAGE } from "./wp-utils.js";

// Single consistent visual treatment for every project card — the existing
// Popl card design (see assets/js/components/project-card.js). Never varies
// per project: no random colors, no color logic driven by project data.
const CARD_BG = "#080337";
const CARD_ACCENT = "#eda922";

// Single fallback title for any project record missing title.rendered —
// shared by the hero, prev/next nav, and related/listing cards so a blank
// title never reaches the DOM.
export const UNTITLED_PROJECT_TITLE = "Untitled Project";

/**
 * A project without a slug can't be linked to (every card/nav item builds
 * its href from it), so it's excluded anywhere projects are turned into
 * clickable cards or nav items — sorting, related-project scoring, etc.
 */
export function isRenderableProject(project) {
  return Boolean(project?.slug);
}

function handleResponse(res) {
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

export function getProjectSlugFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}

const projectRequests = new Map();

/**
 * Fetches a single project by slug (WordPress's ?slug= query param, which
 * returns an array of 0-1 items rather than a single object since slug isn't
 * a native lookup key). Caches the in-flight/resolved promise per slug so
 * independent modules that both need the current project — project.js for
 * the hero, project-related.js for scoring — never trigger a duplicate
 * request.
 */
export function fetchProjectBySlug(slug) {
  if (!projectRequests.has(slug)) {
    projectRequests.set(
      slug,
      fetch(`${CONFIG.API_BASE}/projects?slug=${encodeURIComponent(slug)}`)
        .then(handleResponse)
        .then((projects) => {
          if (!Array.isArray(projects)) {
            throw new Error("Unexpected response format");
          }
          return projects[0] || null;
        })
        .catch((err) => {
          projectRequests.delete(slug);
          throw err;
        }),
    );
  }
  return projectRequests.get(slug);
}

let allProjectsRequest = null;

/**
 * Fetches every project in one request (a generous per_page covers the
 * current catalog size; paginating this call is a future phase), caching
 * the shared promise for the lifetime of the page so any module needing the
 * full catalog — the listing grids, related projects — reuses the same
 * single request instead of each fetching it independently.
 */
export function fetchAllProjects() {
  if (!allProjectsRequest) {
    allProjectsRequest = fetch(`${CONFIG.API_BASE}/projects?per_page=100`)
      .then(handleResponse)
      .then((projects) => {
        if (!Array.isArray(projects)) {
          throw new Error("Unexpected response format");
        }
        return projects;
      })
      .catch((err) => {
        allProjectsRequest = null;
        throw err;
      });
  }
  return allProjectsRequest;
}

export function getProjectImage(project) {
  return project.featured_image || FALLBACK_IMAGE;
}

/**
 * Descriptive alt text for a project's featured image: the media library's
 * own "Alternative Text" field when an editor set one, otherwise the project
 * title (never empty/generic).
 */
export function getProjectImageAlt(project) {
  const altText = project.featured_image_alt?.trim?.();
  return altText || decodeHtmlEntities(project.title?.rendered || UNTITLED_PROJECT_TITLE);
}

/**
 * Maps a WordPress project record onto the shared ProjectCard component's
 * data shape, reusing its existing card design instead of introducing a new
 * one. Assigned Services taxonomy terms are shown via the card's tag pills —
 * the only text slot besides the title that the shared component exposes.
 */
export function buildProjectCardData(project) {
  return {
    title: decodeHtmlEntities(project.title?.rendered || UNTITLED_PROJECT_TITLE),
    logo: getProjectImage(project),
    logoAlt: getProjectImageAlt(project),
    fallbackLogo: FALLBACK_IMAGE,
    bgColor: CARD_BG,
    accentColor: CARD_ACCENT,
    tags: (Array.isArray(project.service_terms) ? project.service_terms : [])
      .slice(0, 3)
      .map((term) => decodeHtmlEntities(term.name || "").trim())
      .filter(Boolean),
    url: `project.html?slug=${encodeURIComponent(project.slug || "")}`,
  };
}

/**
 * Single shared source of truth for "display order" across the site: every
 * featured project (in catalog order), followed by every non-featured
 * project (in catalog order). Mirrors the Featured-then-All-Projects reading
 * order of projects.html, but flattened and deduplicated into one list so
 * consumers like Previous/Next navigation never see the same project twice.
 */
export function sortProjectsForDisplay(projects) {
  const renderable = projects.filter(isRenderableProject);
  const featured = renderable.filter((project) => project.acf?.featured_project);
  const featuredIds = new Set(featured.map((project) => project.id));
  const rest = renderable.filter((project) => !featuredIds.has(project.id));
  return [...featured, ...rest];
}

const SERVICE_SHARE_SCORE = 3;
const FEATURED_SCORE = 1;

/**
 * +3 points per service taxonomy term the candidate shares with the current
 * project (matched by slug, not name, so a service rename doesn't silently
 * break scoring), plus +1 if the candidate itself is a featured project.
 */
export function scoreProject(project, currentProject) {
  const currentSlugs = new Set(
    (Array.isArray(currentProject.service_terms) ? currentProject.service_terms : [])
      .map((term) => term.slug)
      .filter(Boolean),
  );

  const sharedServiceCount = (
    Array.isArray(project.service_terms) ? project.service_terms : []
  ).filter((term) => term.slug && currentSlugs.has(term.slug)).length;

  let score = sharedServiceCount * SERVICE_SHARE_SCORE;
  if (project.acf?.featured_project) score += FEATURED_SCORE;
  return score;
}

/**
 * Scores every other project against the current one and sorts by score
 * descending. Array.prototype.sort is stable, so projects tied at the same
 * score (including the common 0-score case) keep their original catalog
 * order — this alone satisfies the "fill remaining slots in their existing
 * order" fallback rule, with no separate branch needed for it.
 */
export function calculateRelatedProjects(currentProject, allProjects, limit = 3) {
  const currentId = currentProject.id;
  const others = allProjects.filter(
    (project) => project.id !== currentId && isRenderableProject(project),
  );

  return others
    .map((project) => ({ project, score: scoreProject(project, currentProject) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.project);
}
