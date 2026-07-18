import { decodeHtmlEntities } from "./wp-utils.js";
import { fetchAllProjects, buildProjectCardData } from "./project-utils.js";
import {
  renderProjectCard,
  revealProjectCardsOnScroll,
} from "../assets/js/components/project-card.js";
import { renderBreadcrumbs } from "./breadcrumbs.js";
import { showState } from "./shared/loading-state.js";

/**
 * projects.html keeps the logo and accent frame but drops the service-taxonomy
 * tag pills — this page is a visual brand showcase, not a filtered catalog
 * entry, so the tags (already surfaced via the filter chips above) are noise
 * here. Other sections (home page, related projects, services pages) keep
 * their tags untouched since they build their own card data separately.
 */
function buildCardData(project) {
  return { ...buildProjectCardData(project), tags: [] };
}

// Featured section shows at most this many cards.
const FEATURED_LIMIT = 6;
const SEARCH_DEBOUNCE_MS = 200;

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Partitions projects into the Featured (curated, capped subset) and All
 * Projects (complete archive, including featured ones) sections. The two
 * arrays overlap by design — Featured Projects is a showcase, not a filter.
 * Neither search nor the service filter ever touches this section.
 */
function partitionProjects(projects) {
  const featuredProjects = projects.filter((project) => project.acf?.featured_project);

  return {
    featuredProjects: featuredProjects.slice(0, FEATURED_LIMIT),
    allProjects: projects,
  };
}

/**
 * Builds the "All"-first, alphabetically sorted filter list from every
 * project's service_terms. Deduped by slug so a service that appears on
 * multiple projects is offered only once.
 */
function buildServiceFilters(allProjects) {
  const servicesBySlug = new Map();

  allProjects.forEach((project) => {
    (project.service_terms || []).forEach((term) => {
      if (term?.slug && !servicesBySlug.has(term.slug)) {
        servicesBySlug.set(term.slug, decodeHtmlEntities(term.name || term.slug));
      }
    });
  });

  const services = Array.from(servicesBySlug, ([slug, name]) => ({ slug, name })).sort(
    (a, b) => a.name.localeCompare(b.name),
  );

  return [{ slug: null, name: "All" }, ...services];
}

/**
 * Precomputed once per project (title + ACF client name + service names,
 * lowercased) so every keystroke is a cheap substring check instead of
 * re-decoding/re-joining fields on each render.
 */
function buildProjectSearchIndex(allProjects) {
  const index = new Map();

  allProjects.forEach((project) => {
    const title = decodeHtmlEntities(project.title?.rendered || "");
    const clientName = decodeHtmlEntities(project.acf?.client_name || "");
    const services = (project.service_terms || [])
      .map((term) => decodeHtmlEntities(term.name || ""))
      .join(" ");
    index.set(project.id, `${title} ${clientName} ${services}`.toLowerCase());
  });

  return index;
}

/**
 * Case-insensitive partial match against the precomputed search index.
 * Leading/trailing whitespace is ignored; an empty query matches everything.
 */
function applySearch(projects, query, searchIndex) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return projects;
  return projects.filter((project) => (searchIndex.get(project.id) || "").includes(normalized));
}

/**
 * Filters the in-memory project list by service slug (never by name, so
 * a future rename of a service term doesn't break the active filter).
 */
function applyServiceFilter(projects, activeSlug) {
  if (!activeSlug) return projects;
  return projects.filter((project) =>
    (project.service_terms || []).some((term) => term.slug === activeSlug),
  );
}

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get("q") || "",
    slug: params.get("service") || null,
  };
}

function writeStateToUrl(search, slug) {
  const url = new URL(window.location.href);
  if (search.trim()) {
    url.searchParams.set("q", search.trim());
  } else {
    url.searchParams.delete("q");
  }
  if (slug) {
    url.searchParams.set("service", slug);
  } else {
    url.searchParams.delete("service");
  }
  window.history.replaceState(history.state, "", url);
}

function setActiveChip(container, activeSlug) {
  container.querySelectorAll(".projects-service-filters__chip").forEach((chip) => {
    const isActive = (chip.dataset.slug || null) === (activeSlug || null);
    chip.classList.toggle("is-active", isActive);
    chip.setAttribute("aria-pressed", String(isActive));
  });
}

function renderServiceFilters(container, filters, activeSlug, onSelect) {
  container.innerHTML = "";

  filters.forEach(({ slug, name }) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "projects-service-filters__chip";
    chip.textContent = name;
    chip.dataset.slug = slug || "";
    chip.setAttribute("aria-pressed", String(slug === activeSlug));
    if (slug === activeSlug) chip.classList.add("is-active");

    chip.addEventListener("click", () => onSelect(slug));
    container.appendChild(chip);
  });
}

function renderProjects(grid, projects, emptyMessage, emptyStateOptions) {
  grid.innerHTML = "";

  if (!projects.length) {
    showState(grid, emptyMessage, emptyStateOptions);
    return;
  }

  const fragment = document.createDocumentFragment();
  projects.forEach((project) =>
    fragment.appendChild(renderProjectCard(buildCardData(project))),
  );
  grid.appendChild(fragment);

  revealProjectCardsOnScroll(Array.from(grid.querySelectorAll(".project-card")));
}

function updateSearchClearVisibility(clearBtn, value) {
  if (clearBtn) clearBtn.hidden = !value;
}

/**
 * Owns search/service-filter state for the All Projects grid and re-renders
 * it from that single source of truth. Neither the search input nor the
 * service chips ever touch the DOM directly — they only report intent
 * (search text / selected slug) back to this controller, which runs the
 * shared allProjects -> applySearch -> applyServiceFilter -> renderProjects
 * pipeline and centralizes rendering.
 */
function createProjectsController({ allGrid, searchInput, searchClearBtn, filterBar }, allProjects) {
  const searchIndex = buildProjectSearchIndex(allProjects);
  const state = { search: "", activeSlug: null };

  function render() {
    const searched = applySearch(allProjects, state.search, searchIndex);
    const filtered = applyServiceFilter(searched, state.activeSlug);
    const hasActiveFilter = Boolean(state.search.trim() || state.activeSlug);

    renderProjects(
      allGrid,
      filtered,
      hasActiveFilter ? "No projects match your search." : "No projects found.",
      hasActiveFilter
        ? { actions: [{ label: "Clear Filters", onClick: clearFilters }] }
        : undefined,
    );
  }

  function setSearch(value) {
    state.search = value;
    writeStateToUrl(state.search, state.activeSlug);
    render();
  }

  function setService(slug) {
    state.activeSlug = slug;
    setActiveChip(filterBar, slug);
    writeStateToUrl(state.search, state.activeSlug);
    render();
  }

  function clearFilters() {
    state.search = "";
    state.activeSlug = null;
    if (searchInput) searchInput.value = "";
    updateSearchClearVisibility(searchClearBtn, "");
    setActiveChip(filterBar, null);
    writeStateToUrl(state.search, state.activeSlug);
    render();
  }

  return { state, render, setSearch, setService, clearFilters };
}

async function loadProjects(refs, initialUrlState) {
  const { featuredGrid, allGrid, filterBar, searchInput, searchClearBtn } = refs;

  showState(featuredGrid, "Loading projects…");
  showState(allGrid, "Loading projects…");

  try {
    const projects = await fetchAllProjects();
    const { featuredProjects, allProjects } = partitionProjects(projects);
    renderProjects(
      featuredGrid,
      featuredProjects,
      "No featured projects published yet — check back soon.",
    );

    const filters = buildServiceFilters(allProjects);
    const validSlugs = new Set(filters.map((filter) => filter.slug));
    const initialSlug = validSlugs.has(initialUrlState.slug) ? initialUrlState.slug : null;

    const controller = createProjectsController(
      { allGrid, searchInput, searchClearBtn, filterBar },
      allProjects,
    );
    controller.state.search = initialUrlState.search;
    controller.state.activeSlug = initialSlug;
    writeStateToUrl(controller.state.search, controller.state.activeSlug);

    if (searchInput) searchInput.value = initialUrlState.search;
    updateSearchClearVisibility(searchClearBtn, initialUrlState.search);

    if (filterBar) renderServiceFilters(filterBar, filters, initialSlug, controller.setService);

    if (searchInput) {
      const debouncedSetSearch = debounce(
        (value) => controller.setSearch(value),
        SEARCH_DEBOUNCE_MS,
      );
      searchInput.addEventListener("input", () => {
        updateSearchClearVisibility(searchClearBtn, searchInput.value);
        debouncedSetSearch(searchInput.value);
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        updateSearchClearVisibility(searchClearBtn, "");
        controller.setSearch("");
        if (searchInput) searchInput.focus();
      });
    }

    controller.render();
  } catch (err) {
    console.error("Error loading projects:", err);
    const retry = () => loadProjects(refs, initialUrlState);
    showState(featuredGrid, "We couldn’t load projects right now.", {
      actions: [{ label: "Try Again", onClick: retry }],
    });
    showState(allGrid, "We couldn’t load projects right now.", {
      actions: [{ label: "Try Again", onClick: retry }],
    });
  }
}

function init() {
  const refs = {
    featuredGrid: document.getElementById("projectsFeaturedBrandsGrid"),
    allGrid: document.getElementById("projectsLogoGrid"),
    filterBar: document.getElementById("projectsServiceFilters"),
    searchInput: document.getElementById("projectsSearchInput"),
    searchClearBtn: document.getElementById("projectsSearchClear"),
  };
  if (!refs.featuredGrid || !refs.allGrid) return;
  renderBreadcrumbs("projects");
  loadProjects(refs, readStateFromUrl());
}

document.addEventListener("DOMContentLoaded", init);
