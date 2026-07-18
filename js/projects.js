import { decodeHtmlEntities } from "./wp-utils.js";
import {
  fetchAllProjects,
  buildProjectCardData,
  isRenderableProject,
} from "./project-utils.js";
import {
  renderProjectCard,
  revealProjectCardsOnScroll,
} from "../assets/js/components/project-card.js";
import { renderBreadcrumbs } from "./breadcrumbs.js";
import { showState } from "./shared/loading-state.js";
import { track } from "./shared/analytics.js";

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

function renderProjects(grid, projects, emptyMessage, emptyStateOptions, source) {
  grid.innerHTML = "";

  if (!projects.length) {
    showState(grid, emptyMessage, emptyStateOptions);
    return;
  }

  const fragment = document.createDocumentFragment();
  projects.forEach((project) => {
    const cardData = buildCardData(project);
    const card = renderProjectCard(cardData);
    card.addEventListener("click", () =>
      track("project_card_click", { slug: project.slug, title: cardData.title, source }),
    );
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);

  revealProjectCardsOnScroll(Array.from(grid.querySelectorAll(".project-card")), grid);
}

function updateSearchClearVisibility(clearBtn, value) {
  if (clearBtn) clearBtn.hidden = !value;
}

/**
 * Moves keyboard focus to `container` after a dynamic update destroys the
 * control the user just activated (e.g. the "Try Again" button inside a
 * grid that gets wiped and re-rendered) — otherwise focus silently falls
 * back to <body> and the user loses their place on the page. Grids are
 * plain, non-interactive containers, so tabindex="-1" is added once to let
 * them receive this programmatic focus without joining the normal Tab order.
 */
function focusAfterUpdate(container) {
  if (!container) return;
  if (!container.hasAttribute("tabindex")) container.setAttribute("tabindex", "-1");
  container.focus();
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
      "all",
    );

    return filtered.length;
  }

  function setSearch(value) {
    state.search = value;
    writeStateToUrl(state.search, state.activeSlug);
    const resultCount = render();

    const query = state.search.trim();
    if (query) {
      track("project_search", { query, resultCount });
      if (resultCount === 0) track("project_search_zero_results", { query });
    }
  }

  function setService(slug) {
    const previousSlug = state.activeSlug;
    state.activeSlug = slug;
    setActiveChip(filterBar, slug);
    writeStateToUrl(state.search, state.activeSlug);
    render();

    if (slug && slug !== previousSlug) {
      track("service_filter_selected", { service: slug });
    } else if (!slug && previousSlug) {
      track("service_filter_cleared");
    }
  }

  function clearFilters() {
    const hadServiceFilter = Boolean(state.activeSlug);
    state.search = "";
    state.activeSlug = null;
    if (searchInput) searchInput.value = "";
    updateSearchClearVisibility(searchClearBtn, "");
    setActiveChip(filterBar, null);
    writeStateToUrl(state.search, state.activeSlug);
    render();
    if (hadServiceFilter) track("service_filter_cleared");
    // The "Clear Filters" button itself lives inside the grid render()
    // just wiped, so keyboard focus would otherwise silently fall back to
    // <body> — return it to the search input, the control this action reset.
    if (searchInput) searchInput.focus();
  }

  return { state, render, setSearch, setService, clearFilters };
}

/**
 * searchInput/searchClearBtn live outside the grids loadProjects()
 * wipes-and-rebuilds on every call, so — unlike the grids and filter chips —
 * they survive a failed-then-retried load. Their listeners are therefore
 * wired up exactly once (from init(), never from loadProjects() itself) and
 * always dispatch to whatever controller is currently active via this box,
 * so a retry can swap the controller without ever double-attaching a
 * listener to the persistent input/button.
 */
function attachSearchListeners({ searchInput, searchClearBtn }, controllerBox) {
  if (searchInput) {
    const debouncedSetSearch = debounce(
      (value) => controllerBox.current?.setSearch(value),
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
      controllerBox.current?.setSearch("");
      if (searchInput) searchInput.focus();
    });
  }
}

async function loadProjects(refs, initialUrlState, controllerBox) {
  const { featuredGrid, allGrid, filterBar, searchInput, searchClearBtn } = refs;

  showState(featuredGrid, "Loading projects…");
  showState(allGrid, "Loading projects…");

  try {
    const projects = await fetchAllProjects();
    const { featuredProjects, allProjects } = partitionProjects(
      projects.filter(isRenderableProject),
    );
    renderProjects(
      featuredGrid,
      featuredProjects,
      "No featured projects published yet — check back soon.",
      undefined,
      "featured",
    );

    const filters = buildServiceFilters(allProjects);
    const validSlugs = new Set(filters.map((filter) => filter.slug));
    const initialSlug = validSlugs.has(initialUrlState.slug) ? initialUrlState.slug : null;

    const controller = createProjectsController(
      { allGrid, searchInput, searchClearBtn, filterBar },
      allProjects,
    );
    controllerBox.current = controller;
    controller.state.search = initialUrlState.search;
    controller.state.activeSlug = initialSlug;
    writeStateToUrl(controller.state.search, controller.state.activeSlug);

    if (searchInput) searchInput.value = initialUrlState.search;
    updateSearchClearVisibility(searchClearBtn, initialUrlState.search);

    if (filterBar) renderServiceFilters(filterBar, filters, initialSlug, controller.setService);

    controller.render();
  } catch (err) {
    console.error("Error loading projects:", err);
    // The "Try Again" button lives inside featuredGrid/allGrid, both of
    // which get wiped and re-rendered on retry — return focus to the first
    // grid once that finishes so it isn't unexpectedly lost to <body>.
    const retry = () =>
      loadProjects(refs, initialUrlState, controllerBox).then(() => focusAfterUpdate(featuredGrid));
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
  track("projects_page_view");
  renderBreadcrumbs("projects");

  const controllerBox = { current: null };
  attachSearchListeners(refs, controllerBox);
  loadProjects(refs, readStateFromUrl(), controllerBox);
}

document.addEventListener("DOMContentLoaded", init);
